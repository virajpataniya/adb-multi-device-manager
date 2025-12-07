import { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, IconButton, Button } from '@mui/material';
import { Home, ArrowBack, Apps, Close, PowerSettingsNew } from '@mui/icons-material';
import { Device } from '../types';
import { getSocket, startScreenCapture, stopScreenCapture, sendTouchEvent, sendKeyEvent, sendSwipeGesture } from '../services/websocket';

interface DeviceScreenProps {
  device: Device;
  onClose: () => void;
}

const DeviceScreen = ({ device, onClose }: DeviceScreenProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceResolutionRef = useRef<{ width: number; height: number } | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [frameReceived, setFrameReceived] = useState(false);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  
  // Swipe gesture tracking
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Start screen capture
    startScreenCapture(device.id);
    setIsCapturing(true);

    // Listen for screen frames
    const handleFrame = (data: { deviceId: string; frame: string }) => {
      if (data.deviceId !== device.id) return;

      if (!frameReceived) {
        console.log(`✓ First frame received for ${device.id}`);
      }
      setFrameReceived(true);
      setError(null);

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas ref is null');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Cannot get 2d context');
        return;
      }

      // Create image from base64
      const img = new Image();
      img.onload = () => {
        // Store original device resolution
        if (!deviceResolutionRef.current) {
          deviceResolutionRef.current = { width: img.width, height: img.height };
          console.log(`✓ Device resolution detected: ${img.width}x${img.height}`);
        }
        
        // Calculate scale to fit in viewport (max 70vh)
        const maxHeight = window.innerHeight * 0.7;
        const scale = Math.min(1, maxHeight / img.height);
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Set canvas size to scaled dimensions for display
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;

        // Clear and draw scaled image
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

        // Update FPS counter
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastFpsUpdateRef.current >= 1000) {
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          lastFpsUpdateRef.current = now;
        }
      };
      img.onerror = (e) => {
        console.error('Failed to load frame image:', e);
        setError('Failed to decode frame image');
      };
      img.src = `data:image/png;base64,${data.frame}`;
    };

    // Listen for screen events
    socket.on('screen:frame', handleFrame);
    socket.on('screen:started', (data) => {
      console.log('Screen capture started for', data.deviceId);
      setIsCapturing(true);
    });
    socket.on('screen:error', (data) => {
      console.error('Screen capture error:', data.error);
      setError(data.error);
      setIsCapturing(false);
    });

    // Cleanup
    return () => {
      socket.off('screen:frame', handleFrame);
      socket.off('screen:started');
      socket.off('screen:error');
      stopScreenCapture(device.id);
      setIsCapturing(false);
    };
  }, [device.id]);

  const getDeviceCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !deviceResolutionRef.current) return null;

    const rect = canvas.getBoundingClientRect();
    const percentX = (clientX - rect.left) / rect.width;
    const percentY = (clientY - rect.top) / rect.height;
    
    return {
      x: Math.round(percentX * deviceResolutionRef.current.width),
      y: Math.round(percentY * deviceResolutionRef.current.height)
    };
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getDeviceCoordinates(event.clientX, event.clientY);
    if (!coords) return;

    isDraggingRef.current = true;
    dragStartRef.current = coords;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    
    // Visual feedback - change cursor
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;

    const endCoords = getDeviceCoordinates(event.clientX, event.clientY);
    if (!endCoords) return;

    const startCoords = dragStartRef.current;
    const distance = Math.sqrt(
      Math.pow(endCoords.x - startCoords.x, 2) + 
      Math.pow(endCoords.y - startCoords.y, 2)
    );

    // If moved more than 20 pixels, treat as swipe, otherwise as tap
    if (distance > 20) {
      console.log(`Swipe: (${startCoords.x}, ${startCoords.y}) -> (${endCoords.x}, ${endCoords.y})`);
      sendSwipeGesture(device.id, startCoords.x, startCoords.y, endCoords.x, endCoords.y, 300);
    } else {
      console.log(`Tap: (${startCoords.x}, ${startCoords.y})`);
      sendTouchEvent(device.id, startCoords.x, startCoords.y, 'tap');
    }

    // Reset
    isDraggingRef.current = false;
    dragStartRef.current = null;
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'pointer';
    }
  };

  const handleMouseLeave = () => {
    // Reset drag state if mouse leaves canvas
    isDraggingRef.current = false;
    dragStartRef.current = null;
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'pointer';
    }
  };

  const handleKeyPress = (keyCode: number) => {
    sendKeyEvent(device.id, keyCode);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {device.model} - {device.id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {fps} FPS
        </Typography>
        {device.batteryLevel && (
          <Typography variant="body2" color="text.secondary">
            Battery: {device.batteryLevel}%
          </Typography>
        )}
      </Paper>

      {/* Screen Display */}
      <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, overflow: 'hidden' }}>
        <Paper 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            bgcolor: '#000',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {!frameReceived && !error && (
            <Box sx={{ position: 'absolute', color: 'white', textAlign: 'center' }}>
              <Typography variant="body1">Loading screen...</Typography>
              <Typography variant="caption">Waiting for first frame from device</Typography>
            </Box>
          )}
          {error && (
            <Box sx={{ position: 'absolute', color: 'error.main', textAlign: 'center' }}>
              <Typography variant="body1">Error: {error}</Typography>
              <Typography variant="caption">Check backend console for details</Typography>
            </Box>
          )}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: 'pointer',
              imageRendering: 'auto',
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              display: frameReceived ? 'block' : 'none'
            }}
          />
        </Paper>

        {/* Control Panel */}
        <Paper sx={{ p: 2, width: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Virtual Buttons
          </Typography>

          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => handleKeyPress(4)} // KEYCODE_BACK
            fullWidth
          >
            Back
          </Button>

          <Button
            variant="outlined"
            startIcon={<Home />}
            onClick={() => handleKeyPress(3)} // KEYCODE_HOME
            fullWidth
          >
            Home
          </Button>

          <Button
            variant="outlined"
            startIcon={<Apps />}
            onClick={() => handleKeyPress(187)} // KEYCODE_APP_SWITCH
            fullWidth
          >
            Recent Apps
          </Button>

          <Button
            variant="outlined"
            startIcon={<PowerSettingsNew />}
            onClick={() => handleKeyPress(26)} // KEYCODE_POWER
            fullWidth
            color="error"
          >
            Power
          </Button>

          {device.screenResolution && (
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="caption" color="text.secondary">
                Resolution:
              </Typography>
              <Typography variant="body2">
                {device.screenResolution.width}x{device.screenResolution.height}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="caption" color="text.secondary">
              Status:
            </Typography>
            <Typography variant="body2" color={isCapturing ? 'success.main' : 'error.main'}>
              {isCapturing ? 'Capturing' : 'Stopped'}
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default DeviceScreen;
