# 🎓 Step-by-Step Tutorial: Scalping with ALPHA-3 & TradingView

A practical, hands-on tutorial that guides you through a typical trading morning using the **ALPHA-3 Quantum Momentum Scalp Terminal**.

---

## 🌅 Morning Routine Workflow Overview

```
 08:30 AM ET ──> Run Premarket Gap Scanner (`premarket_scanner.py`)
 09:15 AM ET ──> Launch TradingView Desktop (`./launch_tradingview.sh`)
 09:25 AM ET ──> Launch Web Cockpit (`http://localhost:5001`)
 09:30 AM ET ──> Market Open: Review live Top 3 high-conviction scalps
 09:32 AM ET ──> 1-Click Sync to TradingView Desktop & verify setup
 09:33 AM ET ──> Execute scalp with bracket SL/TP (Target 1: +1.8%)
 09:35 AM ET ──> Exit at Target 1 / trail stop on Target 2 runner
```

---

## Step 1: Scan Premarket Gappers & News Catalysts (8:30 AM – 9:15 AM)

Before the opening bell, institutional funds position into earnings reports and major breaking catalysts.

Run the premarket scanner:
```bash
python3 premarket_scanner.py --threshold 1.5
```

This scans premarket volume, gap percentage, and Yahoo Finance news headlines, outputting a clean report to `premarket_report.md`.

---

## Step 2: Launch TradingView Desktop & Open Terminal

In your terminal:
```bash
# 1. Start TradingView Desktop with remote debugging
./launch_tradingview.sh

# 2. Start the web cockpit server
python3 server.py
```

Now open **[http://localhost:5001](http://localhost:5001)** in your web browser.

---

## Step 3: Understanding the Top 3 Hero Cards

As soon as the market opens at 9:30 AM ET, the scanner processes the entire universe of over 4,500+ NASDAQ and NYSE stocks every few seconds.

The Top 3 Hero Cards immediately present the 3 strongest upward momentum stocks:

### Key Metrics to Check on the Card:
1. **Scalp Success Probability (e.g., 91.0% – 99.2%)**:
   - Above 85% means aggressive institutional buying, volume surge > 5x, and price holding above VWAP.
2. **Relative Volume (RVOL) (e.g., 12.2x normal)**:
   - Indicates that 12 times the usual amount of volume is flooding into this stock right now.
3. **Change From Open (e.g., +4.5%)**:
   - Confirms that the stock is expanding upwards after the open, rather than fading.
4. **Trigger Reason**:
   - Summarizes the catalyst (e.g., *"Extreme Volume Influx • Clean VWAP Support Bounce"*).

---

## Step 4: 1-Click Synchronization with TradingView Desktop

When you see a compelling setup on Card #1 or #2:

1. Click **`⚡ SYNC DESKTOP`** on the card.
2. Look at your TradingView Desktop application:
   - TradingView Desktop instantly changes its active chart to that symbol (e.g., `NVDA`).
   - The timeframe automatically switches to the **1-minute chart** for micro-scalping.
3. Your Pine Script indicators (VWAP, 9 EMA, 21 EMA) are already drawn on the screen!

---

## Step 5: Executing Your First Scalp Trade

1. On the card, review the **Scalp Target Bracket**:
   - **Entry:** Current live price (e.g., `$10.40`)
   - **Target 1:** `$10.67` (+2.6%)
   - **Stop Loss:** `$10.22` (-1.7%)
2. Click **`🚀 EXECUTE SCALP`**.
3. A confirmation modal appears showing exact order details.
4. Click **`CONFIRM & SEND ORDER`**.
5. The order is submitted with an automatic bracket stop loss and take profit.
6. A success chime sounds, and the order is recorded in the bottom **Live Trade Execution Log**.

---

## Step 6: Managing the Trade (Seconds to Minutes)

In micro-momentum trading, speed and discipline are key:

- **Seconds 0 – 60:** Watch the volume bar and 1-minute candle. You want to see strong green volume pushing price toward Target 1.
- **Target 1 Reached (+1.5% to +2.5%):**
  - Lock in gains on 50% to 75% of your shares.
  - Move your stop loss on the remaining shares up to your original Entry price (Breakeven).
- **Target 2 Runner (+3.0% to +4.5%):**
  - Allow the remaining shares to run toward Target 2 with zero downside risk.
- **Invalidation:** If the stock breaks below VWAP or hits your hard Stop Loss, exit immediately. Never hold a losing scalp into a day trade!

---

## Step 7: Interacting with Claude AI

You can also use Claude Code as your real-time trading coach while watching charts:

Open your terminal and start Claude:
```bash
claude
```

Try these commands:
> *"Claude, check my active TradingView chart. Is this ticker forming an opening range breakout above VWAP?"*  
> *"Calculate the volume delta between the last three 1-minute candles on my chart."*  
> *"Review my recent scalp on EVG. Did I adhere to the 1:2.5 risk/reward rule?"*

---

🎉 **Congratulations! You now have a complete, institutional-grade AI trading workflow.**
