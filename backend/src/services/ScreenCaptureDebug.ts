/**
 * Debug utility for screen capture performance monitoring
 */

interface CaptureStats {
  totalFrames: number;
  successfulFrames: number;
  failedFrames: number;
  timeoutFrames: number;
  avgCaptureTime: number;
  lastFrameTime: number;
}

class ScreenCaptureDebug {
  private stats: Map<string, CaptureStats> = new Map();
  private captureTimes: Map<string, number[]> = new Map();

  startCapture(deviceId: string): void {
    if (!this.stats.has(deviceId)) {
      this.stats.set(deviceId, {
        totalFrames: 0,
        successfulFrames: 0,
        failedFrames: 0,
        timeoutFrames: 0,
        avgCaptureTime: 0,
        lastFrameTime: Date.now()
      });
      this.captureTimes.set(deviceId, []);
    }
  }

  recordFrameStart(deviceId: string): number {
    return Date.now();
  }

  recordFrameSuccess(deviceId: string, startTime: number, frameSize: number): void {
    const stats = this.stats.get(deviceId);
    if (!stats) return;

    const duration = Date.now() - startTime;
    const times = this.captureTimes.get(deviceId) || [];
    
    times.push(duration);
    if (times.length > 20) times.shift(); // Keep last 20
    
    stats.totalFrames++;
    stats.successfulFrames++;
    stats.lastFrameTime = Date.now();
    stats.avgCaptureTime = times.reduce((a, b) => a + b, 0) / times.length;

    this.captureTimes.set(deviceId, times);
  }

  recordFrameFailure(deviceId: string, reason: 'error' | 'timeout'): void {
    const stats = this.stats.get(deviceId);
    if (!stats) return;

    stats.totalFrames++;
    stats.failedFrames++;
    if (reason === 'timeout') {
      stats.timeoutFrames++;
    }
  }

  getStats(deviceId: string): CaptureStats | null {
    return this.stats.get(deviceId) || null;
  }

  printStats(deviceId: string): void {
    const stats = this.stats.get(deviceId);
    if (!stats) {
      console.log(`No stats for device ${deviceId}`);
      return;
    }

    const successRate = ((stats.successfulFrames / stats.totalFrames) * 100).toFixed(1);
    const timeSinceLastFrame = Date.now() - stats.lastFrameTime;

    console.log(`\n📊 Screen Capture Stats for ${deviceId}:`);
    console.log(`   Total Frames: ${stats.totalFrames}`);
    console.log(`   Successful: ${stats.successfulFrames} (${successRate}%)`);
    console.log(`   Failed: ${stats.failedFrames}`);
    console.log(`   Timeouts: ${stats.timeoutFrames}`);
    console.log(`   Avg Capture Time: ${stats.avgCaptureTime.toFixed(0)}ms`);
    console.log(`   Time Since Last Frame: ${timeSinceLastFrame}ms`);
    console.log(`   Effective FPS: ${(1000 / stats.avgCaptureTime).toFixed(1)}\n`);
  }

  stopCapture(deviceId: string): void {
    this.printStats(deviceId);
    this.stats.delete(deviceId);
    this.captureTimes.delete(deviceId);
  }
}

export default new ScreenCaptureDebug();
