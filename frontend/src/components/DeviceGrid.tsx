import { Grid, Card, CardContent, Typography, Checkbox, Box, Chip, IconButton, Button, Dialog } from '@mui/material';
import { Battery90, BatteryFull, Battery60, Battery30, Refresh, Smartphone, Visibility } from '@mui/icons-material';
import { useDeviceStore } from '../stores/deviceStore';
import { deviceAPI } from '../services/api';
import { Device } from '../types';
import DeviceScreen from './DeviceScreen';
import { useState } from 'react';

const DeviceCard = ({ device, onViewScreen }: { device: Device; onViewScreen: (device: Device) => void }) => {
  const { selectedDevices, toggleDeviceSelection } = useDeviceStore();
  const isSelected = selectedDevices.includes(device.id);

  const getBatteryIcon = (level?: number) => {
    if (!level) return <Battery90 />;
    if (level > 80) return <BatteryFull />;
    if (level > 50) return <Battery90 />;
    if (level > 20) return <Battery60 />;
    return <Battery30 />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'device':
        return 'success';
      case 'offline':
        return 'error';
      case 'unauthorized':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: isSelected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 3
        }
      }}
      onClick={() => toggleDeviceSelection(device.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Checkbox 
            checked={isSelected}
            onClick={(e) => {
              e.stopPropagation();
              toggleDeviceSelection(device.id);
            }}
          />
          <Smartphone sx={{ ml: 1, fontSize: 40, color: '#1976d2' }} />
        </Box>

        <Typography variant="h6" gutterBottom>
          {device.model}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {device.id}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Chip 
            label={device.status}
            color={getStatusColor(device.status)}
            size="small"
          />
          
          <Chip 
            label={device.connectionType}
            variant="outlined"
            size="small"
          />

          {device.batteryLevel && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getBatteryIcon(device.batteryLevel)}
              <Typography variant="body2">
                {device.batteryLevel}%
              </Typography>
            </Box>
          )}

          {device.screenResolution && (
            <Typography variant="caption" color="text.secondary">
              {device.screenResolution.width}x{device.screenResolution.height}
            </Typography>
          )}
        </Box>

        {device.status === 'device' && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Visibility />}
            onClick={(e) => {
              e.stopPropagation();
              onViewScreen(device);
            }}
            fullWidth
            sx={{ mt: 2 }}
          >
            View Screen
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const DeviceGrid = () => {
  const { devices } = useDeviceStore();
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const handleRefresh = async () => {
    try {
      const refreshedDevices = await deviceAPI.getDevices();
      useDeviceStore.getState().setDevices(refreshedDevices);
    } catch (err) {
      console.error('Failed to refresh devices:', err);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Connected Devices ({devices.length})
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {devices.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No devices connected. Connect an Android device via USB or wireless ADB.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {devices.map((device) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
              <DeviceCard device={device} onViewScreen={setSelectedDevice} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Screen View Dialog */}
      <Dialog
        open={selectedDevice !== null}
        onClose={() => setSelectedDevice(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        {selectedDevice && (
          <DeviceScreen
            device={selectedDevice}
            onClose={() => setSelectedDevice(null)}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default DeviceGrid;
