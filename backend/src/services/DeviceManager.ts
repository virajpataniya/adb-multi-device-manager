import { EventEmitter } from 'events';
import { Device } from '../types';
import ADBExecutor from './ADBExecutor';

class DeviceManager extends EventEmitter {
  private adbExecutor: ADBExecutor;
  private devices: Map<string, Device>;
  private monitoringInterval: NodeJS.Timeout | null;
  private savedWirelessDevices: Set<string>;

  constructor(adbExecutor: ADBExecutor) {
    super();
    this.adbExecutor = adbExecutor;
    this.devices = new Map();
    this.monitoringInterval = null;
    this.savedWirelessDevices = new Set();
  }

  /**
   * Get all connected devices
   */
  async getDevices(): Promise<Device[]> {
    await this.refreshDevices();
    return Array.from(this.devices.values());
  }

  /**
   * Get specific device info
   */
  async getDeviceInfo(deviceId: string): Promise<Device | null> {
    const device = this.devices.get(deviceId);
    if (!device) {
      return null;
    }

    // Fetch additional info
    try {
      const battery = await this.getBatteryLevel(deviceId);
      const resolution = await this.getScreenResolution(deviceId);
      
      device.batteryLevel = battery;
      device.screenResolution = resolution;
      
      this.devices.set(deviceId, device);
    } catch (err) {
      console.error(`Failed to get device info for ${deviceId}:`, err);
    }

    return device;
  }

  /**
   * Connect to wireless device
   */
  async connectWireless(ip: string, port: number = 5555): Promise<boolean> {
    try {
      const address = `${ip}:${port}`;
      const result = await this.adbExecutor.execute('', `connect ${address}`);
      const success = result.success && result.output.includes('connected');
      
      if (success) {
        // Save for auto-reconnect
        this.savedWirelessDevices.add(address);
        console.log(`Saved wireless device: ${address}`);
      }
      
      return success;
    } catch (err) {
      console.error('Wireless connection failed:', err);
      return false;
    }
  }

  /**
   * Reconnect to saved wireless devices
   */
  private async reconnectSavedDevices(): Promise<void> {
    if (this.savedWirelessDevices.size === 0) {
      return;
    }

    console.log(`Attempting to reconnect ${this.savedWirelessDevices.size} saved wireless device(s)...`);
    
    for (const address of this.savedWirelessDevices) {
      try {
        const result = await this.adbExecutor.execute('', `connect ${address}`);
        if (result.success && result.output.includes('connected')) {
          console.log(`✓ Reconnected to ${address}`);
        } else {
          console.log(`✗ Failed to reconnect to ${address}`);
        }
      } catch (err) {
        console.log(`✗ Error reconnecting to ${address}`);
      }
    }
  }

  /**
   * Disconnect device
   */
  async disconnectDevice(deviceId: string): Promise<void> {
    try {
      await this.adbExecutor.execute(deviceId, 'disconnect');
      this.devices.delete(deviceId);
      this.emit('device:disconnected', { deviceId });
    } catch (err) {
      console.error(`Failed to disconnect device ${deviceId}:`, err);
    }
  }

  /**
   * Start monitoring devices
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      return;
    }

    console.log('Starting device monitoring...');
    
    // Try to reconnect saved wireless devices
    this.reconnectSavedDevices();
    
    // Initial scan
    this.refreshDevices();

    // Poll every 2 seconds
    this.monitoringInterval = setInterval(() => {
      this.refreshDevices();
    }, 2000);
  }

  /**
   * Stop monitoring devices
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('Stopped device monitoring');
    }
  }

  /**
   * Refresh device list
   */
  private async refreshDevices(): Promise<void> {
    try {
      const result = await this.adbExecutor.execute('', 'devices -l');
      
      if (!result.success) {
        console.error('Failed to get device list:', result.error);
        return;
      }

      const newDevices = this.parseDeviceList(result.output);
      const currentDeviceIds = new Set(this.devices.keys());
      const newDeviceIds = new Set(newDevices.map(d => d.id));

      // Detect new devices
      for (const device of newDevices) {
        if (!currentDeviceIds.has(device.id)) {
          this.devices.set(device.id, device);
          this.emit('device:connected', { device });
          console.log(`Device connected: ${device.id} (${device.model})`);
        } else {
          // Update existing device
          const existing = this.devices.get(device.id)!;
          if (existing.status !== device.status) {
            this.devices.set(device.id, { ...existing, ...device });
            this.emit('device:updated', { device: this.devices.get(device.id) });
          }
        }
      }

      // Detect disconnected devices
      for (const deviceId of currentDeviceIds) {
        if (!newDeviceIds.has(deviceId)) {
          this.devices.delete(deviceId);
          this.emit('device:disconnected', { deviceId });
          console.log(`Device disconnected: ${deviceId}`);
        }
      }
    } catch (err) {
      console.error('Error refreshing devices:', err);
    }
  }

  /**
   * Parse device list output
   */
  private parseDeviceList(output: string): Device[] {
    const devices: Device[] = [];
    const lines = output.split('\n').slice(1); // Skip header

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;

      const id = parts[0];
      const status = parts[1] as 'device' | 'offline' | 'unauthorized';

      // Parse device info from additional fields
      let model = 'Unknown';
      let connectionType: 'usb' | 'wireless' = 'usb';

      for (const part of parts.slice(2)) {
        if (part.startsWith('model:')) {
          model = part.split(':')[1].replace(/_/g, ' ');
        }
      }

      // Detect wireless connection
      if (id.includes(':')) {
        connectionType = 'wireless';
      }

      devices.push({
        id,
        model,
        androidVersion: '',
        status,
        connectionType
      });
    }

    return devices;
  }

  /**
   * Get battery level
   */
  private async getBatteryLevel(deviceId: string): Promise<number | undefined> {
    try {
      const output = await this.adbExecutor.shell(deviceId, 'dumpsys battery | grep level');
      const match = output.match(/level:\s*(\d+)/);
      return match ? parseInt(match[1]) : undefined;
    } catch (err) {
      return undefined;
    }
  }

  /**
   * Get screen resolution
   */
  private async getScreenResolution(deviceId: string): Promise<{ width: number; height: number } | undefined> {
    try {
      const output = await this.adbExecutor.shell(deviceId, 'wm size');
      const match = output.match(/(\d+)x(\d+)/);
      if (match) {
        return {
          width: parseInt(match[1]),
          height: parseInt(match[2])
        };
      }
      return undefined;
    } catch (err) {
      return undefined;
    }
  }
}

export default DeviceManager;
