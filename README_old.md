# ADB Web Portal

A web-based application for managing multiple Android devices through ADB (Android Debug Bridge). Control, test, and manage multiple devices from a single unified interface.

## Features

- 📱 **Multi-Device Management**: View and control multiple Android devices simultaneously
- 🖥️ **Screen Mirroring**: Real-time device screen viewing with touch input
- 📦 **APK Installation**: Install apps on multiple devices at once
- 🔄 **Synchronized Actions**: Perform the same action across multiple devices
- 💻 **ADB Commands**: Execute any ADB command through the web interface
- 📸 **Screenshots & Recording**: Capture screenshots and record device screens
- 📋 **Real-time Logs**: View logcat output from devices
- 🔌 **Wireless ADB**: Connect devices over WiFi

## Prerequisites

- Node.js 18 or higher
- ADB (Android Debug Bridge) installed and in PATH
- Android devices with USB debugging enabled

## Quick Start

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Development

```bash
# Terminal 1 - Start backend server (port 3000)
npm run dev:backend

# Terminal 2 - Start frontend dev server (port 5173)
npm run dev:frontend
```

Open your browser to `http://localhost:5173`

### Production Build

```bash
# Build both backend and frontend
npm run build:backend
npm run build:frontend

# Start production server
npm start
```

## Project Structure

```
adb-web-portal/
├── backend/          # Node.js backend server
│   ├── src/
│   │   ├── services/ # Business logic services
│   │   ├── routes/   # API endpoints
│   │   └── server.ts # Main server file
│   └── package.json
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── stores/     # State management
│   │   └── services/   # API clients
│   └── package.json
└── README.md
```

## Configuration

### Backend Environment Variables

Create `backend/.env`:

```
PORT=3000
NODE_ENV=development
ADB_PATH=adb
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=524288000
```

### Frontend Environment Variables

Create `frontend/.env`:

```
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Usage

1. Connect Android devices via USB or wireless ADB
2. Open the web portal in your browser
3. Devices will appear automatically in the device grid
4. Select devices and perform actions using the control panel

## Troubleshooting

### Devices not showing up

- Ensure ADB is installed: `adb version`
- Check USB debugging is enabled on devices
- Run `adb devices` to verify devices are detected
- Try restarting ADB server: `adb kill-server && adb start-server`

### Screen mirroring not working

- Ensure device screen is unlocked
- Check device has sufficient permissions
- Try reconnecting the device

## License

MIT
