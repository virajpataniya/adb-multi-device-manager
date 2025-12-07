import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import ADBExecutor from './services/ADBExecutor';
import DeviceManager from './services/DeviceManager';
import ScreenCaptureService from './services/ScreenCaptureService';
import APKManager from './services/APKManager';
import { initDeviceRoutes } from './routes/devices';
import { initAPKRoutes } from './routes/apk';
import { initCommandRoutes } from './routes/commands';
import { setupWebSocketHandlers } from './websocket/handlers';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;

// Initialize services
const adbExecutor = new ADBExecutor(process.env.ADB_PATH || 'adb');
const deviceManager = new DeviceManager(adbExecutor);
const screenCaptureService = new ScreenCaptureService(adbExecutor, io);
const apkManager = new APKManager(adbExecutor, io);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/devices', initDeviceRoutes(deviceManager));
app.use('/api/apk', initAPKRoutes(apkManager));
app.use('/api/commands', initCommandRoutes(adbExecutor));

// WebSocket handlers
setupWebSocketHandlers(io, deviceManager, screenCaptureService);

// Error handling middleware
interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    error: err.code || 'INTERNAL_ERROR',
    message: message
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Endpoint not found'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  
  // Start device monitoring
  deviceManager.startMonitoring();
});

export { app, io, deviceManager, screenCaptureService };
