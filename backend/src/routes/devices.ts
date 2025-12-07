import { Router, Request, Response } from 'express';
import DeviceManager from '../services/DeviceManager';

const router = Router();

let deviceManager: DeviceManager;

export function initDeviceRoutes(manager: DeviceManager) {
  deviceManager = manager;
  return router;
}

/**
 * GET /api/devices - Get all connected devices
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const devices = await deviceManager.getDevices();
    res.json({ devices });
  } catch (err: any) {
    res.status(500).json({
      error: 'DEVICE_LIST_FAILED',
      message: err.message
    });
  }
});

/**
 * GET /api/devices/:id - Get specific device info
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await deviceManager.getDeviceInfo(id);
    
    if (!device) {
      return res.status(404).json({
        error: 'DEVICE_NOT_FOUND',
        message: `Device ${id} not found`
      });
    }
    
    res.json({ device });
  } catch (err: any) {
    res.status(500).json({
      error: 'DEVICE_INFO_FAILED',
      message: err.message
    });
  }
});

/**
 * POST /api/devices/connect - Connect to wireless device
 */
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { ip, port = 5555 } = req.body;
    
    if (!ip) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'IP address is required'
      });
    }
    
    const success = await deviceManager.connectWireless(ip, port);
    
    if (success) {
      res.json({
        success: true,
        message: `Connected to ${ip}:${port}`
      });
    } else {
      res.status(400).json({
        error: 'CONNECTION_FAILED',
        message: `Failed to connect to ${ip}:${port}`
      });
    }
  } catch (err: any) {
    res.status(500).json({
      error: 'CONNECTION_ERROR',
      message: err.message
    });
  }
});

/**
 * DELETE /api/devices/:id/disconnect - Disconnect device
 */
router.delete('/:id/disconnect', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deviceManager.disconnectDevice(id);
    
    res.json({
      success: true,
      message: `Device ${id} disconnected`
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'DISCONNECT_FAILED',
      message: err.message
    });
  }
});

export default router;
