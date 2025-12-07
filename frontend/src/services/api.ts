import axios from 'axios';
import { Device } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const deviceAPI = {
  getDevices: async (): Promise<Device[]> => {
    const response = await api.get('/devices');
    return response.data.devices;
  },

  getDeviceInfo: async (deviceId: string): Promise<Device> => {
    const response = await api.get(`/devices/${deviceId}`);
    return response.data.device;
  },

  connectWireless: async (ip: string, port: number = 5555): Promise<boolean> => {
    const response = await api.post('/devices/connect', { ip, port });
    return response.data.success;
  },

  disconnectDevice: async (deviceId: string): Promise<void> => {
    await api.delete(`/devices/${deviceId}/disconnect`);
  }
};

export const apkAPI = {
  uploadAPK: async (file: File): Promise<{ apkPath: string }> => {
    const formData = new FormData();
    formData.append('apk', file);
    
    const response = await api.post('/apk/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  installAPK: async (deviceIds: string[], apkPath: string): Promise<any> => {
    const response = await api.post('/apk/install', { deviceIds, apkPath });
    return response.data.results;
  },

  getInstallProgress: async (deviceId: string): Promise<any> => {
    const response = await api.get(`/apk/progress/${deviceId}`);
    return response.data.progress;
  }
};

export const commandAPI = {
  execute: async (command: string, deviceIds: string[]): Promise<any> => {
    const response = await api.post('/commands/execute', { command, deviceIds });
    return response.data.results;
  },

  getHistory: async (): Promise<string[]> => {
    const response = await api.get('/commands/history');
    return response.data.history;
  }
};

export default api;
