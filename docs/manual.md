# 📖 ALPHA-3 AI Trading System — Comprehensive Technical Manual

An in-depth reference manual for configuring, understanding, and operating the **ALPHA-3 Quantum Momentum Scalp Terminal & TradingView AI System**.

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [The Momentum Scalp Matrix Algorithm](#2-the-momentum-scalp-matrix-algorithm)
3. [Full-Universe NASDAQ & NYSE Scanner](#3-full-universe-nasdaq--nyse-scanner)
4. [TradingView Desktop CDP Integration](#4-tradingview-desktop-cdp-integration)
5. [Webhook Server & Execution Bridge](#5-webhook-server--execution-bridge)
6. [Pine Script Strategy Library](#6-pine-script-strategy-library)
7. [Risk Management & Scalping Rules](#7-risk-management--scalping-rules)
8. [Configuration & Environment Variables](#8-configuration--environment-variables)
9. [Troubleshooting & Diagnostics](#9-troubleshooting--diagnostics)

---

## 1. Architecture Overview

ALPHA-3 connects four primary subsystems into one singular, unified workflow:

```
[ NASDAQ & NYSE Equities (~5,000+ Tickers) ]
                     │ (Sub-second batch query)
                     ▼
      [ momentum_engine.py Scanner ]
                     │ (Multi-factor ranking)
                     ▼
       [ Top 3 Scalp Decision Engine ]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
[ Web Terminal Cockpit ]  [ TradingView Desktop ]
   (http://localhost:5001)    (CDP Port 9222)
         │                       │
         └───────────┬───────────┘
                     ▼
      [ Webhook Execution Bridge ]
    (Alpaca Paper Trading / Telegram)
```

- **Data Layer:** High-speed screener endpoints fetching real-time quotes, 10-day volume averages, VWAP, intraday price delta, RSI-7, and ATR across all active US equities.
- **Decision Engine:** Quantitative multi-factor algorithm prioritizing stocks experiencing abnormal volume surges and positive price acceleration.
- **Control Interface:** Real-time web cockpit with dark cyber-financial UI, dynamic TradingView chart embedding, and 1-click desktop synchronization.
- **Execution Layer:** FastAPI webhook receiver supporting automated bracket order entry (entry, stop loss, take profit) with zero slippage dry-run simulation or live paper routing.

---

## 2. The Momentum Scalp Matrix Algorithm

The system scores stocks on a scale from `0.0` to `99.9` points using four distinct quantitative pillars designed specifically for ultra-short duration (seconds to minutes) scalp setups:

### Pillar 1: Relative Volume (RVOL) Surge (Up to 35 Points)
High relative volume indicates that institutional algorithms and retail volume are aggressively entering the order book:
$$\text{RVOL} = \frac{\text{Current Volume}}{\text{10-Day Average Volume} \times \text{Session Progress}}$$
- **RVOL $\ge$ 10.0x:** +35 pts *(Extreme institutional accumulation)*
- **RVOL $\ge$ 5.0x:** +28 pts *(Strong momentum inflow)*
- **RVOL $\ge$ 3.0x:** +20 pts *(Unusual volume activity)*
- **RVOL $\ge$ 1.5x:** +12 pts

### Pillar 2: Price Impact & VWAP Control (Up to 30 Points)
When a stock trades above its Volume Weighted Average Price (VWAP), institutional buyers are in positive territory and defending dips:
- **Price $\ge$ VWAP and $0.2\% \le \Delta_{\text{VWAP}} \le 4.0\%$:** +20 pts *(Ideal breakout sweet-spot)*
- **Price $\ge$ VWAP and $\Delta_{\text{VWAP}} > 4.0\%$:** +12 pts *(Extended momentum)*
- **Price $<$ VWAP:** -10 pts penalty *(Failing structure, higher fakeout risk)*
- **Change From Open $> +5.0\%$:** +10 pts *(Intraday expansion)*
- **Change From Open $< -2.0\%$:** -8 pts penalty *(Fading morning highs)*

### Pillar 3: Session High Structural Breakout (Up to 20 Points)
Measures where current price is relative to the day's high/low range:
$$\text{Range Ratio} = \frac{\text{High} - \text{Close}}{\text{High} - \text{Low}}$$
- **Range Ratio $\le 0.05$ (within top 5% of day):** +20 pts *(Breaking or testing session high)*
- **Range Ratio $\le 0.15$ (top 15% of day):** +14 pts
- **Range Ratio $> 0.50$ (below midpoint):** -5 pts penalty

### Pillar 4: Technical Confluence (Up to 15 Points)
- **Fast RSI-7 between 55.0 and 82.0:** +10 pts *(Strong upward impulse without extreme exhaustion)*
- **RSI-7 $> 85.0$:** +4 pts *(Caution: parabolic climax zone)*
- **TradingView Consensus $> 0.3$:** +5 pts

---

## 3. Full-Universe NASDAQ & NYSE Scanner

The scanner is implemented in [`momentum_engine.py`](file:///Users/henryoh/Documents/sass/ai-trading-system/momentum_engine.py).

### Key Functions
- `scan_full_us_market(min_volume=150000, min_price=1.0, max_price=1000.0, limit=80)`
  - Submits a filtered JSON query covering the complete active US equity list.
  - Returns:
    - `total_universe_scanned`: Number of stocks analyzed (typically ~4,500 - 5,200).
    - `top_3`: The highest-ranked scalp opportunities.
    - `market_movers`: Full table of top volume and price movers.

### Execution Target Calculation
For each top ticker, the engine dynamically calculates a bracket order:
- **Recommended Entry:** Current real-time price.
- **Stop Loss:** Anchored strictly below VWAP or 1.2x ATR:
  $$\text{Stop Loss} = \text{Close} - \max(0.6\% \times \text{Close}, \min(2\% \times \text{Close}, 0.9 \times \text{ATR}))$$
- **Target 1 (1–2 minutes):** $+1.2\%$ to $+2.6\%$ upward scalp capture.
- **Target 2 (Runner):** $+2.5\%$ to $+4.5\%$ continuation capture.
- **Risk / Reward:** Minimum $1 : 2.5$.

---

## 4. TradingView Desktop CDP Integration

The Model Context Protocol (MCP) bridge communicates directly with your locally installed TradingView Desktop application using Chrome DevTools Protocol on port `9222`.

### Launching TradingView
```bash
# Easy launcher script:
./launch_tradingview.sh

# Or via global CLI:
tv launch
```

### Supported Global `tv` CLI Commands
- `tv status`: Check CDP connection state.
- `tv symbol <TICKER>`: Immediately change chart symbol (e.g., `tv symbol NVDA`).
- `tv timeframe <TF>`: Change candle timeframe (e.g., `tv timeframe 1m`).
- `tv quote --symbol <TICKER>`: Fetch real-time price quote.
- `tv screenshot --output chart.png`: Capture visual chart image.
- `tv pine check --file <PATH>`: Compile-check any Pine Script strategy via TradingView compiler.

---

## 5. Webhook Server & Execution Bridge

Implemented in [`server.py`](file:///Users/henryoh/Documents/sass/ai-trading-system/server.py) and [`webhook_server.py`](file:///Users/henryoh/Documents/sass/ai-trading-system/webhook_server.py).

### Endpoints
- `GET /api/scan`: Triggers real-time market scan.
- `GET /api/status`: Health check for TradingView CDP and broker connection.
- `POST /api/sync-desktop`: `{ "symbol": "NVDA", "timeframe": "1" }`.
- `POST /api/execute-trade`: Submits bracket scalp order.
- `POST /webhook`: Ingests TradingView alert JSON messages.

### TradingView Alert Payload Format
```json
{
  "ticker": "{{ticker}}",
  "action": "{{strategy.order.action}}",
  "price": {{close}},
  "secret": "super_secret_tradingview_passphrase",
  "strategy": "{{strategy.name}}"
}
```

---

## 6. Pine Script Strategy Library

Two production-grade, compile-verified Pine Script strategies are provided in [`pine_strategies/`](file:///Users/henryoh/Documents/sass/ai-trading-system/pine_strategies):

1. **`vwap_pullback_strategy.pine`**
   - 9 EMA / 21 EMA / 200 EMA trend filtering.
   - Long entry on VWAP touch and bounce during bullish market trend.
   - Dynamic ATR trailing stop with 1:2 risk/reward limit.
2. **`premarket_breakout_strategy.pine`**
   - Automatically tracks premarket highs and lows (04:00 – 09:30 ET).
   - Fires breakout entry orders with embedded webhook alert payloads.

---

## 7. Risk Management & Scalping Rules

1. **Capital Allocation:** Never risk more than 1% to 2% of total account equity on any individual scalp.
2. **Hard Stops:** Always respect the Stop Loss level. In high-velocity micro-momentum scalps, taking a quick small loss preserves buying power for the next setup.
3. **Target 1 Discipline:** Scale out 50% to 75% of your position at Target 1 (+1.5% to +2.5%) and move the stop loss to breakeven for a risk-free runner.
4. **Time In Force:** If the stock does not produce the expected upward movement within 3 to 5 minutes, exit the trade to avoid capital stagnation.

---

## 8. Configuration & Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DRY_RUN` | Simulated execution mode (`true` or `false`) | `true` |
| `WEBHOOK_SECRET` | Passphrase to authenticate TradingView webhooks | `super_secret_tradingview_passphrase` |
| `ALPACA_API_KEY` | Alpaca Paper Trading API Key | *(empty)* |
| `ALPACA_SECRET_KEY`| Alpaca Paper Trading Secret Key | *(empty)* |
| `ALPACA_BASE_URL` | Alpaca REST endpoint | `https://paper-api.alpaca.markets` |
| `TELEGRAM_BOT_TOKEN`| Telegram Bot Token for live push alerts | *(empty)* |
| `TELEGRAM_CHAT_ID` | Telegram Chat ID to receive signals | *(empty)* |

---

## 9. Troubleshooting & Diagnostics

- **`CDP connection failed: fetch failed`**: TradingView Desktop is not running with port 9222 open. Run `./launch_tradingview.sh` to restart it with debugging enabled.
- **`Port 9222 occupied by another process`**: Run `lsof -i :9222` to see what is using the port.
- **Pine Script compiler error**: Run `tv pine check --file <your_script.pine>` to receive syntax error messages.
