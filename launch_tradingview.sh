#!/usr/bin/env bash
# launch_tradingview.sh - Start TradingView Desktop with CDP remote debugging on port 9222

set -e

PORT=9222
TV_APP="/Applications/TradingView.app"

echo "=== TradingView Desktop Remote Debugging Launcher ==="

# Check if TradingView.app exists
if [ ! -d "$TV_APP" ]; then
    echo "⚠️ TradingView.app not found in /Applications."
    echo "Checking brew cask or alternate paths..."
    if [ -d "$HOME/Applications/TradingView.app" ]; then
        TV_APP="$HOME/Applications/TradingView.app"
    else
        echo "❌ TradingView Desktop is not installed in /Applications or ~/Applications."
        echo "Please install it with: brew install --cask tradingview"
        exit 1
    fi
fi

# Check if port 9222 is already open
if lsof -i :$PORT >/dev/null 2>&1; then
    echo "✅ Port $PORT is already active! Checking CDP endpoint..."
    if curl -s "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
        echo "🎉 TradingView is already running with remote debugging enabled on port $PORT!"
        echo "You can now run 'tv status' or use Claude with the tradingview MCP tools."
        exit 0
    else
        echo "⚠️ Port $PORT is occupied by another process that is not responding to CDP."
        echo "Processes using port $PORT:"
        lsof -i :$PORT
        exit 1
    fi
fi

# Check if TradingView is currently running without debug port
if pgrep -x "TradingView" >/dev/null 2>&1; then
    echo "⚠️ TradingView is running, but remote debugging port $PORT is not active."
    echo "Closing existing TradingView instance..."
    killall "TradingView" 2>/dev/null || true
    sleep 2
fi

echo "🚀 Starting TradingView Desktop with --remote-debugging-port=$PORT..."
"$TV_APP/Contents/MacOS/TradingView" --remote-debugging-port=$PORT >/dev/null 2>&1 &

# Wait for CDP endpoint to become ready
echo "⏳ Waiting for TradingView CDP to initialize..."
MAX_WAIT=20
WAIT_COUNT=0
READY=0

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    if curl -s "http://127.0.0.1:$PORT/json/version" >/dev/null 2>&1; then
        READY=1
        break
    fi
    sleep 1
    WAIT_COUNT=$((WAIT_COUNT + 1))
done

if [ $READY -eq 1 ]; then
    echo "✅ TradingView successfully connected on port $PORT!"
    echo "Testing connection with 'tv status':"
    tv status 2>/dev/null || echo "Run 'tv status' to inspect connection."
else
    echo "⚠️ TradingView launched, but CDP on port $PORT is still starting up."
    echo "Please wait a few seconds and run 'tv status'."
fi
