import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import APKManager from '../services/APKManager';

const router = Router();

// Configure multer for APK uploads
const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'app-' + uniqueSuffix + '.apk');
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '524288000') // 500MB default
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(new Error('Only .apk files are allowed'));
    }
  }
});

let apkManager: APKManager;

export function initAPKRoutes(manager: APKManager) {
  apkManager = manager;
  return router;
}

/**
 * POST /api/apk/upload - Upload APK file
 */
router.post('/upload', upload.single('apk'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'NO_FILE',
        message: 'No APK file uploaded'
      });
    }

    const apkPath = req.file.path;
    const isValid = await apkManager.validateAPK(apkPath);

    if (!isValid) {
      // Clean up invalid file
      fs.unlinkSync(apkPath);
      return res.status(400).json({
        error: 'INVALID_APK',
        message: 'Invalid APK file'
      });
    }

    res.json({
      success: true,
      apkPath,
      filename: req.file.filename,
      size: req.file.size
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'UPLOAD_FAILED',
      message: err.message
    });
  }
});

/**
 * POST /api/apk/install - Install APK on devices
 */
router.post('/install', async (req: Request, res: Response) => {
  try {
    const { deviceIds, apkPath } = req.body;

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'deviceIds array is required'
      });
    }

    if (!apkPath) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'apkPath is required'
      });
    }

    // Check if APK file exists
    if (!fs.existsSync(apkPath)) {
      return res.status(404).json({
        error: 'APK_NOT_FOUND',
        message: 'APK file not found'
      });
    }

    // Install on all devices
    const results = await apkManager.installAPK(deviceIds, apkPath);

    // Clean up APK file after installation
    try {
      fs.unlinkSync(apkPath);
    } catch (err) {
      console.error('Failed to clean up APK file:', err);
    }

    // Convert Map to object for JSON response
    const resultsObj: any = {};
    results.forEach((result, deviceId) => {
      resultsObj[deviceId] = result;
    });

    res.json({
      success: true,
      results: resultsObj
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'INSTALLATION_FAILED',
      message: err.message
    });
  }
});

/**
 * GET /api/apk/progress/:deviceId - Get installation progress
 */
router.get('/progress/:deviceId', (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const progress = apkManager.getInstallProgress(deviceId);

    if (!progress) {
      return res.status(404).json({
        error: 'NO_PROGRESS',
        message: 'No installation progress found for this device'
      });
    }

    res.json({ progress });
  } catch (err: any) {
    res.status(500).json({
      error: 'PROGRESS_FETCH_FAILED',
      message: err.message
    });
  }
});

export default router;
