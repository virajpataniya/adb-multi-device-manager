import { Server as SocketIOServer } from 'socket.io';
import ADBExecutor from './ADBExecutor';
import { InstallResult, InstallProgress } from '../types';
import * as fs from 'fs';

class APKManager {
  private adbExecutor: ADBExecutor;
  private io: SocketIOServer;
  private installProgress: Map<string, InstallProgress>;

  constructor(adbExecutor: ADBExecutor, io: SocketIOServer) {
    this.adbExecutor = adbExecutor;
    this.io = io;
    this.installProgress = new Map();
  }

  /**
   * Validate APK file
   */
  async validateAPK(filePath: string): Promise<boolean> {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return false;
      }

      // Check file extension
      if (!filePath.endsWith('.apk')) {
        return false;
      }

      // Check file size (not empty)
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return false;
      }

      return true;
    } catch (err) {
      console.error('APK validation failed:', err);
      return false;
    }
  }

  /**
   * Install APK on multiple devices
   */
  async installAPK(deviceIds: string[], apkPath: string): Promise<Map<string, InstallResult>> {
    const results = new Map<string, InstallResult>();

    // Validate APK first
    const isValid = await this.validateAPK(apkPath);
    if (!isValid) {
      for (const deviceId of deviceIds) {
        results.set(deviceId, {
          success: false,
          deviceId,
          error: 'Invalid APK file',
          duration: 0
        });
      }
      return results;
    }

    // Install on all devices in parallel
    const installPromises = deviceIds.map(deviceId => 
      this.installOnDevice(deviceId, apkPath)
    );

    const installResults = await Promise.all(installPromises);

    // Map results
    installResults.forEach(result => {
      results.set(result.deviceId, result);
    });

    return results;
  }

  /**
   * Install APK on a single device
   */
  private async installOnDevice(deviceId: string, apkPath: string): Promise<InstallResult> {
    const startTime = Date.now();

    try {
      // Set initial progress
      this.updateProgress(deviceId, {
        deviceId,
        status: 'installing',
        progress: 0
      });

      // Execute installation
      const result = await this.adbExecutor.install(deviceId, apkPath);

      const duration = Date.now() - startTime;

      if (result.success && result.output.includes('Success')) {
        // Update progress to complete
        this.updateProgress(deviceId, {
          deviceId,
          status: 'success',
          progress: 100
        });

        return {
          success: true,
          deviceId,
          duration
        };
      } else {
        // Installation failed
        const error = result.error || result.output;
        
        this.updateProgress(deviceId, {
          deviceId,
          status: 'failed',
          progress: 0,
          error
        });

        return {
          success: false,
          deviceId,
          error,
          duration
        };
      }
    } catch (err: any) {
      const duration = Date.now() - startTime;
      
      this.updateProgress(deviceId, {
        deviceId,
        status: 'failed',
        progress: 0,
        error: err.message
      });

      return {
        success: false,
        deviceId,
        error: err.message,
        duration
      };
    }
  }

  /**
   * Update installation progress
   */
  private updateProgress(deviceId: string, progress: InstallProgress): void {
    this.installProgress.set(deviceId, progress);
    this.io.emit('install:progress', progress);
  }

  /**
   * Get installation progress for a device
   */
  getInstallProgress(deviceId: string): InstallProgress | undefined {
    return this.installProgress.get(deviceId);
  }

  /**
   * Clear installation progress
   */
  clearProgress(deviceId: string): void {
    this.installProgress.delete(deviceId);
  }
}

export default APKManager;
