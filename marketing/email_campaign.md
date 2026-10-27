# ✉️ Email Marketing Sequence — ALPHA-3 AI Trading System

A high-converting 3-part automated email nurture and onboarding sequence for new subscribers, waitlist members, and algorithmic trading leads.

---

## 📧 Email 1: Welcome & Immediate Access (Day 0)

**Subject:** [Access Granted] Your 4,500-Stock Momentum Scalp Terminal is ready ⚡  
**Preview Text:** Here is your link to launch the ALPHA-3 cockpit on your local machine in under 3 minutes.  

Hey {{ first_name | default: "Trader" }},

Welcome to the **ALPHA-3** community.

If you’ve ever sat at your desk at market open feeling overwhelmed by 10 different watchlists—only to watch a stock you never heard of surge +75% without you—you’re in the right place.

We built ALPHA-3 to solve a single, painful problem: **how to scan the entire US market of 4,500+ NASDAQ & NYSE stocks in real time and isolate the TOP 3 momentum scalps before the retail herd notices.**

### Here is what you have access to right now:
1. **The Real-Time Momentum Engine:** Scans 4,500+ stocks in sub-second batches (~0.35s).
2. **The "Alpha-3" Matrix:** Ranks the universe down to the Top 3 setups with exact Target 1 (+1.5% to +2.5%) and VWAP-anchored stop loss.
3. **1-Click TradingView Desktop Sync:** Press one button to immediately load that stock on your local TradingView 1-minute chart.
4. **100% Free & Open-Source:** No paywalls, no monthly subscription fees.

### Quick 3-Minute Launch Instructions:
```bash
# 1. Clone the repository
git clone https://github.com/henrynkoh/AI_Trading.git
cd AI_Trading

# 2. Install dependencies & launch
pip install -r requirements.txt
./launch_tradingview.sh
python3 server.py
```
Then open **`http://localhost:5001`** in your browser.

👉 **Access the GitHub Repository Here:**  
[https://github.com/henrynkoh/AI_Trading](https://github.com/henrynkoh/AI_Trading)

Tomorrow, I’ll send you the exact mathematical formula our engine uses to filter out 98% of fakeouts and bull traps.

Until then, explore the cockpit and test a few paper scalps!

Best,  
**Henry Koh**  
*Creator, ALPHA-3 Trading System*

---

## 📧 Email 2: The Math Behind the "Top 3" Matrix (Day 1)

**Subject:** Why 99% of technical indicators fail in 1-minute scalping 📉  
**Preview Text:** If you're using lagging indicators on 1-minute charts, here's why the algos are eating your lunch...  

Hey {{ first_name | default: "Trader" }},

Most retail traders think scalping requires 15 different indicators: MACD, Bollinger Bands, Stochastics, Parabolic SAR, and 5 Moving Averages.

Here’s the harsh reality: **every single one of those indicators is lagging.**

On a 1-minute candlestick chart, by the time your 20 EMA crosses above your 50 EMA, the institutional buying pressure that triggered the move happened 4 minutes ago. You're buying the exhaustion top.

### The Only Two Variables That Move Price Instantly:
1. **Aggressive Volume Influx (RVOL):** Are orders hitting the ask at 5x to 50x normal volume?
2. **VWAP Structural Dominance:** Are buyers willing to pay above the average price paid by everyone else today?

### The Alpha-3 Scoring Formula:
Inside [`momentum_engine.py`](https://github.com/henrynkoh/AI_Trading), we score every stock on a 0 to 99.9 scale:

- **Relative Volume Surge (Up to 35 pts):** Stocks with RVOL > 5x get prioritized immediately.
- **VWAP Expansion (Up to 30 pts):** Price must be expanding above VWAP with positive gains from open. (Trading below VWAP incurs an automatic 10-point penalty).
- **Session High Breakout (Up to 20 pts):** Price must be holding within the top 5% of the day’s range.
- **RSI-7 Velocity Sweet-Spot (Up to 15 pts):** Fast 7-period RSI between 55 and 82—avoiding overbought blow-offs.

When a stock scores above 85 points, the probability of an immediate 1.5% to 3.0% upward continuation spike is at its highest statistical edge.

👉 **Inspect the formula in the open-source code:**  
[https://github.com/henrynkoh/AI_Trading](https://github.com/henrynkoh/AI_Trading)

Tomorrow, I'll walk you through how we connect this engine directly to the physical TradingView Desktop application using Chrome DevTools Protocol.

Stay disciplined,  
**Henry Koh**

---

## 📧 Email 3: The 1-Click TradingView Desktop Execution (Day 3)

**Subject:** Stop typing tickers manually (1-Click TradingView Sync) ⚡  
**Preview Text:** How to connect your terminal cockpit to TradingView Desktop on port 9222...  

Hey {{ first_name | default: "Trader" }},

In fast-paced momentum trading, friction kills profits.

Think about what usually happens when a scanner beeps:
1. You read the ticker.
2. You click into your charting software.
3. You type the ticker into the search bar.
4. You change the timeframe to 1 minute.
5. You draw your VWAP and support lines.

By the time you finish, 30 seconds have passed—and the stock has already gained 2.5% and started consolidating.

### The Solution: Instantaneous CDP Desktop Bridge
Because the TradingView Desktop app is built on Electron, ALPHA-3 connects directly to its internal debugging port (`9222`).

When you click **`⚡ SYNC DESKTOP`** on any Top 3 card in your ALPHA-3 web cockpit:
- TradingView Desktop instantly changes to that stock.
- The chart timeframe immediately snaps to the 1-minute view.
- Your Pine Script levels and volume indicators are already rendered.

You eliminate 100% of the manual typing and emotional lag.

### Ready to elevate your trading workflow?
If you haven’t yet, clone the project, run `./launch_tradingview.sh`, and start your cockpit before tomorrow’s opening bell:

👉 **[Launch ALPHA-3 on GitHub](https://github.com/henrynkoh/AI_Trading)**

If you enjoy the project, please leave a **Star (⭐)** on GitHub—it helps us keep building free, open-source quantitative tools for independent traders worldwide!

To your trading edge,  
**Henry Koh**  
*ALPHA-3 AI Trading System*
