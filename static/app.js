/**
 * ALPHA-3 // QUANTUM MOMENTUM SCALP TERMINAL JAVASCRIPT
 * Real-Time NASDAQ & NYSE Scanner, Top 3 Algorithmic Ranking, & TradingView Bridge
 */

// Application State
const state = {
    activeSymbol: "NASDAQ:AIOK",
    activeTimeframe: "1",
    autoScan: true,
    scanIntervalMs: 4000,
    soundEnabled: true,
    lastTopSymbol: null,
    scanTimer: null,
    isScanning: false,
    allMovers: [],
    currentFilter: "all",
    searchQuery: "",
    selectedScalpCandidate: null
};

// Web Audio Synthesizer for high-conviction chimes
const AudioChime = {
    ctx: null,
    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) this.ctx = new AudioContext();
        }
    },
    playChime() {
        if (!state.soundEnabled) return;
        try {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, now); // D5
            osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

            gain.gain.setValueAtTime(0.01, now);
            gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.35);
        } catch (e) {
            // Audio policy or unsupported
        }
    }
};

// DOM Elements
const DOM = {
    top3Container: document.getElementById("top3-cards-wrapper"),
    moversTableBody: document.getElementById("movers-table-body"),
    universeCount: document.getElementById("universe-count"),
    lastUpdatedText: document.getElementById("last-updated-text"),
    btnManualScan: document.getElementById("btn-manual-scan"),
    scanSpinner: document.getElementById("scan-spinner"),
    autoScanToggle: document.getElementById("auto-scan-toggle"),
    btnSoundToggle: document.getElementById("btn-sound-toggle"),
    soundIcon: document.getElementById("sound-icon"),
    chartActiveSymbol: document.getElementById("chart-active-symbol"),
    chartActiveName: document.getElementById("chart-active-name"),
    btnSyncChartDesktop: document.getElementById("btn-sync-chart-desktop"),
    searchInput: document.getElementById("search-ticker-input"),
    filterChips: document.querySelectorAll(".filter-chip"),
    timeframeButtons: document.querySelectorAll(".btn-tf"),
    logsFeed: document.getElementById("terminal-logs-feed"),
    logCountText: document.getElementById("log-count-text"),
    tvStatusBadge: document.getElementById("tv-connection-status"),
    // Modal
    modalBackdrop: document.getElementById("order-modal-backdrop"),
    modalBody: document.getElementById("modal-order-details"),
    btnCloseModal: document.getElementById("btn-close-modal"),
    btnCancelOrder: document.getElementById("btn-cancel-order"),
    btnConfirmOrder: document.getElementById("btn-confirm-order")
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    initTradingViewWidget(state.activeSymbol, state.activeTimeframe);
    attachEventListeners();
    fetchMarketScan();
    checkSystemStatus();
    startAutoScan();
});

// TradingView Advanced Chart Embed
let tvWidget = null;
function initTradingViewWidget(symbol, timeframe) {
    const container = document.getElementById("tradingview-widget-container");
    if (!container) return;

    // Normalize symbol for widget (e.g., NASDAQ:AIOK or AIOK)
    const cleanSymbol = symbol.includes(":") ? symbol : `NASDAQ:${symbol}`;

    container.innerHTML = "";
    const widgetDiv = document.createElement("div");
    widgetDiv.id = "tv-widget-embed";
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = "100%";
    container.appendChild(widgetDiv);

    if (window.TradingView) {
        tvWidget = new window.TradingView.widget({
            container_id: "tv-widget-embed",
            width: "100%",
            height: "100%",
            symbol: cleanSymbol,
            interval: timeframe,
            timezone: "America/New_York",
            theme: "dark",
            style: "1",
            locale: "en",
            toolbar_bg: "#0b111a",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            save_image: true,
            studies: [
                "VWAP@tv-basicstudies",
                "MASimple@tv-basicstudies"
            ],
            overrides: {
                "paneProperties.background": "#0b111a",
                "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.05)",
                "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.05)",
                "scalesProperties.textColor": "#94a3b8"
            }
        });
    }
}

// Fetch Full NASDAQ & NYSE Market Scan
async function fetchMarketScan() {
    if (state.isScanning) return;
    state.isScanning = true;
    if (DOM.scanSpinner) DOM.scanSpinner.classList.add("spin");

    try {
        const response = await fetch("/api/scan?limit=80");
        const data = await response.json();

        if (data.status === "success") {
            state.allMovers = data.market_movers || [];
            
            // Update Universe Metrics
            if (data.total_universe_scanned && DOM.universeCount) {
                DOM.universeCount.textContent = `${data.total_universe_scanned.toLocaleString()}+ TICKERS`;
            }

            // Render TOP 3 Cards
            renderTop3Cards(data.top_3 || []);

            // Check if #1 ticker changed to play audio alert
            if (data.top_3 && data.top_3.length > 0) {
                const currentLeader = data.top_3[0].symbol;
                if (state.lastTopSymbol && state.lastTopSymbol !== currentLeader) {
                    AudioChime.playChime();
                    appendLogEntry("ALERT", `New #1 Momentum Leader: ${currentLeader} with ${data.top_3[0].rvol}x RVOL`);
                }
                state.lastTopSymbol = currentLeader;
            }

            // Render Movers Table
            renderMoversTable();

            // Update timestamp
            if (DOM.lastUpdatedText) {
                const now = new Date();
                DOM.lastUpdatedText.textContent = `Scanned at ${now.toLocaleTimeString()}`;
            }
        }
    } catch (err) {
        console.error("Scan error:", err);
    } finally {
        state.isScanning = false;
        if (DOM.scanSpinner) DOM.scanSpinner.classList.remove("spin");
    }
}

// Render Top 3 Momentum Cards
function renderTop3Cards(top3) {
    if (!DOM.top3Container) return;

    if (!top3 || top3.length === 0) {
        DOM.top3Container.innerHTML = `<div class="card-skeleton">No momentum movers meeting threshold right now.</div>`;
        return;
    }

    const rankTitles = [
        { class: "gold", text: "#1 HIGHEST VELOCITY" },
        { class: "silver", text: "#2 CONVICTION SCALP" },
        { class: "bronze", text: "#3 VOLUME SURGE" }
    ];

    DOM.top3Container.innerHTML = top3.map((stock, idx) => {
        const rank = rankTitles[idx] || { class: "bronze", text: `#${idx + 1}` };
        const changeSign = stock.change_pct >= 0 ? "+" : "";
        const p = stock.scalp_parameters || {};

        return `
        <div class="top3-card rank-${idx + 1}" data-symbol="${stock.symbol}" data-exchange="${stock.exchange}" data-name="${stock.name}">
            <div class="card-top-row">
                <div class="ticker-identity">
                    <div class="symbol-with-badge">
                        <span class="card-symbol">${stock.symbol}</span>
                        <span class="exchange-tag">${stock.exchange}</span>
                    </div>
                    <span class="card-name">${stock.name}</span>
                </div>
                <span class="rank-badge ${rank.class}">${rank.text}</span>
            </div>

            <div class="card-price-row">
                <span class="card-price">$${stock.price.toFixed(2)}</span>
                <span class="card-change-badge up">${changeSign}${stock.change_pct.toFixed(2)}%</span>
            </div>

            <!-- Momentum & Success Probability Gauge -->
            <div class="conviction-meter-container">
                <div class="conviction-labels">
                    <span class="text-secondary">SCALP SUCCESS PROBABILITY</span>
                    <span class="text-emerald font-mono">${stock.success_probability}%</span>
                </div>
                <div class="conviction-bar">
                    <div class="conviction-fill" style="width: ${stock.success_probability}%;"></div>
                </div>
            </div>

            <!-- Volume Movement & Price Impact Stats -->
            <div class="card-stats-grid">
                <div class="stat-item">
                    <span class="stat-title">RELATIVE VOL (RVOL)</span>
                    <span class="stat-val text-cyan">${stock.rvol}x</span>
                </div>
                <div class="stat-item">
                    <span class="stat-title">DAY VOLUME</span>
                    <span class="stat-val">${(stock.volume / 1000000).toFixed(1)}M</span>
                </div>
                <div class="stat-item">
                    <span class="stat-title">FROM OPEN</span>
                    <span class="stat-val ${stock.change_from_open >= 0 ? 'text-emerald' : 'text-crimson'}">
                        ${stock.change_from_open >= 0 ? '+' : ''}${stock.change_from_open.toFixed(1)}%
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-title">VWAP LEVEL</span>
                    <span class="stat-val text-amber">$${stock.vwap.toFixed(2)}</span>
                </div>
            </div>

            <!-- Micro-Scalp Execution Parameters (Seconds to Minutes) -->
            <div class="bracket-box">
                <div class="bracket-title">
                    <span>⚡ SCALP TARGET BRACKET</span>
                    <span>${p.time_horizon || '45s - 3m'}</span>
                </div>
                <div class="bracket-row">
                    <span class="bracket-label">Micro-Target 1 (1-2m):</span>
                    <span class="text-emerald font-bold">$${p.target_1 || (stock.price * 1.018).toFixed(2)} (+${p.target_1_gain_pct || 1.8}%)</span>
                </div>
                <div class="bracket-row">
                    <span class="bracket-label">Scalp Runner Target 2:</span>
                    <span class="text-cyan font-bold">$${p.target_2 || (stock.price * 1.032).toFixed(2)} (+${p.target_2_gain_pct || 3.2}%)</span>
                </div>
                <div class="bracket-row">
                    <span class="bracket-label">Hard Stop-Loss:</span>
                    <span class="text-crimson font-bold">$${p.stop_loss || (stock.price * 0.992).toFixed(2)}</span>
                </div>
                <div class="bracket-row">
                    <span class="bracket-label">Risk / Reward:</span>
                    <span class="text-secondary">${p.risk_reward || '1 : 2.5'}</span>
                </div>
            </div>

            <div class="card-reason-snippet">
                <strong>Trigger:</strong> ${stock.catalyst_reason}
            </div>

            <!-- Card Action Buttons -->
            <div class="card-actions-grid">
                <button class="btn-card-sync btn-sync-card" data-symbol="${stock.symbol}" title="Sync this stock to TradingView Desktop App">
                    ⚡ SYNC DESKTOP
                </button>
                <button class="btn-card-scalp btn-trigger-scalp" data-symbol="${stock.symbol}" data-price="${stock.price}" data-target="${p.target_1}" data-stop="${p.stop_loss}">
                    🚀 EXECUTE SCALP
                </button>
            </div>
        </div>
        `;
    }).join("");

    // Attach card click handlers
    document.querySelectorAll(".top3-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest("button")) return; // Don't trigger if button was clicked
            const sym = card.dataset.symbol;
            const ex = card.dataset.exchange;
            const name = card.dataset.name;
            switchActiveChart(sym, ex, name);
        });
    });

    // Attach sync button handlers
    document.querySelectorAll(".btn-sync-card").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const sym = btn.dataset.symbol;
            syncToTradingViewDesktop(sym);
        });
    });

    // Attach scalp button handlers
    document.querySelectorAll(".btn-trigger-scalp").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const sym = btn.dataset.symbol;
            const price = parseFloat(btn.dataset.price);
            const target = parseFloat(btn.dataset.target);
            const stop = parseFloat(btn.dataset.stop);
            openOrderModal({
                symbol: sym,
                price: price,
                target_1: target,
                stop_loss: stop,
                action: "BUY"
            });
        });
    });
}

// Render All NASDAQ & NYSE Movers Table
function renderMoversTable() {
    if (!DOM.moversTableBody) return;

    let filtered = [...state.allMovers];

    // Apply Filter Chips
    if (state.currentFilter === "NASDAQ") {
        filtered = filtered.filter(x => x.exchange === "NASDAQ");
    } else if (state.currentFilter === "NYSE") {
        filtered = filtered.filter(x => x.exchange === "NYSE");
    } else if (state.currentFilter === "high-rvol") {
        filtered = filtered.filter(x => x.rvol >= 5.0);
    } else if (state.currentFilter === "penny") {
        filtered = filtered.filter(x => x.price < 10.0);
    } else if (state.currentFilter === "large") {
        filtered = filtered.filter(x => x.price >= 50.0);
    }

    // Apply Search
    if (state.searchQuery.trim() !== "") {
        const q = state.searchQuery.toLowerCase();
        filtered = filtered.filter(x => 
            x.symbol.toLowerCase().includes(q) || 
            (x.name && x.name.toLowerCase().includes(q))
        );
    }

    if (filtered.length === 0) {
        DOM.moversTableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: var(--text-muted);">No stocks matched your search criteria.</td></tr>`;
        return;
    }

    DOM.moversTableBody.innerHTML = filtered.map((stock, i) => {
        const changeClass = stock.change_pct >= 0 ? "table-badge-up" : "table-badge-down";
        const fromOpenClass = stock.change_from_open >= 0 ? "table-badge-up" : "table-badge-down";
        const sign = stock.change_pct >= 0 ? "+" : "";
        const fromOpenSign = stock.change_from_open >= 0 ? "+" : "";

        return `
        <tr data-symbol="${stock.symbol}" data-exchange="${stock.exchange}" data-name="${stock.name}">
            <td style="color: var(--text-muted);">${i + 1}</td>
            <td><span class="table-symbol">${stock.symbol}</span></td>
            <td><span class="exchange-tag">${stock.exchange}</span></td>
            <td class="font-bold">$${stock.price.toFixed(2)}</td>
            <td class="${changeClass} font-bold">${sign}${stock.change_pct.toFixed(2)}%</td>
            <td class="${fromOpenClass}">${fromOpenSign}${stock.change_from_open.toFixed(1)}%</td>
            <td class="text-cyan font-bold">${stock.rvol}x</td>
            <td>${(stock.volume / 1000000).toFixed(2)}M</td>
            <td><span class="text-emerald font-bold">${stock.momentum_score}</span></td>
            <td>
                <button class="table-action-btn btn-table-sync" data-symbol="${stock.symbol}" title="Sync Desktop">⚡ SYNC</button>
            </td>
        </tr>
        `;
    }).join("");

    // Attach row click to change chart
    DOM.moversTableBody.querySelectorAll("tr").forEach(row => {
        row.addEventListener("click", (e) => {
            if (e.target.closest("button")) return;
            const sym = row.dataset.symbol;
            const ex = row.dataset.exchange;
            const name = row.dataset.name;
            switchActiveChart(sym, ex, name);
        });
    });

    // Attach table sync buttons
    DOM.moversTableBody.querySelectorAll(".btn-table-sync").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            syncToTradingViewDesktop(btn.dataset.symbol);
        });
    });
}

// Switch Active Chart in Embedded View
function switchActiveChart(symbol, exchange, companyName) {
    const formatted = `${exchange || 'NASDAQ'}:${symbol}`;
    state.activeSymbol = formatted;

    if (DOM.chartActiveSymbol) DOM.chartActiveSymbol.textContent = formatted;
    if (DOM.chartActiveName) DOM.chartActiveName.textContent = companyName || symbol;

    initTradingViewWidget(formatted, state.activeTimeframe);
    appendLogEntry("SYSTEM", `Loaded live chart for ${formatted}`);
}

// Sync to Local TradingView Desktop Application via CDP port 9222
async function syncToTradingViewDesktop(symbol) {
    appendLogEntry("SYSTEM", `Sending CDP command to TradingView Desktop for ${symbol}...`);

    try {
        const resp = await fetch("/api/sync-desktop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ symbol: symbol, timeframe: state.activeTimeframe })
        });
        const res = await resp.json();

        if (res.success) {
            appendLogEntry("FILL", `TradingView Desktop synced to ${symbol} (${state.activeTimeframe}m)`);
        } else {
            appendLogEntry("ALERT", `Desktop Sync notice: ${res.error || res.hint || 'Command sent'}`);
        }
    } catch (e) {
        appendLogEntry("ALERT", `Failed to reach Desktop bridge: ${e.message}`);
    }
}

// Order Modal Logic
function openOrderModal(details) {
    state.selectedScalpCandidate = details;
    if (!DOM.modalBackdrop || !DOM.modalBody) return;

    DOM.modalBody.innerHTML = `
        <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="font-size: 1.2rem; font-weight: 800; color: #fff;">${details.symbol}</span>
                <span class="badge-accent">MOMENTUM SCALP</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-family: var(--font-mono); font-size: 0.85rem;">
                <div><span class="text-secondary">Action:</span> <strong class="text-emerald">${details.action}</strong></div>
                <div><span class="text-secondary">Est. Fill:</span> <strong>$${details.price}</strong></div>
                <div><span class="text-secondary">Stop Loss:</span> <strong class="text-crimson">$${details.stop_loss}</strong></div>
                <div><span class="text-secondary">Target 1:</span> <strong class="text-emerald">$${details.target_1}</strong></div>
            </div>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">
            This order uses a tight bracket stop below VWAP to capture the immediate micro-momentum upward move over the next 45 seconds to 3 minutes.
        </div>
    `;

    DOM.modalBackdrop.classList.add("active");
}

function closeOrderModal() {
    if (DOM.modalBackdrop) DOM.modalBackdrop.classList.remove("active");
    state.selectedScalpCandidate = null;
}

// Execute Scalp Order
async function confirmAndSendOrder() {
    if (!state.selectedScalpCandidate) return;
    const c = state.selectedScalpCandidate;

    try {
        const resp = await fetch("/api/execute-trade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                symbol: c.symbol,
                action: c.action.toLowerCase(),
                qty: 10,
                price: c.price,
                stop_loss: c.stop_loss,
                take_profit: c.target_1,
                strategy: "Alpha-3 Scalp"
            })
        });
        const res = await resp.json();

        if (res.success) {
            AudioChime.playChime();
            appendLogEntry("FILL", `Order Executed: ${res.order.action} ${res.order.qty} ${res.order.symbol} @ $${res.order.price} (SL: $${res.order.stop_loss}, TP: $${res.order.take_profit})`);
            closeOrderModal();
        }
    } catch (e) {
        appendLogEntry("ALERT", `Order submission error: ${e.message}`);
    }
}

// Append Log Entry to Drawer
function appendLogEntry(tag, msg) {
    if (!DOM.logsFeed) return;

    const now = new Date().toLocaleTimeString();
    const tagClass = tag === "FILL" ? "tag-fill" : (tag === "ALERT" ? "tag-alert" : "tag-system");

    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
        <span class="log-time">${now}</span>
        <span class="log-tag ${tagClass}">${tag}</span>
        <span class="log-msg">${msg}</span>
    `;

    DOM.logsFeed.insertBefore(entry, DOM.logsFeed.firstChild);

    if (DOM.logCountText) {
        DOM.logCountText.textContent = `${DOM.logsFeed.children.length} Events Recorded`;
    }
}

// System Status Check
async function checkSystemStatus() {
    try {
        const resp = await fetch("/api/status");
        const data = await resp.json();

        if (DOM.tvStatusBadge) {
            if (data.tradingview_desktop && data.tradingview_desktop.cdp_connected) {
                DOM.tvStatusBadge.innerHTML = `<span class="status-indicator"></span> CDP PORT 9222 (ACTIVE)`;
                DOM.tvStatusBadge.className = "pill-value text-emerald";
            } else {
                DOM.tvStatusBadge.innerHTML = `<span class="status-indicator" style="background: var(--accent-amber);"></span> CDP PORT 9222 (OFFLINE)`;
                DOM.tvStatusBadge.className = "pill-value text-amber";
            }
        }
    } catch (e) {
        // Status polling error
    }
}

// Auto-Scan Management
function startAutoScan() {
    if (state.scanTimer) clearInterval(state.scanTimer);
    state.scanTimer = setInterval(() => {
        if (state.autoScan) {
            fetchMarketScan();
        }
    }, state.scanIntervalMs);
}

// Event Listeners
function attachEventListeners() {
    // Manual Scan
    if (DOM.btnManualScan) {
        DOM.btnManualScan.addEventListener("click", () => fetchMarketScan());
    }

    // Auto-Scan Toggle
    if (DOM.autoScanToggle) {
        DOM.autoScanToggle.addEventListener("change", (e) => {
            state.autoScan = e.target.checked;
            appendLogEntry("SYSTEM", `Auto-Scan turned ${state.autoScan ? 'ON (4s interval)' : 'OFF'}`);
        });
    }

    // Sound Toggle
    if (DOM.btnSoundToggle) {
        DOM.btnSoundToggle.addEventListener("click", () => {
            state.soundEnabled = !state.soundEnabled;
            DOM.soundIcon.textContent = state.soundEnabled ? "🔔" : "🔕";
            appendLogEntry("SYSTEM", `Sound Alerts ${state.soundEnabled ? 'Enabled' : 'Muted'}`);
        });
    }

    // Sync Desktop Button in Chart panel
    if (DOM.btnSyncChartDesktop) {
        DOM.btnSyncChartDesktop.addEventListener("click", () => {
            const sym = state.activeSymbol.split(":").pop();
            syncToTradingViewDesktop(sym);
        });
    }

    // Search Input
    if (DOM.searchInput) {
        DOM.searchInput.addEventListener("input", (e) => {
            state.searchQuery = e.target.value;
            renderMoversTable();
        });
    }

    // Filter Chips
    DOM.filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            DOM.filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            state.currentFilter = chip.dataset.filter;
            renderMoversTable();
        });
    });

    // Timeframe Buttons
    DOM.timeframeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            DOM.timeframeButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeTimeframe = btn.dataset.tf;
            initTradingViewWidget(state.activeSymbol, state.activeTimeframe);
        });
    });

    // Modal Events
    if (DOM.btnCloseModal) DOM.btnCloseModal.addEventListener("click", closeOrderModal);
    if (DOM.btnCancelOrder) DOM.btnCancelOrder.addEventListener("click", closeOrderModal);
    if (DOM.btnConfirmOrder) DOM.btnConfirmOrder.addEventListener("click", confirmAndSendOrder);
}
