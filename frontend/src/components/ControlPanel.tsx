import { Box, Button, Paper, Switch, FormControlLabel, CircularProgress } from '@mui/material';
import { Upload, Sync } from '@mui/icons-material';
import { useDeviceStore } from '../stores/deviceStore';
import { useUIStore } from '../stores/uiStore';
import { apkAPI } from '../services/api';
import { useState, useRef } from 'react';

const ControlPanel = () => {
    const { selectedDevices, syncMode, toggleSyncMode } = useDeviceStore();
    const { addNotification } = useUIStore();
    const [installing, setInstalling] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInstallAPK = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (selectedDevices.length === 0) {
            addNotification({
                type: 'warning',
                message: 'Please select at least one device'
            });
            return;
        }

        setInstalling(true);

        try {
            // Upload APK
            addNotification({
                type: 'info',
                message: 'Uploading APK...'
            });

            const { apkPath } = await apkAPI.uploadAPK(file);

            // Install on selected devices
            addNotification({
                type: 'info',
                message: `Installing on ${selectedDevices.length} device(s)...`
            });

            const results = await apkAPI.installAPK(selectedDevices, apkPath);

            // Check results
            const successCount = Object.values(results).filter((r: any) => r.success).length;
            const failCount = selectedDevices.length - successCount;

            if (failCount === 0) {
                addNotification({
                    type: 'success',
                    message: `Successfully installed on all ${successCount} device(s)`
                });
            } else {
                addNotification({
                    type: 'warning',
                    message: `Installed on ${successCount} device(s), failed on ${failCount}`
                });
            }
        } catch (err: any) {
            addNotification({
                type: 'error',
                message: `Installation failed: ${err.message}`
            });
        } finally {
            setInstalling(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".apk"
                    style={{ display: 'none' }}
                    onChange={handleInstallAPK}
                />

                <Button
                    variant="contained"
                    startIcon={installing ? <CircularProgress size={20} /> : <Upload />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedDevices.length === 0 || installing}
                >
                    {installing ? 'Installing...' : 'Install APK'}
                </Button>

                <FormControlLabel
                    control={
                        <Switch
                            checked={syncMode}
                            onChange={toggleSyncMode}
                            disabled={selectedDevices.length < 2}
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Sync fontSize="small" />
                            Sync Mode {syncMode ? 'ON' : 'OFF'}
                        </Box>
                    }
                />

                <Box sx={{ ml: 'auto', color: 'text.secondary' }}>
                    {selectedDevices.length} device(s) selected
                </Box>
            </Box>
        </Paper>
    );
};

export default ControlPanel;
