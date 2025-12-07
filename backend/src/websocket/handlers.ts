import { Server as SocketIOServer, Socket } from 'socket.io';
import DeviceManager from '../services/DeviceManager';
import ScreenCaptureService from '../services/ScreenCaptureService';

export function setupWebSocketHandlers(
  io: SocketIOServer, 
  deviceManager: DeviceManager,
  screenCaptureService?: ScreenCaptureService
) {
  // Listen to device manager events and broadcast to all clients
  deviceManager.on('device:connected', (data) => {
    console.log('Broadcasting device:connected', data.device.id);
    io.emit('device:connected', data);
  });

  deviceManager.on('device:disconnected', (data) => {
    console.log('Broadcasting device:disconnected', data.deviceId);
    io.emit('device:disconnected', data);
  });

  deviceManager.on('device:updated', (data) => {
    io.emit('device:updated', data);
  });

  // Handle client connections
  io.on('connection', async (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send initial device list to newly connected client
    try {
      const devices = await deviceManager.getDevices();
      socket.emit('devices:initial', { devices });
    } catch (err) {
      console.error('Failed to send initial device list:', err);
    }

    // Screen capture events
    if (screenCaptureService) {
      socket.on('screen:start', async (data: { deviceId: string }) => {
        try {
          await screenCaptureService.startCapture(data.deviceId, socket.id);
          socket.emit('screen:started', { deviceId: data.deviceId });
        } catch (err: any) {
          socket.emit('screen:error', { deviceId: data.deviceId, error: err.message });
        }
      });

      socket.on('screen:stop', (data: { deviceId: string }) => {
        screenCaptureService.stopCapture(data.deviceId);
        socket.emit('screen:stopped', { deviceId: data.deviceId });
      });

      socket.on('screen:touch', async (data: { deviceId: string; x: number; y: number; action: string }) => {
        try {
          await screenCaptureService.sendTouchEvent(data.deviceId, data.x, data.y, data.action);
        } catch (err: any) {
          socket.emit('screen:error', { deviceId: data.deviceId, error: err.message });
        }
      });

      socket.on('screen:swipe', async (data: { deviceId: string; x1: number; y1: number; x2: number; y2: number; duration?: number }) => {
        try {
          await screenCaptureService.sendSwipe(data.deviceId, data.x1, data.y1, data.x2, data.y2, data.duration);
        } catch (err: any) {
          socket.emit('screen:error', { deviceId: data.deviceId, error: err.message });
        }
      });

      socket.on('screen:key', async (data: { deviceId: string; keyCode: number }) => {
        try {
          await screenCaptureService.sendKeyEvent(data.deviceId, data.keyCode);
        } catch (err: any) {
          socket.emit('screen:error', { deviceId: data.deviceId, error: err.message });
        }
      });

      socket.on('screen:text', async (data: { deviceId: string; text: string }) => {
        try {
          await screenCaptureService.sendText(data.deviceId, data.text);
        } catch (err: any) {
          socket.emit('screen:error', { deviceId: data.deviceId, error: err.message });
        }
      });
    }

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      // Clean up any active screen captures for this socket
      if (screenCaptureService) {
        // Note: In production, track which devices this socket was capturing
      }
    });
  });
}
