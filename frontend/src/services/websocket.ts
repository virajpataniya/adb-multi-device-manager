import { io, Socket } from 'socket.io-client';
import { useDeviceStore } from '../stores/deviceStore';
import { useInstallationStore } from '../stores/installationStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3000';

let socket: Socket | null = null;

export const connectWebSocket = () => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
  });

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected');
  });

  // Device events
  socket.on('devices:initial', (data: { devices: any[] }) => {
    useDeviceStore.getState().setDevices(data.devices);
  });

  socket.on('device:connected', (data: { device: any }) => {
    useDeviceStore.getState().addDevice(data.device);
  });

  socket.on('device:disconnected', (data: { deviceId: string }) => {
    useDeviceStore.getState().removeDevice(data.deviceId);
  });

  socket.on('device:updated', (data: { device: any }) => {
    useDeviceStore.getState().updateDevice(data.device.id, data.device);
  });

  // Installation progress events
  socket.on('install:progress', (progress: any) => {
    useInstallationStore.getState().setInstallProgress(progress.deviceId, progress);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Screen mirroring functions
export const startScreenCapture = (deviceId: string) => {
  if (socket) {
    socket.emit('screen:start', { deviceId });
  }
};

export const stopScreenCapture = (deviceId: string) => {
  if (socket) {
    socket.emit('screen:stop', { deviceId });
  }
};

export const sendTouchEvent = (deviceId: string, x: number, y: number, action: string) => {
  if (socket) {
    socket.emit('screen:touch', { deviceId, x, y, action });
  }
};

export const sendKeyEvent = (deviceId: string, keyCode: number) => {
  if (socket) {
    socket.emit('screen:key', { deviceId, keyCode });
  }
};

export const sendTextInput = (deviceId: string, text: string) => {
  if (socket) {
    socket.emit('screen:text', { deviceId, text });
  }
};

export const sendSwipeGesture = (deviceId: string, x1: number, y1: number, x2: number, y2: number, duration: number = 300) => {
  if (socket) {
    socket.emit('screen:swipe', { deviceId, x1, y1, x2, y2, duration });
  }
};
