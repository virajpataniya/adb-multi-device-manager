# 🚀 ADB Multi-Device Manager

> A powerful web-based tool for managing, testing, and controlling multiple Android devices simultaneously through a unified interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)

![ADB Multi-Device Manager Demo](https://via.placeholder.com/800x400/1976d2/ffffff?text=ADB+Multi-Device+Manager)

## ✨ Features

### 🎯 Core Capabilities

- **📱 Multi-Device Detection** - Automatically detects USB and wireless ADB devices
- **🖥️ Real-Time Screen Mirroring** - View device screens at 5 FPS with touch control
- **👆 Touch & Gesture Control** - Tap, swipe, and use virtual buttons (Back, Home, Power, Recent Apps)
- **📦 Parallel APK Installation** - Install apps on multiple devices simultaneously
- **🔄 Synchronized Actions** - Execute commands across all selected devices at once
- **💻 ADB Command Console** - Full access to any ADB command with history
- **🔌 Wireless ADB Support** - Connect devices over WiFi with auto-reconnect
- **⚡ Real-Time Updates** - WebSocket-based live device status updates

### 🎨 User Interface

- Clean, modern Material-UI design
- Grid/List view for devices
- Device selection with checkboxes
- Real-time FPS counter and battery display
- Progress tracking for installations
- Notification system for all actions

---

## 🎥 Demo

### Device Management
```
✅ Automatic USB device detection
✅ Manual wireless device connection
✅ Real-time device status updates
✅ Battery level and screen resolution display
```

### Screen Mirroring & Control
```
✅ Live screen capture at 5 FPS
✅ Touch input (tap and swipe)
✅ Virtual hardware buttons
✅ Accurate coordinate mapping
```

### Multi-Device Operations
```
✅ Select multiple devices
✅ Install APK on all selected devices
✅ Execute commands on all devices
✅ Sync Mode for synchronized actions
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **ADB** (Android Debug Bridge) installed and in PATH
- **Android device(s)** with USB debugging enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/virajpataniya/adb-multi-device-manager.git
cd adb-multi-device-manager

# Install dependencies for both backend and frontend
npm run install:all
```

### Running the Application

#### Development Mode

```bash
# Terminal 1 - Start backend server (port 3000)
cd backend
npm run dev

# Terminal 2 - Start frontend dev server (port 5173)
cd frontend
npm run dev
```

Open your browser to `http://localhost:5173`

#### Production Mode

```bash
# Build both backend and frontend
npm run build:backend
npm run build:frontend

# Start production server
npm start
```

---

## 📖 Usage Guide

### 1. Connect Devices

#### USB Devices (Automatic)
1. Enable USB debugging on your Android device
2. Connect device via USB cable
3. Device appears automatically in the web portal

#### Wireless Devices (Manual Setup)
1. Connect device via USB first
2. Enable wireless ADB:
   ```bash
   adb tcpip 5555
   ```
3. Get device IP address:
   ```bash
   adb shell ip addr show wlan0
   ```
4. In web portal: Click "Add Wireless Device" → Enter IP → Connect
5. Disconnect USB cable (device stays connected wirelessly)

**Note**: Wireless devices auto-reconnect on app restart!

### 2. Install APK on Multiple Devices

1. Select devices using checkboxes
2. Click "Install APK" button
3. Choose APK file from your computer
4. Watch installation progress for each device
5. Get success/failure notifications

### 3. Screen Mirroring & Control

1. Click "View Screen" button on any device
2. Device screen appears in real-time
3. **Tap**: Click anywhere on the screen
4. **Swipe**: Click and drag (up/down/left/right)
5. **Virtual Buttons**: Use Back, Home, Power, Recent Apps buttons

**Common Gestures**:
- Swipe up from bottom → Open app drawer
- Swipe down from top → Pull notifications
- Swipe left/right → Navigate home screens

### 4. Execute ADB Commands

1. Switch to "Console" tab
2. Select target device(s)
3. Type ADB command (e.g., `shell getprop ro.build.version.release`)
4. Press Enter or click "Execute"
5. View output for each device

**Tip**: Use ↑↓ arrow keys for command history

### 5. Synchronized Actions (Sync Mode)

1. Select 2 or more devices
2. Enable "Sync Mode" toggle
3. Execute commands or perform actions
4. Actions apply to all selected devices simultaneously

---

## 🏗️ Architecture

### Technology Stack

**Backend (Node.js + TypeScript)**
- Express.js - Web server
- Socket.IO - Real-time communication
- Multer - File upload handling
- Child Process - ADB command execution

**Frontend (React + TypeScript)**
- React 18 - UI framework
- Material-UI - Component library
- Zustand - State management
- Socket.IO Client - WebSocket client
- Vite - Build tool

### Project Structure

```
adb-multi-device-manager/
├── backend/                 # Node.js backend server
│   ├── src/
│   │   ├── services/       # Business logic
│   │   │   ├── ADBExecutor.ts          # ADB command wrapper
│   │   │   ├── DeviceManager.ts        # Device detection & monitoring
│   │   │   ├── ScreenCaptureService.ts # Screen mirroring
│   │   │   └── APKManager.ts           # APK installation
│   │   ├── routes/         # API endpoints
│   │   │   ├── devices.ts              # Device management API
│   │   │   ├── apk.ts                  # APK operations API
│   │   │   └── commands.ts             # Command execution API
│   │   ├── websocket/      # Real-time events
│   │   │   └── handlers.ts             # WebSocket event handlers
│   │   └── server.ts       # Main server file
│   └── package.json
│
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── DeviceGrid.tsx          # Device display grid
│   │   │   ├── DeviceScreen.tsx        # Screen mirroring UI
│   │   │   ├── ControlPanel.tsx        # Action controls
│   │   │   └── CommandConsole.tsx      # Command interface
│   │   ├── stores/         # State management
│   │   │   ├── deviceStore.ts          # Device state
│   │   │   ├── uiStore.ts              # UI notifications
│   │   │   └── installationStore.ts    # Installation progress
│   │   ├── services/       # API clients
│   │   │   ├── api.ts                  # REST API client
│   │   │   └── websocket.ts            # WebSocket client
│   │   └── App.tsx         # Main application
│   └── package.json
│
├── README.md               # This file
└── package.json            # Root package.json
```

### Data Flow

```
User Action (Frontend)
    ↓
WebSocket/REST API
    ↓
Backend Service Layer
    ↓
ADB Executor
    ↓
ADB Server
    ↓
Android Device
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
ADB_PATH=adb
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=524288000
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

---

## 🔧 Technical Details

### Screen Mirroring Implementation

```typescript
// Captures PNG frames using ADB screencap
adb exec-out screencap -p

// Frame rate: 5 FPS (200ms interval)
// Optimization: Busy flag prevents overlapping captures
// Format: PNG → Base64 → WebSocket → Canvas
```

### Touch Coordinate Mapping

```typescript
// Maps screen clicks to device coordinates
const percentX = (clickX - canvasLeft) / canvasWidth;
const percentY = (clickY - canvasTop) / canvasHeight;

const deviceX = Math.round(percentX * deviceResolution.width);
const deviceY = Math.round(percentY * deviceResolution.height);

// Sends to device
adb shell input tap ${deviceX} ${deviceY}
```

### Gesture Detection

```typescript
// Distinguishes between tap and swipe
const distance = Math.sqrt(
  Math.pow(endX - startX, 2) + 
  Math.pow(endY - startY, 2)
);

if (distance > 20) {
  // Swipe gesture
  adb shell input swipe ${startX} ${startY} ${endX} ${endY} 300
} else {
  // Tap gesture
  adb shell input tap ${startX} ${startY}
}
```

---

## 🎯 Key Features Explained

### What is Sync Mode?

**Sync Mode** allows you to perform the same action across multiple devices simultaneously.

**Use Cases**:
- Test app behavior across different device models
- Install apps on multiple devices at once
- Execute the same command on all devices
- Synchronized testing workflows

**How to Use**:
1. Select 2 or more devices
2. Toggle "Sync Mode" switch to ON
3. Perform any action (install APK, execute command, etc.)
4. Action applies to all selected devices

**Example**:
```bash
# With 3 devices selected and Sync Mode ON
Command: shell getprop ro.build.version.release

# Output shows Android version from all 3 devices:
[Device 1] 13
[Device 2] 12
[Device 3] 14
```

### Auto-Reconnect for Wireless Devices

Once you connect a wireless device, it's automatically saved. When you restart the application, it will attempt to reconnect to all previously connected wireless devices.

**Benefits**:
- No need to re-enter IP addresses
- Faster startup with multiple wireless devices
- Seamless workflow across sessions

---

## 🐛 Troubleshooting

### Devices Not Showing Up

**Problem**: No devices appear in the web portal

**Solutions**:
1. Check ADB is installed: `adb version`
2. Check USB debugging is enabled on device
3. Verify devices are detected: `adb devices`
4. Restart ADB server:
   ```bash
   adb kill-server
   adb start-server
   ```
5. Check device authorization (unlock device and accept prompt)

### Screen Mirroring Shows Black Screen

**Problem**: Device screen is black or not updating

**Solutions**:
1. Ensure device screen is unlocked
2. Test screencap manually:
   ```bash
   adb shell screencap -p > test.png
   ```
3. Check backend console for errors
4. Restart backend server
5. Try reconnecting the device

### Touch Coordinates Are Inaccurate

**Problem**: Clicks register at wrong positions

**Solutions**:
1. Check browser console for coordinate logs
2. Verify device resolution is detected correctly
3. Try clicking in corners to test mapping
4. Refresh the screen mirror view

### APK Installation Fails

**Problem**: APK won't install on device

**Solutions**:
1. Verify APK file is valid
2. Check device has enough storage space
3. Enable "Install from unknown sources" on device
4. Check device API level compatibility
5. Try installing manually: `adb install -r app.apk`

### Wireless Connection Fails

**Problem**: Cannot connect to device wirelessly

**Solutions**:
1. Ensure device and computer are on same network
2. Check device IP address hasn't changed
3. Verify port 5555 is open on device
4. Try connecting via USB first, then enable wireless:
   ```bash
   adb tcpip 5555
   ```
5. Check firewall settings

---

## 📊 Performance

### Benchmarks

| Metric | Performance |
|--------|-------------|
| Device Detection | < 2 seconds |
| Screen Mirroring FPS | 4-5 FPS |
| Touch Response Latency | ~150ms |
| APK Installation | 10-30 seconds (varies by size) |
| Command Execution | < 500ms |
| WebSocket Latency | < 50ms |

### Optimization Tips

1. **Use USB for screen mirroring** - Lower latency than wireless
2. **Reduce concurrent operations** - Better performance with fewer devices
3. **Close unused screen mirrors** - Reduces CPU/network usage
4. **Use wired network** - More stable than WiFi for wireless ADB

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Meaningful variable names
- Comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **ADB (Android Debug Bridge)** - Core Android debugging tool
- **React** - UI framework
- **Material-UI** - Component library
- **Socket.IO** - Real-time communication
- **Node.js** - Backend runtime

---

## 📧 Contact

**Project Link**: [https://github.com/virajpataniya/adb-multi-device-manager](https://github.com/virajpataniya/adb-multi-device-manager)

**Issues**: [https://github.com/virajpataniya/adb-multi-device-manager/issues](https://github.com/virajpataniya/adb-multi-device-manager/issues)

---

## 🗺️ Roadmap

### Planned Features

- [ ] **60 FPS Screen Mirroring** - Integrate scrcpy for better performance
- [ ] **Multi-touch Gestures** - Support pinch, zoom, rotate
- [ ] **Test Recording** - Record and replay test sequences
- [ ] **Device Groups** - Organize devices into groups
- [ ] **Dark Mode** - UI theme toggle
- [ ] **Authentication** - User login and access control
- [ ] **Cloud Sync** - Sync settings across machines
- [ ] **Performance Monitoring** - Real-time CPU, memory, network stats
- [ ] **Log Viewer** - Advanced logcat filtering and search
- [ ] **File Manager** - Browse and transfer files
- [ ] **App Manager** - Manage installed applications

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ for Android developers and testers**
