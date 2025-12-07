import { Server as SocketIOServer } from 'socket.io';
import { spawn } from 'child_process';
import ADBExecutor from './ADBExecutor';

interface CaptureSession {
  deviceId: string;
  socketId: string;
  interval: NodeJS.Timeout;
  isCapturing: boolean;
  isBusy: boolean;
}

class ScreenCaptureService {
  private adbExecutor: ADBExecutor;
  private io: SocketIOServer;
  private sessions: Map<string, CaptureSession>;
  private captureInterval: number = 200; // 5 FPS (more reliable)

  constructor(adbExecutor: ADBExecutor, io: SocketIOServer) {
    this.adbExecutor = adbExecutor;
    this.io = io;
    this.sessions = new Map();
  }

  /**
   * Start screen capture for a device
   */
  async startCapture(deviceId: string, socketId: string): Promise<void> {
    // Stop existing session if any
    this.stopCapture(deviceId);

    console.log(`Starting screen capture for device ${deviceId} on socket ${socketId}`);

    const session: CaptureSession = {
      deviceId,
      socketId,
      interval: setInterval(() => this.captureFrame(deviceId, socketId), this.captureInterval),
      isCapturing: true,
      isBusy: false
    };

    this.sessions.set(deviceId, session);

    // Capture first frame immediately
    this.captureFrame(deviceId, socketId);
  }

  /**
   * Stop screen capture for a device
   */
  stopCapture(deviceId: string): void {
    const session = this.sessions.get(deviceId);
    if (session) {
      clearInterval(session.interval);
      this.sessions.delete(deviceId);
      console.log(`Stopped screen capture for device ${deviceId}`);
    }
  }

  /**
   * Capture a single frame
   */
  private async captureFrame(deviceId: string, socketId: string): Promise<void> {
    const session = this.sessions.get(deviceId);
    if (!session || !session.isCapturing) {
      return;
    }

    // Skip if previous capture is still in progress
    if (session.isBusy) {
      return;
    }

    session.isBusy = true;

    try {
      // Use exec-out to get raw binary data
      await new Promise<void>((resolve) => {
        const process = spawn('adb', ['-s', deviceId, 'exec-out', 'screencap', '-p']);

        const chunks: Buffer[] = [];
        let resolved = false;

        process.stdout.on('data', (data: Buffer) => {
          chunks.push(data);
        });

        process.on('close', (code: number) => {
          if (!resolved) {
            resolved = true;
            if (code === 0 && chunks.length > 0) {
              const imageBuffer = Buffer.concat(chunks);
              const base64Frame = imageBuffer.toString('base64');

              // Emit frame to specific socket
              this.io.to(socketId).emit('screen:frame', {
                deviceId,
                frame: base64Frame
              });

              // Log occasionally for debugging
              const frameNum = Math.floor(Math.random() * 20);
              if (frameNum === 0) {
                console.log(`✓ Frame sent for ${deviceId}, size: ${(base64Frame.length / 1024).toFixed(2)}KB`);
              }
            } else if (code !== 0) {
              console.error(`screencap exited with code ${code} for ${deviceId}`);
            }
            resolve();
          }
        });

        process.on('error', (err: Error) => {
          if (!resolved) {
            resolved = true;
            console.error(`Failed to capture frame for ${deviceId}:`, err.message);
            resolve();
          }
        });

        // Timeout after 2 seconds
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            process.kill();
            console.warn(`⚠️  Frame capture timeout for ${deviceId}`);
            resolve();
          }
        }, 2000);
      });
    } catch (err) {
      console.error(`Failed to capture frame for ${deviceId}:`, err);
    } finally {
      if (session) {
        session.isBusy = false;
      }
    }
  }

  /**
   * Send touch event to device
   */
  async sendTouchEvent(deviceId: string, x: number, y: number, action: string): Promise<void> {
    try {
      if (action === 'tap') {
        await this.adbExecutor.shell(deviceId, `input tap ${x} ${y}`);
      }
    } catch (err) {
      console.error(`Failed to send touch event to ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Send swipe gesture to device
   */
  async sendSwipe(deviceId: string, x1: number, y1: number, x2: number, y2: number, duration: number = 300): Promise<void> {
    try {
      await this.adbExecutor.shell(deviceId, `input swipe ${x1} ${y1} ${x2} ${y2} ${duration}`);
    } catch (err) {
      console.error(`Failed to send swipe to ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Send key event to device
   */
  async sendKeyEvent(deviceId: string, keyCode: number): Promise<void> {
    try {
      await this.adbExecutor.shell(deviceId, `input keyevent ${keyCode}`);
    } catch (err) {
      console.error(`Failed to send key event to ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Send text input to device
   */
  async sendText(deviceId: string, text: string): Promise<void> {
    try {
      // Escape special characters and spaces
      const escapedText = text.replace(/ /g, '%s').replace(/'/g, "\\'");
      await this.adbExecutor.shell(deviceId, `input text '${escapedText}'`);
    } catch (err) {
      console.error(`Failed to send text to ${deviceId}:`, err);
      throw err;
    }
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount(): number {
    return this.sessions.size;
  }
}

export default ScreenCaptureService;
