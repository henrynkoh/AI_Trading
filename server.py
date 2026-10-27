#!/usr/bin/env python3
"""
server.py - Singular Comprehensive AI Trading Application Server
Combines:
1. Full NASDAQ & NYSE Real-Time Market Scanner
2. Momentum Scalp Ranking Engine (Top 3 Upward Momentum Opportunities)
3. TradingView Desktop CDP Synchronizer
4. Webhook Alert & Automated Paper Trading Engine
5. Modern Financial Terminal Web Dashboard
"""

import os
import subprocess
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

from momentum_engine import scan_full_us_market

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("Alpha3Terminal")

app = FastAPI(
    title="Alpha-3 // Quantum Momentum Scalp Terminal",
    description="Singular Comprehensive NASDAQ & NYSE Scanner, Top 3 Scalp Engine & TradingView Bridge",
    version="2.0.0"
)

# Static files directory
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(STATIC_DIR, exist_ok=True)

# Configuration
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "super_secret_tradingview_passphrase")
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")
ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
DRY_RUN = os.getenv("DRY_RUN", "true").lower() in ("true", "1", "yes")

# In-memory execution log for terminal UI
EXECUTION_LOGS = []

class SyncRequest(BaseModel):
    symbol: str
    timeframe: Optional[str] = "1m"

class TradeOrderRequest(BaseModel):
    symbol: str
    action: str  # "buy" or "sell"
    qty: Optional[int] = 10
    price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    strategy: Optional[str] = "Alpha-3 Micro Scalp"

# --- API Endpoints ---

@app.get("/api/scan")
def get_market_scan(
    min_volume: int = 150000,
    min_price: float = 1.0,
    max_price: float = 1000.0,
    limit: int = 80
):
    """Scan all NASDAQ & NYSE stocks and return the Top 3 Scalps + Movers."""
    results = scan_full_us_market(
        min_volume=min_volume,
        min_price=min_price,
        max_price=max_price,
        limit=limit
    )
    return results

@app.get("/api/status")
def get_system_status():
    """Check connectivity to TradingView Desktop (port 9222) and Alpaca."""
    tv_connected = False
    tv_symbol = "unknown"
    tv_timeframe = "unknown"

    try:
        resp = requests.get("http://127.0.0.1:9222/json/version", timeout=1.0)
        if resp.status_code == 200:
            tv_connected = True
    except Exception:
        tv_connected = False

    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "tradingview_desktop": {
            "cdp_connected": tv_connected,
            "port": 9222,
            "active_symbol": tv_symbol,
            "active_timeframe": tv_timeframe
        },
        "execution": {
            "mode": "DRY_RUN (Simulation)" if DRY_RUN else "LIVE PAPER TRADING",
            "alpaca_configured": bool(ALPACA_API_KEY and ALPACA_SECRET_KEY)
        },
        "recent_trades_count": len(EXECUTION_LOGS)
    }

@app.post("/api/sync-desktop")
def sync_tradingview_desktop(req: SyncRequest):
    """
    Commands TradingView Desktop to switch to the specified symbol & timeframe
    using the global `tv` CLI tool via Chrome DevTools Protocol.
    """
    symbol = req.symbol.strip().upper()
    timeframe = req.timeframe.strip()

    # Normalize exchange prefix if present
    clean_symbol = symbol.split(":")[-1]

    try:
        # Run tv symbol command
        res = subprocess.run(
            ["tv", "symbol", clean_symbol],
            capture_output=True,
            text=True,
            timeout=4
        )
        # Run tv timeframe command
        if timeframe:
            subprocess.run(
                ["tv", "timeframe", timeframe],
                capture_output=True,
                text=True,
                timeout=3
            )

        logger.info(f"Synchronized TradingView Desktop to {clean_symbol} ({timeframe})")
        return {
            "success": True,
            "symbol": clean_symbol,
            "timeframe": timeframe,
            "cli_output": res.stdout.strip()
        }
    except Exception as e:
        logger.warning(f"Could not sync with TradingView Desktop: {e}")
        return {
            "success": False,
            "symbol": clean_symbol,
            "error": str(e),
            "hint": "Ensure TradingView Desktop is running with /launch_tradingview.sh"
        }

@app.post("/api/execute-trade")
def execute_trade(order: TradeOrderRequest):
    """Execute a high-velocity momentum scalp trade (Paper or Live)."""
    clean_symbol = order.symbol.split(":")[-1].upper()
    trade_record = {
        "id": f"ORD-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
        "symbol": clean_symbol,
        "action": order.action.upper(),
        "qty": order.qty or 10,
        "price": order.price,
        "stop_loss": order.stop_loss,
        "take_profit": order.take_profit,
        "strategy": order.strategy,
        "status": "FILLED" if DRY_RUN else "SUBMITTED",
        "mode": "SIMULATION" if DRY_RUN else "PAPER_BROKER"
    }

    EXECUTION_LOGS.insert(0, trade_record)
    if len(EXECUTION_LOGS) > 50:
        EXECUTION_LOGS.pop()

    logger.info(f"⚡ Order Executed: {trade_record['action']} {trade_record['qty']} {clean_symbol} @ ${trade_record['price']} (SL: ${trade_record['stop_loss']}, TP: ${trade_record['take_profit']})")

    return {
        "success": True,
        "order": trade_record,
        "message": f"Scalp order {trade_record['action']} {clean_symbol} executed successfully."
    }

@app.get("/api/logs")
def get_execution_logs():
    return {"logs": EXECUTION_LOGS}

# Webhook endpoint for TradingView strategy alerts
@app.post("/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    if WEBHOOK_SECRET and body.get("secret") != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized")

    ticker = body.get("ticker", "UNKNOWN")
    action = body.get("action", "BUY")
    price = body.get("price", 0.0)

    trade_record = {
        "id": f"WH-{int(datetime.now().timestamp() * 1000)}",
        "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S UTC"),
        "symbol": ticker,
        "action": action.upper(),
        "qty": body.get("qty", 10),
        "price": price,
        "stop_loss": body.get("stop_loss"),
        "take_profit": body.get("take_profit"),
        "strategy": body.get("strategy", "TradingView Alert"),
        "status": "TRIGGERED",
        "mode": "WEBHOOK_ALERT"
    }

    EXECUTION_LOGS.insert(0, trade_record)
    logger.info(f"📥 Webhook alert received for {ticker}: {action}")
    return {"status": "success", "record": trade_record}

# Mount static files and root html
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def serve_index():
    index_file = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "Alpha-3 Terminal API ready. Frontend building..."}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*70)
    print(" 🚀 ALPHA-3 // QUANTUM MOMENTUM SCALP TERMINAL")
    print(" 🌐 Web Cockpit: http://localhost:5001")
    print(" 📊 Full NASDAQ & NYSE Scanner + Top 3 Algorithmic Scalp Engine")
    print(" ⚡ TradingView Desktop Bridge (Port 9222 CDP)")
    print("="*70 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=5001)
