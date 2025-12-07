import { spawn, ChildProcess } from 'child_process';
import { CommandResult } from '../types';

class ADBExecutor {
  private adbPath: string;
  private commandQueues: Map<string, Promise<any>>;

  constructor(adbPath: string = 'adb') {
    this.adbPath = adbPath;
    this.commandQueues = new Map();
  }

  /**
   * Execute an ADB command
   */
  async execute(deviceId: string, command: string, timeout: number = 30000): Promise<CommandResult> {
    const args = ['-s', deviceId, ...command.split(' ')];
    return this.runCommand(args, timeout);
  }

  /**
   * Execute a shell command on device
   */
  async shell(deviceId: string, shellCommand: string, timeout: number = 30000): Promise<string> {
    const result = await this.execute(deviceId, `shell ${shellCommand}`, timeout);
    if (!result.success) {
      throw new Error(result.error || 'Shell command failed');
    }
    return result.output.trim();
  }

  /**
   * Install APK on device
   */
  async install(deviceId: string, apkPath: string): Promise<CommandResult> {
    const args = ['-s', deviceId, 'install', '-r', apkPath];
    return this.runCommand(args, 120000); // 2 minute timeout for installation
  }

  /**
   * Uninstall app from device
   */
  async uninstall(deviceId: string, packageName: string): Promise<boolean> {
    const result = await this.execute(deviceId, `uninstall ${packageName}`);
    return result.success && result.output.includes('Success');
  }

  /**
   * Push file to device
   */
  async push(deviceId: string, localPath: string, remotePath: string): Promise<void> {
    const result = await this.execute(deviceId, `push "${localPath}" "${remotePath}"`, 60000);
    if (!result.success) {
      throw new Error(result.error || 'Push failed');
    }
  }

  /**
   * Pull file from device
   */
  async pull(deviceId: string, remotePath: string, localPath: string): Promise<void> {
    const result = await this.execute(deviceId, `pull "${remotePath}" "${localPath}"`, 60000);
    if (!result.success) {
      throw new Error(result.error || 'Pull failed');
    }
  }

  /**
   * Run ADB command and return result
   */
  private runCommand(args: string[], timeout: number): Promise<CommandResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';

      const process = spawn(this.adbPath, args);

      const timeoutId = setTimeout(() => {
        process.kill();
        resolve({
          success: false,
          output: stdout,
          error: 'Command timeout',
          exitCode: -1
        });
      }, timeout);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;
        
        resolve({
          success: code === 0,
          output: stdout,
          error: code !== 0 ? stderr : undefined,
          exitCode: code || 0
        });
      });

      process.on('error', (err) => {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          output: stdout,
          error: err.message,
          exitCode: -1
        });
      });
    });
  }

  /**
   * Queue command execution per device to prevent conflicts
   */
  private async queueCommand<T>(deviceId: string, command: () => Promise<T>): Promise<T> {
    const existingQueue = this.commandQueues.get(deviceId) || Promise.resolve();
    
    const newQueue = existingQueue.then(() => command()).catch((err) => {
      console.error(`Command failed for device ${deviceId}:`, err);
      throw err;
    });
    
    this.commandQueues.set(deviceId, newQueue);
    
    return newQueue;
  }
}

export default ADBExecutor;
