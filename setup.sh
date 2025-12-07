#!/bin/bash

echo "🚀 Setting up ADB Web Portal..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if ADB is installed
if ! command -v adb &> /dev/null; then
    echo "⚠️  ADB is not installed or not in PATH."
    echo "   Please install Android SDK Platform Tools."
else
    echo "✅ ADB version: $(adb version | head -n 1)"
fi

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi
cd ..

# Create necessary directories
echo ""
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p backend/temp

# Create .env files if they don't exist
if [ ! -f backend/.env ]; then
    echo ""
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo ""
    echo "📝 Creating frontend/.env file..."
    cp frontend/.env.example frontend/.env
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo "  1. Terminal 1: cd backend && npm run dev"
echo "  2. Terminal 2: cd frontend && npm run dev"
echo "  3. Open http://localhost:5173 in your browser"
echo ""
echo "Make sure you have Android devices connected via USB or wireless ADB!"
