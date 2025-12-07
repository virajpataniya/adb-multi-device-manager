import { Box, AppBar, Toolbar, Typography, Container, Tabs, Tab } from '@mui/material';
import DeviceGrid from './components/DeviceGrid';
import ControlPanel from './components/ControlPanel';
import CommandConsole from './components/CommandConsole';
import { useEffect, useState } from 'react';
import { connectWebSocket } from './services/websocket';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Connect to WebSocket on mount
    connectWebSocket();
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ADB Web Portal
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ControlPanel />
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Devices" />
            <Tab label="Console" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 3, flexGrow: 1 }}>
          {activeTab === 0 && <DeviceGrid />}
          {activeTab === 1 && <CommandConsole />}
        </Box>
      </Container>
    </Box>
  );
}

export default App;
