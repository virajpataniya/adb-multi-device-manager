# ADB Web Portal - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js 18+** - [Download here](https://nodejs.org/)
2. **ADB (Android Debug Bridge)** - Part of Android SDK Platform Tools
3. **Git** - For cloning the repository

### Installing ADB

**macOS:**
```bash
brew install android-platform-tools
```

**Linux:**
```bash
sudo apt-get install android-tools-adb android-tools-fastboot
```

**Windows:**
Download Android SDK Platform Tools from [here](https://developer.android.com/studio/releases/platform-tools)

Verify installation:
```bash
adb version
```

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd adb-web-portal
```

### 2. Run Setup Script

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
# Install backend
cd backend
npm install
cd ..

# Install frontend
cd frontend
npm install
cd ..

# Create directories
mkdir backend\uploads
mkdir backend\temp

# Copy env files
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### 3. Start the Application

**Option A: Using start script (Linux/macOS)**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option B: Manual start (All platforms)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 4. Open in Browser

Navigate to: `http://localhost:5173`

## Connecting Android Devices

### USB Connection

1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times

2. Enable USB Debugging:
   - Go to Settings > Developer Options
   - Enable "USB Debugging"

3. Connect device via USB cable

4. Accept the authorization prompt on your device

5. Verify connection:
```bash
adb devices
```

### Wireless Connection

1. Connect device via USB first

2. Enable wireless debugging:
```bash
adb tcpip 5555
```

3. Find device IP address:
   - Settings > About Phone > Status > IP Address
   - Or: `adb shell ip addr show wlan0`

4. Connect wirelessly:
```bash
adb connect <device-ip>:5555
```

5. Disconnect USB cable (device will remain connected wirelessly)

## Features

### ✅ Available Features

- **Device Detection**: Automatically detects USB and wireless devices
- **Multi-Device Selection**: Select multiple devices for batch operations
- **APK Installation**: Upload and install APKs on multiple devices simultaneously
- **Screen Mirroring**: View and control device screens in real-time
- **Touch Input**: Click on mirrored screen to interact with device
- **Virtual Buttons**: Home, Back, Recent Apps buttons
- **Command Console**: Execute any ADB command on selected devices
- **Sync Mode**: Perform synchronized actions across multiple devices
- **Real-time Updates**: WebSocket for instant device status updates

### 🎯 Usage Examples

**Install APK on multiple devices:**
1. Select devices by clicking checkboxes
2. Click "Install APK" button
3. Choose APK file
4. Wait for installation to complete

**View device screen:**
1. Click "View Screen" button on any device card
2. Click on the screen to send touch events
3. Use virtual buttons for navigation

**Execute ADB commands:**
1. Switch to "Console" tab
2. Select target devices
3. Enter command (e.g., `shell getprop ro.build.version.release`)
4. Press Enter or click Execute

## Troubleshooting

### Devices not showing up

```bash
# Restart ADB server
adb kill-server
adb start-server

# Check devices
adb devices
```

### Port already in use

If port 3000 or 5173 is already in use:

1. Edit `backend/.env`:
```
PORT=3001
```

2. Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### Screen mirroring not working

- Ensure device screen is unlocked
- Check device has sufficient permissions
- Try reconnecting the device

### Permission denied errors

```bash
# Linux/macOS - Add user to plugdev group
sudo usermod -aG plugdev $USER

# Restart udev
sudo udevadm control --reload-rules
sudo udevadm trigger
```

## Development

### Project Structure

```
adb-web-portal/
├── backend/          # Node.js + Express backend
│   ├── src/
│   │   ├── services/ # Business logic
│   │   ├── routes/   # API endpoints
│   │   └── server.ts # Main server
│   └── package.json
├── frontend/         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── stores/     # State management
│   │   └── services/   # API clients
│   └── package.json
└── README.md
```

### Tech Stack

**Backend:**
- Node.js + Express
- TypeScript
- Socket.io (WebSocket)
- Multer (file uploads)

**Frontend:**
- React 18
- TypeScript
- Material-UI (MUI)
- Zustand (state management)
- Socket.io-client

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build

# Start production server
cd backend
npm start
```

## Contributing

This project was created as an interview assignment to demonstrate:
- Full-stack development skills
- Understanding of Android ADB and system internals
- Real-time communication with WebSockets
- Multi-device management
- Clean architecture and code organization

## License

MIT
