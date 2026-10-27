#!/usr/bin/env python3
"""
webhook_server.py - TradingView Webhook Bridge & Execution Server
Part of the Claude + TradingView AI Trading System

Listens for webhook alerts sent by TradingView strategies/indicators, parses the trade signals,
and executes orders (Alpaca Paper Trading, Telegram alerts, or Mock/Dev Mode).

Run:
    python webhook_server.py
or
    uvicorn webhook_server:app --host 0.0.0.0 --port 5001 --reload
"""

import os
import json
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from pydantic import BaseModel
import requests
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("TradingViewWebhook")

app = FastAPI(
    title="TradingView AI Webhook Receiver",
    description="Bridge connecting TradingView Alerts to Execution & Alerts",
    version="1.0.0"
)

# Configuration from environment variables
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET", "super_secret_tradingview_passphrase")
ALPACA_API_KEY = os.getenv("ALPACA_API_KEY", "")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY", "")
ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL", "https://paper-api.alpaca.markets")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")
DRY_RUN = os.getenv("DRY_RUN", "true").lower() in ("true", "1", "yes")

class SignalPayload(BaseModel):
    ticker: str
    action: str  # "buy", "sell", "close"
    price: Optional[float] = None
    qty: Optional[int] = 10
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    strategy: Optional[str] = "TradingView Alert"
    secret: Optional[str] = None
    extra: Optional[Dict[str, Any]] = None

def send_telegram_alert(message: str):
    """Optionally send trade alerts to Telegram."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return
    try:
        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
        requests.post(url, json=payload, timeout=5)
    except Exception as e:
        logger.warning(f"Failed to send Telegram notification: {e}")

def execute_alpaca_order(signal: SignalPayload):
    """Execute order via Alpaca API."""
    if DRY_RUN or not ALPACA_API_KEY or not ALPACA_SECRET_KEY:
        logger.info(f"[SIMULATION / DRY_RUN] Simulated execution for {signal.action.upper()} {signal.qty} {signal.ticker} at approx ${signal.price}")
        send_telegram_alert(f"🧪 *[SIMULATION]*\n{signal.action.upper()} {signal.qty} `{signal.ticker}` @ ${signal.price}\nStrategy: {signal.strategy}")
        return

    headers = {
        "APCA-API-KEY-ID": ALPACA_API_KEY,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
        "Content-Type": "application/json"
    }

    order_data = {
        "symbol": signal.ticker,
        "qty": signal.qty,
        "side": signal.action.lower(),
        "type": "market",
        "time_in_force": "gtc"
    }

    # Add bracket order if SL/TP provided
    if signal.stop_loss and signal.take_profit:
        order_data["order_class"] = "bracket"
        order_data["take_profit"] = {"limit_price": signal.take_profit}
        order_data["stop_loss"] = {"stop_price": signal.stop_loss}

    try:
        resp = requests.post(f"{ALPACA_BASE_URL}/v2/orders", json=order_data, headers=headers, timeout=10)
        if resp.status_code in (200, 201):
            logger.info(f"✅ Alpaca order placed successfully for {signal.ticker}: {resp.json().get('id')}")
            send_telegram_alert(f"🚀 *ORDER EXECUTED*\n{signal.action.upper()} {signal.qty} `{signal.ticker}`\nOrder ID: `{resp.json().get('id')}`")
        else:
            logger.error(f"❌ Alpaca order error {resp.status_code}: {resp.text}")
    except Exception as e:
        logger.error(f"❌ Failed to reach Alpaca API: {e}")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "TradingView AI Webhook Receiver",
        "dry_run": DRY_RUN,
        "time": datetime.now(timezone.utc).isoformat()
    }

@app.post("/webhook")
async def receive_webhook(request: Request, background_tasks: BackgroundTasks):
    try:
        body = await request.json()
    except Exception:
        raw = await request.body()
        logger.warning(f"Could not parse JSON. Raw body: {raw.decode('utf-8', errors='ignore')}")
        raise HTTPException(status_code=400, detail="Invalid JSON body")

    # Passphrase security check
    if WEBHOOK_SECRET and body.get("secret") != WEBHOOK_SECRET:
        logger.warning("Unauthorized webhook request: invalid secret passphrase.")
        raise HTTPException(status_code=401, detail="Unauthorized: invalid secret")

    try:
        signal = SignalPayload(**body)
    except Exception as e:
        logger.error(f"Validation error for signal: {e}")
        raise HTTPException(status_code=422, detail=str(e))

    logger.info(f"📥 Received valid signal: {signal.action.upper()} {signal.ticker} (Strategy: {signal.strategy})")
    background_tasks.add_task(execute_alpaca_order, signal)

    return {"status": "success", "message": f"Signal received for {signal.ticker}"}

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print(" 🚀 TradingView AI Webhook Server")
    print(" Listening on: http://0.0.0.0:5001")
    print(f" Mode: {'DRY RUN (Simulation)' if DRY_RUN else 'LIVE EXECUTION'}")
    print("="*60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=5001)
