# ⚡ Quickstart Guide (3-Minute Setup)

Welcome to **ALPHA-3 // Quantum Momentum Scalp Terminal & TradingView AI System**.  
Get up and running in less than 3 minutes with this quickstart checklist.

---

## 📋 Prerequisites Check

Make sure you have installed on your Mac:
- **Python 3.10+** (`python3 --version`)
- **Node.js 18+** (`node -v`)
- **TradingView Desktop App** (`/Applications/TradingView.app`)

---

## 🚀 3-Minute Rapid Deployment

### 1. Install Dependencies

Open Terminal and navigate to the project root:

```bash
cd /Users/henryoh/Documents/sass/ai-trading-system

# Install Python requirements
pip install -r requirements.txt

# Link the global 'tv' CLI tool (from the included MCP bridge)
cd tradingview-mcp && npm install && npm link && cd ..
```

---

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

> **Note:** By default, `DRY_RUN=true` is enabled. You can safely simulate real-time market scans and test scalp executions without connecting any real broker capital or risking money.

---

### 3. Start TradingView Desktop with Remote Debugging

The TradingView Desktop app must run with Chrome DevTools Protocol (CDP) enabled on port `9222`:

```bash
./launch_tradingview.sh
```

*Verify connection anytime:*
```bash
tv status
```
Expected output: `{"success": true, "cdp_connected": true}`.

---

### 4. Launch the AI Trading Cockpit

Start the unified server:

```bash
python3 server.py
```

Now open your browser:  
👉 **[http://localhost:5001](http://localhost:5001)**

---

## 🎯 How to Use the Terminal Cockpit

1. **Top 3 High-Probability Scalps**: Look at the top hero cards. The system algorithms evaluate over 4,500+ active NASDAQ and NYSE stocks and automatically rank the top 3 with upward momentum velocity.
2. **Review Scalp Bracket**: Each card displays:
   - **Recommended Entry**
   - **Target 1 (+1.5% to +2.5% quick 1-2 min scalp)**
   - **Target 2 (Runner)**
   - **Strict Stop Loss (anchored below VWAP)**
3. **1-Click Sync**: Click `⚡ SYNC DESKTOP` on any card to immediately switch your actual TradingView Desktop app to that stock and 1-minute chart.
4. **1-Click Paper Scalp**: Click `🚀 EXECUTE SCALP` to simulate or route the order to your broker.
5. **Interactive Chart**: Click on any stock in the NASDAQ & NYSE movers table to instantly load its live TradingView candlestick chart in the left pane.

---

## 🤖 Using Claude with TradingView MCP

In another terminal window:

```bash
claude
```

Ask Claude:
- *"What's on my TradingView chart right now?"*
- *"Analyze the #1 momentum stock on my screen. Mark the key premarket support and resistance levels."*
- *"Write a Pine Script strategy for opening range breakout, compile check it, and inject it into my Pine Editor."*

---

🎉 **You are all set! Happy scalping!**
