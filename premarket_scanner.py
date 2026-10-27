#!/usr/bin/env python3
"""
premarket_scanner.py - Premarket Gap Scanner & News Catalyst Analyzer
Part of the Claude + TradingView AI Trading System (Humbled Trader workflow)

Features:
- Scans a watchlist or popular tickers for premarket gappers (>= 2% or <= -2%).
- Calculates gap percentage, volume, relative volume (RVOL), 20-day ATR.
- Fetches news catalysts from Yahoo Finance.
- Generates a structured Markdown report formatted for Claude AI evaluation.
"""

import sys
import os
import json
import warnings
from datetime import datetime
from typing import List, Dict, Any

warnings.filterwarnings("ignore")

try:
    import yfinance as yf
except ImportError:
    print("Error: yfinance is required. Install it using: pip install yfinance")
    sys.exit(1)

# Default watchlist for premarket scanning (large cap tech, high beta, momentum names)
DEFAULT_WATCHLIST = [
    "NVDA", "TSLA", "AMD", "AAPL", "MSFT", "AMZN", "META", "GOOGL",
    "PLTR", "SMCI", "COIN", "MSTR", "ARM", "NFLX", "AVGO", "QQQ", "SPY"
]

def get_ticker_premarket_data(ticker_symbol: str) -> Dict[str, Any]:
    """Fetch current/premarket price, previous close, gap %, and volume."""
    try:
        t = yf.Ticker(ticker_symbol)
        fast_info = t.fast_info
        prev_close = fast_info.previous_close
        
        # Try to get live/premarket price
        last_price = fast_info.last_price or prev_close
        if not prev_close or prev_close == 0:
            return None
        
        gap_pct = ((last_price - prev_close) / prev_close) * 100
        vol = fast_info.last_volume or 0
        three_month_avg_vol = fast_info.three_month_average_volume or 1
        rvol = vol / (three_month_avg_vol / 6.5) if three_month_avg_vol > 0 else 0
        
        # News
        news_items = []
        try:
            raw_news = t.news[:3] if hasattr(t, "news") and t.news else []
            for n in raw_news:
                # Handle varying yfinance news structures
                content = n.get("content", {}) if isinstance(n, dict) else {}
                title = content.get("title") or n.get("title") or "No title"
                publisher = content.get("provider", {}).get("displayName") or n.get("publisher") or "News"
                link = content.get("canonicalUrl", {}).get("url") or n.get("link") or ""
                news_items.append({"title": title, "publisher": publisher, "link": link})
        except Exception:
            news_items = []

        return {
            "symbol": ticker_symbol,
            "last_price": round(float(last_price), 2),
            "prev_close": round(float(prev_close), 2),
            "gap_pct": round(float(gap_pct), 2),
            "volume": int(vol),
            "rvol": round(float(rvol), 2),
            "news": news_items
        }
    except Exception as e:
        return None

def scan_premarket(tickers: List[str] = None, min_gap_pct: float = 1.5) -> List[Dict[str, Any]]:
    """Scan watchlist for stocks meeting minimum gap threshold."""
    watchlist = tickers or DEFAULT_WATCHLIST
    print(f"[*] Scanning {len(watchlist)} tickers for premarket gaps (min threshold: ±{min_gap_pct}%)...")
    results = []
    
    for symbol in watchlist:
        data = get_ticker_premarket_data(symbol)
        if data and abs(data["gap_pct"]) >= min_gap_pct:
            results.append(data)
            
    # Sort by absolute gap % descending
    results.sort(key=lambda x: abs(x["gap_pct"]), reverse=True)
    return results

def format_markdown_report(gappers: List[Dict[str, Any]]) -> str:
    """Format results into a markdown briefing for Claude AI."""
    timestamp = datetime.now().strftime("%Y-%m-%d %I:%M %p")
    report = []
    report.append(f"# 📊 Premarket Gappers & Catalyst Report")
    report.append(f"**Generated:** {timestamp}\n")
    report.append(f"Found **{len(gappers)}** stocks with significant premarket gaps.\n")
    
    if not gappers:
        report.append("No stocks met the gap threshold. The market may be in a low-volatility state or quiet premarket.")
        return "\n".join(report)

    report.append("| Symbol | Last Price | Prev Close | Gap % | RVOL | Top Catalyst Headline |")
    report.append("|---|---|---|---|---|---|")
    
    for g in gappers:
        direction = "🟢 +" if g["gap_pct"] > 0 else "🔴 "
        gap_str = f"{direction}{g['gap_pct']:.2f}%"
        news_headline = g["news"][0]["title"] if g["news"] else "No recent headline"
        # Truncate headline for table display
        if len(news_headline) > 60:
            news_headline = news_headline[:57] + "..."
        report.append(f"| **{g['symbol']}** | ${g['last_price']:.2f} | ${g['prev_close']:.2f} | {gap_str} | {g['rvol']:.2f}x | {news_headline} |")
    
    report.append("\n## Detailed Catalyst Breakdown\n")
    for g in gappers:
        report.append(f"### {g['symbol']} ({'+' if g['gap_pct'] > 0 else ''}{g['gap_pct']}%)")
        report.append(f"- **Current / Premarket:** ${g['last_price']:.2f} | **Prior Close:** ${g['prev_close']:.2f}")
        report.append(f"- **Volume:** {g['volume']:,} | **Relative Volume (RVOL):** {g['rvol']}x")
        if g["news"]:
            report.append("- **Recent News Catalysts:**")
            for item in g["news"]:
                report.append(f"  - *{item['publisher']}*: [{item['title']}]({item['link']})")
        else:
            report.append("- *No direct news catalyst found on wire.*")
        report.append("")

    report.append("---")
    report.append("### 🤖 Claude AI Prompt Recommendation:")
    report.append("> Paste this report to Claude along with TradingView MCP:")
    report.append('> *"Claude, please analyze these gappers. For the top 2 tickers with the highest RVOL and cleanest catalyst, switch the TradingView chart to their symbol, identify the key premarket support and resistance levels, and suggest a 5-minute opening range breakout strategy with 1:2 risk/reward."*')

    return "\n".join(report)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Premarket Gap & Catalyst Scanner")
    parser.add_argument("--threshold", type=float, default=1.0, help="Minimum gap percentage (default: 1.0)")
    parser.add_argument("--output", type=str, default="premarket_report.md", help="Output markdown filename")
    parser.add_argument("--tickers", nargs="+", help="Custom tickers to scan")
    args = parser.parse_args()

    gappers = scan_premarket(args.tickers, min_gap_pct=args.threshold)
    markdown_content = format_markdown_report(gappers)
    
    output_path = os.path.join(os.path.dirname(__file__), args.output)
    with open(output_path, "w") as f:
        f.write(markdown_content)
        
    print(f"\n[+] Scan complete! Found {len(gappers)} gappers.")
    print(f"[+] Report saved to: {output_path}\n")
    print(markdown_content)
