# How I Built an AI Trading System That Scans All NASDAQ & NYSE Stocks in 0.35s

*Published on Tech & Algo Trader Blog*  
*Author: Henry Koh*

---

If you’ve spent any time day trading US equities, you know the feeling: you open Twitter or Discord at 10:00 AM, and everyone is bragging about a stock that just shot up +120%.

You pull up the chart, buy at the top, and within two minutes, the price plunges, taking your stop loss with it.

Why does this happen? Because **retail traders are always late to the party**. By the time a stock is trending on social media, the institutional algorithms that triggered the move have already taken profits.

To capture clean, explosive upward moves, you need a system that detects **abnormal volume velocity the second it enters the order book**.

Today, I’m open-sourcing **ALPHA-3**: a high-velocity momentum scalp terminal that scans over **4,500 active stocks across NASDAQ, NYSE, and AMEX** in real time, and automatically narrows the entire market down to the **TOP 3 highest-probability scalps**.

---

## The Core Problem with Manual Market Scanning

There are roughly 5,000 liquid stocks trading on US exchanges every day. Even with an expensive scanner tool, most retail setups suffer from:
1. **Information Overload:** You get 50 different ticker alerts with no clear ranking.
2. **Lag:** Scanners that refresh every 60 seconds are an eternity in momentum trading.
3. **Execution Delay:** By the time you manually type the ticker into TradingView and set your bracket orders, the move has already happened.

---

## The Breakthrough: The "Alpha-3" Momentum Matrix

Instead of looking at simple price gainers (which are often low-volume traps), ALPHA-3 evaluates every stock using four quantitative pillars:

1. **Relative Volume (RVOL) Surge (Up to 35 pts):**  
   We look for stocks trading at **5x to 50x their 10-day average volume**. When volume surges exponentially, it signals institutional positioning.
2. **VWAP Control & Positive Open Delta (Up to 30 pts):**  
   A stock must be expanding **above its Volume Weighted Average Price (VWAP)** with positive gains since the 9:30 AM open. This weeds out morning pump-and-dump fades.
3. **Session High Breakouts (Up to 20 pts):**  
   Price must be consolidating within the top 5% of its daily high/low range, setting up clean continuation breaks.
4. **Fast Technical Confluence (Up to 15 pts):**  
   Fast RSI-7 momentum sweet-spot (55–82) and positive TradingView technical consensus.

---

## 1-Click Synchronization with TradingView Desktop

One of the most powerful features of ALPHA-3 is its direct integration with the **TradingView Desktop application**.

Using the **Model Context Protocol (MCP)** and Chrome DevTools Protocol (CDP) on port `9222`, the terminal can command TradingView Desktop directly:

- Click **`⚡ SYNC DESKTOP`** on any Top 3 card.
- TradingView Desktop instantly changes its chart to that ticker on the **1-minute timeframe**.
- Your custom Pine Script indicators (VWAP, 9 EMA, 21 EMA) are already drawn on the screen, ready for execution.

---

## Automated Scalp Execution Brackets

Every Top 3 card automatically calculates an institutional-grade bracket order:
- **Recommended Entry:** Current real-time bid/ask.
- **Micro-Target 1 (1–2 minutes):** Quick +1.5% to +2.5% scalp capture.
- **Target 2 Runner (2–5 minutes):** +3.0% to +4.5% continuation move.
- **Hard Stop-Loss:** Strictly anchored below VWAP or 1.2x ATR support.
- **Risk / Reward Ratio:** Minimum 1:2.5.

You can click **`🚀 EXECUTE SCALP`** to place the order automatically in paper trading simulation mode.

---

## How to Get Started in 3 Minutes

The entire project is 100% open-source and free to run locally:

```bash
# 1. Clone the repository
git clone https://github.com/henrynkoh/AI_Trading.git
cd AI_Trading

# 2. Install dependencies
pip install -r requirements.txt

# 3. Launch TradingView Desktop with remote debugging
./launch_tradingview.sh

# 4. Start the unified terminal cockpit
python3 server.py
```

Then open your browser to **`http://localhost:5001`** and watch the live market scanner in action!

---

### Resources & Links
- 🔗 **GitHub Repository:** [github.com/henrynkoh/AI_Trading](https://github.com/henrynkoh/AI_Trading)
- 📖 **Documentation:** Full technical manual and tutorials are included in the `/docs` folder.
