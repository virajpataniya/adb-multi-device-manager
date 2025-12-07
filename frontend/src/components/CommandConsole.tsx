import { useState, useRef, useEffect } from 'react';
import { Box, Paper, TextField, Button, Typography } from '@mui/material';
import { Send, Clear } from '@mui/icons-material';
import { useDeviceStore } from '../stores/deviceStore';
import { useUIStore } from '../stores/uiStore';
import { commandAPI } from '../services/api';

const CommandConsole = () => {
  const { selectedDevices } = useDeviceStore();
  const { addNotification } = useUIStore();
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleExecute = async () => {
    if (!command.trim()) return;

    if (selectedDevices.length === 0) {
      addNotification({
        type: 'warning',
        message: 'Please select at least one device'
      });
      return;
    }

    // Add to output
    setOutput(prev => [...prev, `$ ${command}`]);

    // Add to history
    setHistory(prev => [command, ...prev]);
    setHistoryIndex(-1);

    try {
      const results = await commandAPI.execute(command, selectedDevices);

      // Display results for each device
      for (const [deviceId, result] of Object.entries(results)) {
        const typedResult = result as any;
        setOutput(prev => [
          ...prev,
          `[${deviceId}]`,
          typedResult.success ? typedResult.output : `Error: ${typedResult.error}`,
          ''
        ]);
      }
    } catch (err: any) {
      setOutput(prev => [...prev, `Error: ${err.message}`, '']);
      addNotification({
        type: 'error',
        message: `Command failed: ${err.message}`
      });
    }

    setCommand('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommand(history[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand('');
      }
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  return (
    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Command Console</Typography>
        <Button
          startIcon={<Clear />}
          onClick={handleClear}
          size="small"
        >
          Clear
        </Button>
      </Box>

      {/* Output Area */}
      <Box
        ref={outputRef}
        sx={{
          flexGrow: 1,
          bgcolor: '#1e1e1e',
          color: '#d4d4d4',
          p: 2,
          fontFamily: 'monospace',
          fontSize: '14px',
          overflow: 'auto',
          mb: 2,
          borderRadius: 1,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}
      >
        {output.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#888' }}>
            Enter ADB commands to execute on selected devices...
          </Typography>
        ) : (
          output.map((line, index) => (
            <div key={index} style={{ 
              color: line.startsWith('Error:') ? '#f44336' : 
                     line.startsWith('$') ? '#4caf50' :
                     line.startsWith('[') ? '#2196f3' : '#d4d4d4'
            }}>
              {line}
            </div>
          ))
        )}
      </Box>

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="adb shell getprop ro.build.version.release"
          size="small"
          sx={{
            '& .MuiInputBase-root': {
              fontFamily: 'monospace'
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleExecute}
          disabled={!command.trim() || selectedDevices.length === 0}
          startIcon={<Send />}
        >
          Execute
        </Button>
      </Box>

      <Typography 
        variant="caption" 
        color={selectedDevices.length === 0 ? 'error' : 'text.secondary'} 
        sx={{ mt: 1 }}
      >
        {selectedDevices.length === 0 
          ? '⚠️ Please select at least one device from the Devices tab to execute commands'
          : `${selectedDevices.length} device(s) selected • Use ↑↓ for history • Enter to execute`
        }
      </Typography>
    </Paper>
  );
};

export default CommandConsole;
