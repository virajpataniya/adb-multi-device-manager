# 🚀 Getting Started Guide

Complete guide to install, run, and use the ADB Multi-Device Manager.

---

## 📋 Prerequisites

Before you begin, ensure you have:

### Required Software

1. **Node.js** (version 18 or higher)
   ```bash
   # Check version
   node --version
   # Should show v18.x.x or higher
   ```
   Download from: https://nodejs.org/

2. **ADB (Android Debug Bridge)**
   ```bash
   # Check if ADB is installed
   adb version
   # Should show Android Debug Bridge version
   ```
   
   **Install ADB**:
   - **Windows**: Download [Platform Tools](https://developer.android.com/studio/releases/platform-tools)
   - **macOS**: `brew install android-platform-tools`
   - **Linux**: `sudo apt-get install android-tools-adb`

3. **Git** (to clone the repository)
   ```bash
   git --version
   ```

### Android Device Requirements

- Android device with **USB debugging enabled**
- USB cable (for initial connection)
- Device and computer on **same WiFi network** (for wireless ADB)

---

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/virajpataniya/adb-multi-device-manager.git
cd adb-multi-device-manager
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

**Note**: This may take 2-5 minutes depending on your internet speed.

---

## ⚙️ Configuration

### Backend Configuration

1. Create `backend/.env` file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` (optional, defaults work fine):
   ```env
   PORT=3000
   NODE_ENV=development
   ADB_PATH=adb
   UPLOAD_DIR=./uploads
   TEMP_DIR=./temp
   MAX_FILE_SIZE=524288000
   FRONTEND_URL=http://localhost:5173
   ```

### Frontend Configuration

1. Create `frontend/.env` file:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Edit `frontend/.env` (optional, defaults work fine):
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000
   ```

---

## 🚀 Running the Application

### Development Mode (Recommended for Testing)

You need **TWO terminal windows**:

#### Terminal 1 - Backend Server
```bash
cd backend
npm run dev
```

**Expected output**:
```
Server running on port 3000
Health check: http://localhost:3000/api/health
Starting device monitoring...
```

#### Terminal 2 - Frontend Server
```bash
cd frontend
npm run dev
```

**Expected output**:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

Open your browser to: **http://localhost:5173**

---

## 📱 Connect Your First Device

### Method 1: USB Connection (Easiest)

1. **Enable USB Debugging** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times (enables Developer Options)
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect device via USB cable**

3. **Authorize computer** (popup on device):
   - Check "Always allow from this computer"
   - Tap "OK"

4. **Verify connection**:
   ```bash
   adb devices
   ```
   Should show:
   ```
   List of devices attached
   ABC123    device
   ```

5. **Check web portal** - Device should appear automatically!

### Method 2: Wireless Connection

1. **First, connect via USB** (follow Method 1)

2. **Enable wireless ADB**:
   ```bash
   adb tcpip 5555
   ```

3. **Get device IP address**:
   ```bash
   adb shell ip addr show wlan0 | grep inet
   ```
   Look for something like: `192.168.1.100`

4. **Disconnect USB cable**

5. **In web portal**:
   - Click "Add Wireless Device" button
   - Enter IP address (e.g., `192.168.1.100`)
   - Click "Connect"

6. **Device appears wirelessly!**

**Note**: Wireless devices auto-reconnect on app restart!

---

## 🎯 Quick Feature Tour

### 1. View Connected Devices

- Devices appear in grid layout
- Shows: Model, Battery, Status, Connection Type
- Click checkbox to select device

### 2. Install APK

1. Select one or more devices
2. Click "Install APK" button
3. Choose APK file
4. Watch installation progress
5. Get success notification

### 3. Screen Mirroring

1. Click "View Screen" on any device
2. Device screen appears in real-time
3. **Click** to tap
4. **Click and drag** to swipe
5. Use virtual buttons (Back, Home, Power)

### 4. Execute Commands

1. Switch to "Console" tab
2. Select device(s)
3. Type command: `shell getprop ro.build.version.release`
4. Press Enter
5. See output from each device

### 5. Sync Mode

1. Select 2+ devices
2. Toggle "Sync Mode" to ON
3. Perform any action
4. Action applies to all selected devices

---

## 🔧 Troubleshooting

### Problem: "adb: command not found"

**Solution**: ADB is not installed or not in PATH
```bash
# Windows: Add ADB to PATH or use full path
# macOS: brew install android-platform-tools
# Linux: sudo apt-get install android-tools-adb
```

### Problem: Device not showing up

**Solution**:
```bash
# 1. Check USB debugging is enabled
# 2. Check device is authorized
adb devices

# 3. Restart ADB server
adb kill-server
adb start-server

# 4. Reconnect device
```

### Problem: "Cannot connect to backend"

**Solution**:
```bash
# 1. Check backend is running
cd backend
npm run dev

# 2. Check port 3000 is not in use
# 3. Check firewall settings
```

### Problem: Screen mirroring shows black screen

**Solution**:
```bash
# 1. Unlock device screen
# 2. Test screencap manually
adb shell screencap -p > test.png

# 3. Check backend console for errors
# 4. Restart backend server
```

### Problem: Wireless connection fails

**Solution**:
```bash
# 1. Ensure device and computer on same WiFi
# 2. Check device IP hasn't changed
# 3. Try connecting via USB first
adb tcpip 5555
# Then connect wirelessly
```

---

## 📚 Next Steps

### Learn More:
- Read [SYNC_MODE_EXPLAINED.md](SYNC_MODE_EXPLAINED.md) for Sync Mode details
- Check [README.md](README.md) for full feature list
- See [Architecture](#) section for technical details

### Common Tasks:
- [How to install APK on multiple devices](#)
- [How to use screen mirroring](#)
- [How to execute ADB commands](#)
- [How to use Sync Mode](#)

---

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/virajpataniya/adb-multi-device-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/virajpataniya/adb-multi-device-manager/discussions)
- **Email**: virajpataniya@example.com

---

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend opens in browser
- [ ] Device appears when connected via USB
- [ ] Can select device
- [ ] Can install APK
- [ ] Can view screen mirror
- [ ] Can execute commands
- [ ] Sync Mode toggle works

**If all checked, you're ready to go! 🎉**

---

## 🎓 Tips for Best Experience

1. **Use USB for initial setup** - More reliable than wireless
2. **Keep devices unlocked** - For screen mirroring
3. **Use latest ADB version** - Better compatibility
4. **Check device authorization** - Accept prompt on device
5. **Same WiFi network** - For wireless ADB

---

**Happy testing! 🚀**
