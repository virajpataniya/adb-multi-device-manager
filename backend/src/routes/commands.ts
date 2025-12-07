import { Router, Request, Response } from 'express';
import ADBExecutor from '../services/ADBExecutor';

const router = Router();

let adbExecutor: ADBExecutor;
const commandHistory: string[] = [];
const MAX_HISTORY = 50;

export function initCommandRoutes(executor: ADBExecutor) {
  adbExecutor = executor;
  return router;
}

/**
 * POST /api/commands/execute - Execute ADB command
 */
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { command, deviceIds } = req.body;

    if (!command) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'command is required'
      });
    }

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'deviceIds array is required'
      });
    }

    // Sanitize command - remove 'adb' prefix if present
    let sanitizedCommand = command.trim();
    if (sanitizedCommand.startsWith('adb ')) {
      sanitizedCommand = sanitizedCommand.substring(4);
    }

    // Add to history
    if (!commandHistory.includes(sanitizedCommand)) {
      commandHistory.unshift(sanitizedCommand);
      if (commandHistory.length > MAX_HISTORY) {
        commandHistory.pop();
      }
    }

    // Execute on all devices
    const results: any = {};
    
    for (const deviceId of deviceIds) {
      try {
        const result = await adbExecutor.execute(deviceId, sanitizedCommand);
        results[deviceId] = {
          success: result.success,
          output: result.output,
          error: result.error,
          exitCode: result.exitCode
        };
      } catch (err: any) {
        results[deviceId] = {
          success: false,
          output: '',
          error: err.message,
          exitCode: -1
        };
      }
    }

    res.json({
      success: true,
      command: sanitizedCommand,
      results
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'COMMAND_EXECUTION_FAILED',
      message: err.message
    });
  }
});

/**
 * GET /api/commands/history - Get command history
 */
router.get('/history', (req: Request, res: Response) => {
  res.json({
    history: commandHistory
  });
});

export default router;
