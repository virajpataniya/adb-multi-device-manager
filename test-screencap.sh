#!/bin/bash

echo "Testing ADB screencap functionality..."
echo ""

# Get device ID
DEVICE=$(adb devices | grep -v "List" | grep "device" | awk '{print $1}' | head -n 1)

if [ -z "$DEVICE" ]; then
    echo "❌ No device found"
    exit 1
fi

echo "✓ Device found: $DEVICE"
echo ""

# Test screencap
echo "Testing screencap (this should take < 1 second)..."
time adb -s "$DEVICE" exec-out screencap -p > /tmp/test_screen.png 2>&1

if [ $? -eq 0 ]; then
    SIZE=$(wc -c < /tmp/test_screen.png)
    if [ $SIZE -gt 1000 ]; then
        echo "✓ Screencap successful! Size: $SIZE bytes"
        
        # Get image dimensions
        if command -v file &> /dev/null; then
            file /tmp/test_screen.png
        fi
    else
        echo "❌ Screencap file too small: $SIZE bytes"
        echo "Content:"
        head -c 200 /tmp/test_screen.png
    fi
else
    echo "❌ Screencap failed"
fi

echo ""
echo "Testing continuous capture (5 frames)..."
for i in {1..5}; do
    echo -n "Frame $i... "
    START=$(date +%s%N)
    adb -s "$DEVICE" exec-out screencap -p > /tmp/test_screen_$i.png 2>&1
    END=$(date +%s%N)
    DURATION=$(( ($END - $START) / 1000000 ))
    SIZE=$(wc -c < /tmp/test_screen_$i.png)
    echo "Done in ${DURATION}ms, size: $SIZE bytes"
    sleep 0.2
done

echo ""
echo "Cleanup..."
rm -f /tmp/test_screen*.png
echo "✓ Test complete"
