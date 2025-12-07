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

export interface CommandResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

export interface InstallResult {
  success: boolean;
  deviceId: string;
  error?: string;
  duration: number;
}

export interface InstallProgress {
  deviceId: string;
  status: 'pending' | 'installing' | 'success' | 'failed';
  progress: number;
  error?: string;
}

export interface AppInfo {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
}

export interface LogEntry {
  timestamp: Date;
  level: 'V' | 'D' | 'I' | 'W' | 'E' | 'F';
  tag: string;
  pid: number;
  message: string;
}

export interface LogFilter {
  level?: 'V' | 'D' | 'I' | 'W' | 'E' | 'F';
  tag?: string;
  search?: string;
}

export interface TransferProgress {
  transferId: string;
  deviceId: string;
  status: 'pending' | 'transferring' | 'complete' | 'failed';
  bytesTransferred: number;
  totalBytes: number;
}
