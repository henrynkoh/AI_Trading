# 🤖 ALPHA-3 // Quantum Momentum Scalp Terminal & TradingView AI System

A singular, comprehensive, end-to-end algorithmic trading and market scanning terminal that continuously monitors **all ~5,000+ tickers registered on NASDAQ, NYSE, and AMEX** in real-time.

It isolates abnormal trade volume surges and price impact velocity, automatically narrowing the entire US equity universe down to the **TOP 3 High-Probability Momentum Tickers** designed to capture upward price expansions within seconds to minutes.

---

## 📚 Complete Documentation & Guides

| Document | Description | Link |
|---|---|---|
| **⚡ Quickstart Guide** | 3-minute rapid launch checklist & setup | [docs/quickstart.md](docs/quickstart.md) |
| **📖 Technical Manual** | In-depth architecture, algorithm formulas & config | [docs/manual.md](docs/manual.md) |
| **🎓 Hands-On Tutorial** | Morning routine walkthrough & live scalp execution | [docs/tutorial.md](docs/tutorial.md) |
| **📢 Marketing & Ads Kit**| Ads for Facebook, IG, Threads, Naver, Tistory, etc. | [marketing/](marketing/) |

---

## 🏛️ System Architecture

```mermaid
graph TD
    UNIVERSE[NASDAQ & NYSE Master Universe<br/>4,500+ Active Stocks] -->|Real-Time Screener API| ENGINE[Momentum Scalp Engine<br/>momentum_engine.py]
    
    ENGINE -->|Multi-Factor Analysis| TOP3[Top 3 High-Probability Scalps<br/>Target 1: +1.5% to +3% in 30s-3m]
    ENGINE -->|Live Movers Grid| MOVERS[All Active Market Movers<br/>RVOL, Price Impact, VWAP Delta]
    
    TOP3 --> COCKPIT[Singular Web Cockpit<br/>http://localhost:5001]
    MOVERS --> COCKPIT
    
    COCKPIT <-->|1-Click CDP Sync| TV_DESKTOP[TradingView Desktop App<br/>Port 9222 Debug Mode]
    COCKPIT -->|1-Click Bracket Order| BROKER[Execution Bridge<br/>Alpaca Paper / Webhook]
```

---

## ⚡ Core Features Added

### 1. Full-Market NASDAQ & NYSE Real-Time Scanner
- Continuously scans over **4,500+ active US equities** in sub-second response times (~350ms).
- Monitors volume velocity, 10-day relative volume (RVOL), distance to VWAP, intraday price impact since open, and session high breakouts.

### 2. Multi-Factor "Alpha-3" Momentum Matrix (Top 3 Selection)
To achieve ultra-high conviction on short-duration upward moves, the engine scores each stock (0 to 99.9%):
- **Volume Surge Factor (Up to 35 pts)**: Abnormal institutional accumulation (3x to 50x+ RVOL).
- **Price Impact & VWAP Control (Up to 30 pts)**: Holding and expanding above VWAP with positive intraday expansion from open.
- **Structural Breakout (Up to 20 pts)**: Testing or breaking session highs with minimal pullback.
- **Technical Confluence (Up to 15 pts)**: RSI-7 momentum sweet-spot (55–82) and TradingView technical ratings.

### 3. Micro-Scalp Execution Brackets (Seconds to Minutes)
For each of the Top 3 tickers, the system calculates:
- **Recommended Entry Price**
- **Micro-Target 1 (1–2 minutes)**: +1.2% to +2.6% quick scalp capture.
- **Scalp Runner Target 2 (2–5 minutes)**: +2.5% to +4.5% momentum continuation.
- **Hard Stop-Loss**: Strictly anchored below VWAP or 1.2x ATR support to preserve capital.
- **Risk / Reward**: Minimum 1:2.5 ratio.

### 4. Singular Unified Terminal Interface (`http://localhost:5001`)
- **Top 3 Hero Showcase**: 3 live glassmorphism cards featuring the top opportunities with live probability gauges, RVOL metrics, and bracket targets.
- **Embedded Interactive TradingView Chart**: Live candles, volume, and VWAP overlay, updated on-the-fly when clicking any stock.
- **All NASDAQ & NYSE Movers Table**: Searchable, filterable by exchange, RVOL > 5x, penny momentum (<$10), or large-cap ($50+).
- **1-Click TradingView Desktop Sync**: Commands your local TradingView Desktop app on port 9222 to immediately switch to the active stock.
- **1-Click Scalp Execution**: Submits simulated or paper trading orders with automatic SL/TP brackets.
- **Audio Chime Alerts**: Synthesized Web Audio chime triggers whenever a new stock surges to the #1 rank.

---

## 🚀 Running the Terminal

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start TradingView Desktop with remote debugging
./launch_tradingview.sh

# 3. Start the Unified Server (FastAPI + Web Terminal)
python3 server.py

# 4. Open in your browser
http://localhost:5001
```

---

## 🛠️ API Reference

- `GET /api/scan`: Runs real-time NASDAQ/NYSE scan, returns Top 3 and top 80 movers.
- `GET /api/status`: Checks health of TradingView Desktop (CDP port 9222) and execution status.
- `POST /api/sync-desktop`: `{ "symbol": "EVG", "timeframe": "1" }` — syncs desktop chart.
- `POST /api/execute-trade`: `{ "symbol": "EVG", "action": "buy", "qty": 10, "price": 10.40, "stop_loss": 10.22, "take_profit": 10.67 }`.
- `POST /webhook`: Handles TradingView alert webhooks.

---

## 📈 Included Pine Script Strategies

1. **VWAP Trend Pullback Strategy** ([`pine_strategies/vwap_pullback_strategy.pine`](pine_strategies/vwap_pullback_strategy.pine))
2. **Premarket Breakout Strategy** ([`pine_strategies/premarket_breakout_strategy.pine`](pine_strategies/premarket_breakout_strategy.pine))

Both verified with TradingView's compiler (0 errors, 0 warnings).
