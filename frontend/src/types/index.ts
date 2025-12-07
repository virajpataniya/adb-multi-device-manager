export interface Device {
  id: string;
  model: string;
  androidVersion: string;
  status: 'device' | 'offline' | 'unauthorized';
  connectionType: 'usb' | 'wireless';
  batteryLevel?: number;
  screenResolution?: {
    width: number;
    height: number;
  };
}

export interface InstallProgress {
  deviceId: string;
  status: 'pending' | 'installing' | 'success' | 'failed';
  progress: number;
  error?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}
