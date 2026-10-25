/**
 * Stock Buyer - Main Application Controller
 * Technology: Pure Vanilla JavaScript (Zero external libraries)
 * Orchestrates: Navigation, Market simulation updates, Order Book,
 * Platform Explorer, Matcher Quiz, Stock Screener, Portfolio views,
 * Live Market API feeds, and SQL Auth user session.
 */

// Global toast helper for modular components
window.showAppToast = function(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Core Engines
  const tradingEngine = new TradingEngine();
  const chart = new TradingChart("tradingChartCanvas");

  // Initialize Auth & Live Market API
  const authManager = new AuthManager();
  const liveMarketApi = new LiveMarketAPI(tradingEngine);

  // Initialize Indian 4,000 Companies & Live Moving Chart Engine
  let indianChart = null;
  let indianMarketController = null;
  if (document.getElementById("indianChartCanvas")) {
    indianChart = new TradingChart("indianChartCanvas");
    indianChart.currency = "₹";
    indianMarketController = new IndianMarketController(tradingEngine, indianChart);
  }

  // Initialize IPO Central Manager
  const ipoManager = new IpoManager(tradingEngine);

  // State
  let currentSymbol = "NVDA";
  let currentTimeframe = "1D";
  let currentOrderTab = "BUY"; // 'BUY' | 'SELL'
  let currentOrderType = "MARKET"; // 'MARKET' | 'LIMIT'
  let currentView = "terminal";
  let quizStep = 0;
  let quizAnswers = [];
  let comparisonList = [];

  // DOM Elements
  const elAccountBalance = document.getElementById("headerAccountBalance");
  const elActiveSymbol = document.getElementById("activeAssetSymbol");
  const elActiveName = document.getElementById("activeAssetName");
  const elActivePrice = document.getElementById("activeAssetPrice");
  const elActiveChange = document.getElementById("activeAssetChange");
  const elOrderTypeSelect = document.getElementById("orderTypeSelect");
  const elLimitPriceGroup = document.getElementById("limitPriceGroup");
  const elLimitPriceInput = document.getElementById("limitPriceInput");
  const elOrderSharesInput = document.getElementById("orderSharesInput");
  const elOrderEstPrice = document.getElementById("orderEstPrice");
  const elOrderEstTotal = document.getElementById("orderEstTotal");
  const elAvailableCash = document.getElementById("availableCashDisplay");
  const elSubmitOrderBtn = document.getElementById("submitOrderBtn");
  const elWatchlistContainer = document.getElementById("watchlistItemsContainer");
  const elPositionsTableBody = document.getElementById("positionsTableBody");
  const elOrdersTableBody = document.getElementById("ordersTableBody");
  const elNewsContainer = document.getElementById("newsListContainer");
  const elBidsContainer = document.getElementById("orderBookBids");
  const elAsksContainer = document.getElementById("orderBookAsks");
  const elPlatformsGrid = document.getElementById("platformsGridContainer");
  const elScreenerTableBody = document.getElementById("screenerTableBody");

  // --- 1. INITIALIZE VIEW & CHART ---
  function init() {
    renderTickerTape();
    renderWatchlist();
    selectAsset(currentSymbol);
    renderPositionsTable();
    renderOrdersTable();
    renderNewsFeed();
    renderPlatforms(TRADING_PLATFORMS);
    renderScreenerTable();
    updatePortfolioView();
    updateWalletHeader();
    bindEvents();

    // Hook market engine events (works with both live API & ticks)
    tradingEngine.onPriceTick = (symbol, assetData) => {
      handlePriceTick(symbol, assetData);
    };

    tradingEngine.onOrderFilled = (order) => {
      window.showAppToast(`Limit order filled! ${order.type} ${order.shares} ${order.symbol} @ $${order.price.toFixed(2)}`, "success");
      updateWalletHeader();
      renderPositionsTable();
      renderOrdersTable();
      updatePortfolioView();
    };
  }

  // --- 2. TICKER TAPE BANNER ---
  function renderTickerTape() {
    const tapeTrack = document.getElementById("tickerTapeTrack");
    if (!tapeTrack) return;

    const items = [...MARKET_ASSETS, ...MARKET_ASSETS];
    tapeTrack.innerHTML = items.map(a => {
      const cur = tradingEngine.prices[a.symbol] || a;
      const isUp = cur.change >= 0;
      const sign = isUp ? "+" : "";
      return `
        <div class="tape-item" data-symbol="${a.symbol}">
          <span class="tape-symbol">${a.symbol}</span>
          <span class="tape-price" id="tape-price-${a.symbol}">$${cur.price.toFixed(2)}</span>
          <span class="tape-change ${isUp ? 'up' : 'down'}" id="tape-chg-${a.symbol}">${sign}${cur.changePercent.toFixed(2)}%</span>
        </div>
      `;
    }).join("");

    tapeTrack.querySelectorAll(".tape-item").forEach(item => {
      item.addEventListener("click", () => {
        switchView("terminal");
        selectAsset(item.dataset.symbol);
      });
    });
  }

  // --- 3. WATCHLIST COMPONENT ---
  function renderWatchlist(filterCategory = "all", searchQuery = "") {
    if (!elWatchlistContainer) return;

    let filtered = MARKET_ASSETS.filter(a => {
      const matchesSearch = a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            a.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filterCategory === "all") return true;
      if (filterCategory === "crypto") return a.type === "crypto";
      if (filterCategory === "stock") return a.type === "stock";
      if (filterCategory === "etf") return a.type === "etf";
      if (filterCategory === "watchlist") return tradingEngine.watchlist.includes(a.symbol);
      return true;
    });

    elWatchlistContainer.innerHTML = filtered.map(a => {
      const cur = tradingEngine.prices[a.symbol] || a;
      const isUp = cur.change >= 0;
      const sign = isUp ? "+" : "";
      const isActive = a.symbol === currentSymbol;

      return `
        <div class="watchlist-row ${isActive ? 'active' : ''}" data-symbol="${a.symbol}">
          <div class="asset-meta">
            <span class="asset-symbol">${a.symbol}</span>
            <span class="asset-name" title="${a.name}">${a.name}</span>
          </div>
          <div class="asset-metrics">
            <div class="asset-price" id="wl-price-${a.symbol}">$${cur.price.toFixed(2)}</div>
            <div class="asset-change ${isUp ? 'up' : 'down'}" id="wl-chg-${a.symbol}">
              ${sign}${cur.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
      `;
    }).join("");

    elWatchlistContainer.querySelectorAll(".watchlist-row").forEach(row => {
      row.addEventListener("click", () => {
        selectAsset(row.dataset.symbol);
      });
    });
  }

  // --- 4. ASSET SELECTION & CHART UPDATE ---
  function selectAsset(symbol) {
    currentSymbol = symbol;
    const asset = MARKET_ASSETS.find(a => a.symbol === symbol) || MARKET_ASSETS[0];
    const livePriceData = tradingEngine.prices[symbol] || asset;

    elActiveSymbol.textContent = asset.symbol;
    elActiveName.textContent = asset.name;
    elActivePrice.textContent = `$${livePriceData.price.toFixed(2)}`;

    const isUp = livePriceData.change >= 0;
    const sign = isUp ? "+" : "";
    elActiveChange.textContent = `${sign}${livePriceData.change.toFixed(2)} (${sign}${livePriceData.changePercent.toFixed(2)}%)`;
    elActiveChange.className = `asset-current-change ${isUp ? 'up' : 'down'}`;

    document.querySelectorAll(".watchlist-row").forEach(r => {
      r.classList.toggle("active", r.dataset.symbol === symbol);
    });

    const candles = generateHistoricalCandles(symbol, livePriceData.price, currentTimeframe, 55);
    chart.setData(candles, symbol, currentTimeframe);

    updateOrderFormPricing();
    renderOrderBook(symbol);
  }

  function handlePriceTick(symbol, assetData) {
    // 1. Update Watchlist elements
    const wlPrice = document.getElementById(`wl-price-${symbol}`);
    const wlChg = document.getElementById(`wl-chg-${symbol}`);
    const isUp = assetData.change >= 0;
    const sign = isUp ? "+" : "";

    if (wlPrice) wlPrice.textContent = `$${assetData.price.toFixed(2)}`;
    if (wlChg) {
      wlChg.textContent = `${sign}${assetData.changePercent.toFixed(2)}%`;
      wlChg.className = `asset-change ${isUp ? 'up' : 'down'}`;
    }

    // 2. Update ticker tape elements
    document.querySelectorAll(`#tape-price-${symbol}`).forEach(el => el.textContent = `$${assetData.price.toFixed(2)}`);
    document.querySelectorAll(`#tape-chg-${symbol}`).forEach(el => {
      el.textContent = `${sign}${assetData.changePercent.toFixed(2)}%`;
      el.className = `tape-change ${isUp ? 'up' : 'down'}`;
    });

    // 3. If active asset, update chart & top banner
    if (symbol === currentSymbol) {
      elActivePrice.textContent = `$${assetData.price.toFixed(2)}`;
      elActiveChange.textContent = `${sign}${assetData.change.toFixed(2)} (${sign}${assetData.changePercent.toFixed(2)}%)`;
      elActiveChange.className = `asset-current-change ${isUp ? 'up' : 'down'}`;
      chart.updateLatestPrice(assetData.price);
      updateOrderFormPricing();
      renderOrderBook(symbol);
    }

    // 4. Update Positions P&L
    renderPositionsTable();
    updatePortfolioView();
  }

  // --- 5. ORDER BOOK COMPONENT ---
  function renderOrderBook(symbol) {
    if (!elBidsContainer || !elAsksContainer) return;
    const { bids, asks } = tradingEngine.getOrderBook(symbol);

    const maxBidTotal = bids.length ? Math.max(...bids.map(b => parseFloat(b.total))) : 1;
    const maxAskTotal = asks.length ? Math.max(...asks.map(a => parseFloat(a.total))) : 1;

    elBidsContainer.innerHTML = bids.map(b => {
      const pct = (parseFloat(b.total) / maxBidTotal) * 100;
      return `
        <div class="ob-row">
          <div class="ob-depth-bar" style="width: ${pct}%"></div>
          <span style="color: var(--bull-green)">$${b.price.toFixed(2)}</span>
          <span>${b.size}</span>
          <span style="color: var(--text-muted)">${b.total}</span>
        </div>
      `;
    }).join("");

    elAsksContainer.innerHTML = asks.map(a => {
      const pct = (parseFloat(a.total) / maxAskTotal) * 100;
      return `
        <div class="ob-row">
          <div class="ob-depth-bar" style="width: ${pct}%"></div>
          <span style="color: var(--bear-red)">$${a.price.toFixed(2)}</span>
          <span>${a.size}</span>
          <span style="color: var(--text-muted)">${a.total}</span>
        </div>
      `;
    }).join("");
  }

  // --- 6. ORDER FORM CONTROLS ---
  function updateOrderFormPricing() {
    const curPrice = tradingEngine.prices[currentSymbol]?.price || 0;
    const shares = parseFloat(elOrderSharesInput.value) || 0;
    const execPrice = currentOrderType === "MARKET" ? curPrice : (parseFloat(elLimitPriceInput.value) || curPrice);
    const total = shares * execPrice;

    elOrderEstPrice.textContent = `$${execPrice.toFixed(2)}`;
    elOrderEstTotal.textContent = `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    elAvailableCash.textContent = `$${tradingEngine.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    if (currentOrderTab === "BUY") {
      elSubmitOrderBtn.className = "btn-submit-order buy";
      elSubmitOrderBtn.textContent = `Buy ${currentSymbol}`;
    } else {
      elSubmitOrderBtn.className = "btn-submit-order sell";
      elSubmitOrderBtn.textContent = `Sell ${currentSymbol}`;
    }
  }

  function executeOrder() {
    const shares = parseFloat(elOrderSharesInput.value);
    if (!shares || shares <= 0) {
      window.showAppToast("Please enter a valid number of shares.", "error");
      return;
    }

    const limitPrice = parseFloat(elLimitPriceInput.value) || 0;
    let res;

    if (currentOrderTab === "BUY") {
      res = tradingEngine.buyOrder(currentSymbol, shares, currentOrderType, limitPrice);
    } else {
      res = tradingEngine.sellOrder(currentSymbol, shares, currentOrderType, limitPrice);
    }

    if (res.success) {
      window.showAppToast(res.message, "success");
      updateWalletHeader();
      renderPositionsTable();
      renderOrdersTable();
      updatePortfolioView();
      elOrderSharesInput.value = "";
      updateOrderFormPricing();
    } else {
      window.showAppToast(res.message, "error");
    }
  }

  // --- 7. LOWER PANEL TABLES (Positions, Orders, News) ---
  function renderPositionsTable() {
    if (!elPositionsTableBody) return;
    const positions = Object.values(tradingEngine.positions);

    if (positions.length === 0) {
      elPositionsTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
            No open positions. Use the trade panel on the right to start buying!
          </td>
        </tr>
      `;
      return;
    }

    elPositionsTableBody.innerHTML = positions.map(pos => {
      const curPrice = tradingEngine.prices[pos.symbol]?.price || pos.avgPrice;
      const marketVal = pos.shares * curPrice;
      const costBasis = pos.shares * pos.avgPrice;
      const pnl = marketVal - costBasis;
      const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
      const isUp = pnl >= 0;
      const sign = isUp ? "+" : "";

      return `
        <tr>
          <td><strong style="color: var(--text-white); cursor: pointer;" class="clickable-symbol" data-symbol="${pos.symbol}">${pos.symbol}</strong></td>
          <td>${pos.shares}</td>
          <td>$${pos.avgPrice.toFixed(2)}</td>
          <td>$${curPrice.toFixed(2)}</td>
          <td>$${marketVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          <td style="color: ${isUp ? 'var(--bull-green)' : 'var(--bear-red)'}; font-weight: 700;">
            ${sign}$${pnl.toFixed(2)} (${sign}${pnlPct.toFixed(2)}%)
          </td>
          <td>
            <button class="btn-danger-sm close-pos-btn" data-symbol="${pos.symbol}">Close</button>
          </td>
        </tr>
      `;
    }).join("");

    elPositionsTableBody.querySelectorAll(".clickable-symbol").forEach(el => {
      el.addEventListener("click", () => selectAsset(el.dataset.symbol));
    });

    elPositionsTableBody.querySelectorAll(".close-pos-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const res = tradingEngine.closePosition(btn.dataset.symbol);
        if (res.success) {
          window.showAppToast(res.message, "success");
          updateWalletHeader();
          renderPositionsTable();
          renderOrdersTable();
          updatePortfolioView();
        }
      });
    });
  }

  function renderOrdersTable() {
    if (!elOrdersTableBody) return;
    const orders = tradingEngine.orders;

    if (orders.length === 0) {
      elOrdersTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
            No trade history yet.
          </td>
        </tr>
      `;
      return;
    }

    elOrdersTableBody.innerHTML = orders.map(ord => {
      const isBuy = ord.type === "BUY";
      const dateStr = new Date(ord.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `
        <tr>
          <td style="color: var(--text-muted)">${ord.id}</td>
          <td>${dateStr}</td>
          <td><strong>${ord.symbol}</strong></td>
          <td style="color: ${isBuy ? 'var(--bull-green)' : 'var(--bear-red)'}; font-weight: 700;">${ord.type}</td>
          <td>${ord.shares}</td>
          <td>$${ord.price.toFixed(2)}</td>
          <td>$${ord.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>
      `;
    }).join("");
  }

  function renderNewsFeed() {
    if (!elNewsContainer) return;
    elNewsContainer.innerHTML = MARKET_NEWS.map(news => {
      return `
        <div style="padding: 12px; border-bottom: 1px solid rgba(22, 44, 75, 0.4); display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
            <span style="color: var(--accent-light); font-weight: 700;">${news.source} • ${news.timeAgo}</span>
            <span class="badge" style="background: ${news.sentiment === 'Bullish' ? 'var(--bull-green-bg)' : 'rgba(100,116,139,0.2)'}; color: ${news.sentiment === 'Bullish' ? 'var(--bull-green)' : 'var(--text-secondary)'};">
              ${news.sentiment}
            </span>
          </div>
          <h4 style="font-size: 13px; color: var(--text-white); font-weight: 600; cursor: pointer;">${news.title}</h4>
          <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${news.summary}</p>
        </div>
      `;
    }).join("");
  }

  // --- 8. PLATFORM DIRECTORY & COMPARISON ---
  function renderPlatforms(platformsList) {
    if (!elPlatformsGrid) return;
    elPlatformsGrid.innerHTML = platformsList.map(p => {
      const isComparing = comparisonList.includes(p.id);
      return `
        <div class="platform-card">
          <div>
            <div class="platform-header">
              <div class="platform-logo">${p.logo}</div>
              <div class="platform-info">
                <h3>${p.name}</h3>
                <span class="platform-category">${p.category}</span>
                <div class="platform-rating">
                  ★ ${p.rating} <span style="color: var(--text-muted); font-size: 11px;">(${p.reviewCount} reviews)</span>
                </div>
              </div>
            </div>

            <div class="platform-badges">
              ${p.badges.map(b => `<span class="badge">${b}</span>`).join("")}
            </div>

            <p class="platform-desc">${p.tagline}</p>

            <div class="platform-stats-grid">
              <div class="p-stat-item">
                <span class="p-stat-label">Trading Fees</span>
                <span class="p-stat-val" style="color: var(--bull-green)">${p.tradingFees}</span>
              </div>
              <div class="p-stat-item">
                <span class="p-stat-label">Min Deposit</span>
                <span class="p-stat-val">${p.minDeposit}</span>
              </div>
              <div class="p-stat-item">
                <span class="p-stat-label">Margin Rate</span>
                <span class="p-stat-val">${p.marginRate}</span>
              </div>
              <div class="p-stat-item">
                <span class="p-stat-label">Best For</span>
                <span class="p-stat-val" style="color: var(--accent-light)">${p.bestFor}</span>
              </div>
            </div>
          </div>

          <div class="platform-card-actions">
            <button class="btn-secondary view-platform-details" data-id="${p.id}">View Details</button>
            <button class="btn-secondary toggle-compare-btn ${isComparing ? 'active' : ''}" data-id="${p.id}">
              ${isComparing ? '✓ Comparing' : '+ Compare'}
            </button>
            <a href="${p.websiteUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="text-decoration: none; padding: 8px 12px; font-size: 11px;">
              Visit ↗
            </a>
          </div>
        </div>
      `;
    }).join("");

    elPlatformsGrid.querySelectorAll(".view-platform-details").forEach(btn => {
      btn.addEventListener("click", () => openPlatformModal(btn.dataset.id));
    });

    elPlatformsGrid.querySelectorAll(".toggle-compare-btn").forEach(btn => {
      btn.addEventListener("click", () => toggleCompare(btn.dataset.id));
    });
  }

  function openPlatformModal(platformId) {
    const p = TRADING_PLATFORMS.find(item => item.id === platformId);
    if (!p) return;

    const modalTitle = document.getElementById("platformModalTitle");
    const modalBody = document.getElementById("platformModalBody");
    const modalOverlay = document.getElementById("platformModalOverlay");

    modalTitle.innerHTML = `<span style="font-size: 20px;">${p.logo}</span> ${p.name}`;
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <p style="font-size: 14px; color: var(--text-primary);">${p.tagline}</p>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: var(--bg-deep); padding: 12px; border-radius: 8px; border: 1px solid var(--border-subtle);">
          <div><span style="font-size: 11px; color: var(--text-muted)">Established:</span> <strong style="color: var(--text-white)">${p.established}</strong></div>
          <div><span style="font-size: 11px; color: var(--text-muted)">Headquarters:</span> <strong style="color: var(--text-white)">${p.headquarters}</strong></div>
          <div><span style="font-size: 11px; color: var(--text-muted)">Regulated By:</span> <strong style="color: var(--text-white)">${p.regulatedBy}</strong></div>
          <div><span style="font-size: 11px; color: var(--text-muted)">Supported Assets:</span> <strong style="color: var(--accent-light)">${p.assetClasses.join(", ")}</strong></div>
        </div>

        <div>
          <h4 style="font-size: 13px; color: var(--bull-green); margin-bottom: 6px;">✓ Key Advantages (Pros)</h4>
          <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 20px; line-height: 1.6;">
            ${p.pros.map(pro => `<li>${pro}</li>`).join("")}
          </ul>
        </div>

        <div>
          <h4 style="font-size: 13px; color: var(--bear-red); margin-bottom: 6px;">✕ Considerations (Cons)</h4>
          <ul style="font-size: 12px; color: var(--text-secondary); padding-left: 20px; line-height: 1.6;">
            ${p.cons.map(con => `<li>${con}</li>`).join("")}
          </ul>
        </div>

        <div style="margin-top: 10px; display: flex; justify-content: flex-end; gap: 10px;">
          <a href="${p.websiteUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="text-decoration: none;">
            Open Official Site ↗
          </a>
        </div>
      </div>
    `;

    modalOverlay.classList.add("active");
  }

  function toggleCompare(platformId) {
    const idx = comparisonList.indexOf(platformId);
    if (idx >= 0) {
      comparisonList.splice(idx, 1);
    } else {
      if (comparisonList.length >= 3) {
        window.showAppToast("You can compare up to 3 platforms at once.", "error");
        return;
      }
      comparisonList.push(platformId);
    }

    renderPlatforms(TRADING_PLATFORMS);
    updateComparisonDrawer();
  }

  function updateComparisonDrawer() {
    const drawer = document.getElementById("comparisonDrawer");
    if (!drawer) return;

    if (comparisonList.length >= 2) {
      drawer.style.display = "block";
      const drawerContent = document.getElementById("comparisonTableContent");
      const selected = TRADING_PLATFORMS.filter(p => comparisonList.includes(p.id));

      drawerContent.innerHTML = `
        <table class="data-table" style="margin-top: 12px;">
          <thead>
            <tr>
              <th>Feature</th>
              ${selected.map(s => `<th>${s.logo} ${s.name}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="color: var(--text-muted)">Rating</td>
              ${selected.map(s => `<td style="color: #fbbf24; font-weight: 700;">★ ${s.rating}</td>`).join("")}
            </tr>
            <tr>
              <td style="color: var(--text-muted)">Trading Fees</td>
              ${selected.map(s => `<td style="color: var(--bull-green);">${s.tradingFees}</td>`).join("")}
            </tr>
            <tr>
              <td style="color: var(--text-muted)">Min Deposit</td>
              ${selected.map(s => `<td>${s.minDeposit}</td>`).join("")}
            </tr>
            <tr>
              <td style="color: var(--text-muted)">Margin Rate</td>
              ${selected.map(s => `<td>${s.marginRate}</td>`).join("")}
            </tr>
            <tr>
              <td style="color: var(--text-muted)">Best For</td>
              ${selected.map(s => `<td style="color: var(--accent-light);">${s.bestFor}</td>`).join("")}
            </tr>
          </tbody>
        </table>
      `;
    } else {
      drawer.style.display = "none";
    }
  }

  // --- 9. PLATFORM MATCHER QUIZ ---
  function renderQuizStep() {
    const q = MATCHER_QUIZ[quizStep];
    const fill = document.getElementById("quizProgressFill");
    const title = document.getElementById("quizQuestionTitle");
    const sub = document.getElementById("quizQuestionSub");
    const optionsContainer = document.getElementById("quizOptionsContainer");
    const resultBox = document.getElementById("quizResultBox");

    if (!q) {
      optionsContainer.style.display = "none";
      title.textContent = "Your Ideal Trading Platform Match";
      sub.textContent = "Based on your trading focus, experience, fees, and preferred device:";
      fill.style.width = "100%";

      const platformCounts = {};
      quizAnswers.forEach(ans => {
        platformCounts[ans.platformId] = (platformCounts[ans.platformId] || 0) + 1;
      });

      let bestPlatformId = "ibkr";
      let highestCount = 0;
      Object.entries(platformCounts).forEach(([pid, count]) => {
        if (count > highestCount) {
          highestCount = count;
          bestPlatformId = pid;
        }
      });

      const match = TRADING_PLATFORMS.find(p => p.id === bestPlatformId) || TRADING_PLATFORMS[0];
      resultBox.style.display = "block";
      resultBox.innerHTML = `
        <div style="background: var(--bg-surface-elevated); border: 2px solid var(--accent-light); border-radius: 12px; padding: 24px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 8px;">${match.logo}</div>
          <h3 style="font-size: 24px; color: var(--text-white); font-weight: 800;">${match.name}</h3>
          <p style="color: var(--accent-light); font-size: 14px; margin-bottom: 12px;">98% Match for your profile</p>
          <p style="color: var(--text-secondary); font-size: 13px; max-width: 500px; margin: 0 auto 20px auto;">${match.tagline}</p>
          <div style="display: flex; justify-content: center; gap: 12px;">
            <button class="btn-primary" id="quizActionTradeBtn">Try Stock Buyer Terminal</button>
            <a href="${match.websiteUrl}" target="_blank" rel="noopener noreferrer" class="btn-secondary" style="text-decoration: none;">
              Visit ${match.name} ↗
            </a>
            <button class="btn-secondary" id="restartQuizBtn">Retake Quiz</button>
          </div>
        </div>
      `;

      document.getElementById("quizActionTradeBtn")?.addEventListener("click", () => switchView("terminal"));
      document.getElementById("restartQuizBtn")?.addEventListener("click", () => {
        quizStep = 0;
        quizAnswers = [];
        resultBox.style.display = "none";
        optionsContainer.style.display = "flex";
        renderQuizStep();
      });
      return;
    }

    fill.style.width = `${((quizStep + 1) / MATCHER_QUIZ.length) * 100}%`;
    title.textContent = `Step ${quizStep + 1}: ${q.question}`;
    sub.textContent = q.subtitle;

    optionsContainer.innerHTML = q.options.map((opt, i) => `
      <div class="quiz-option-card" data-index="${i}">
        <div class="quiz-option-indicator"></div>
        <span class="quiz-option-text">${opt.text}</span>
      </div>
    `).join("");

    optionsContainer.querySelectorAll(".quiz-option-card").forEach(card => {
      card.addEventListener("click", () => {
        const opt = q.options[parseInt(card.dataset.index)];
        quizAnswers.push(opt);
        quizStep++;
        renderQuizStep();
      });
    });
  }

  // --- 10. STOCK & CRYPTO SCREENER ---
  function renderScreenerTable(searchQuery = "") {
    if (!elScreenerTableBody) return;
    const filtered = MARKET_ASSETS.filter(a =>
      a.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    elScreenerTableBody.innerHTML = filtered.map(a => {
      const cur = tradingEngine.prices[a.symbol] || a;
      const isUp = cur.change >= 0;
      const sign = isUp ? "+" : "";

      return `
        <tr>
          <td><strong style="color: var(--text-white); cursor: pointer;" class="screener-symbol-click" data-symbol="${a.symbol}">${a.symbol}</strong></td>
          <td>${a.name}</td>
          <td><span class="badge">${a.category}</span></td>
          <td>$${cur.price.toFixed(2)}</td>
          <td style="color: ${isUp ? 'var(--bull-green)' : 'var(--bear-red)'}; font-weight: 700;">
            ${sign}${cur.changePercent.toFixed(2)}%
          </td>
          <td>${a.marketCap}</td>
          <td>${a.peRatio}</td>
          <td>$${a.day52Low} - $${a.day52High}</td>
          <td>
            <button class="btn-primary" style="padding: 4px 10px; font-size: 11px;" data-symbol="${a.symbol}">
              Trade
            </button>
          </td>
        </tr>
      `;
    }).join("");

    elScreenerTableBody.querySelectorAll(".screener-symbol-click, button").forEach(el => {
      el.addEventListener("click", () => {
        switchView("terminal");
        selectAsset(el.dataset.symbol);
      });
    });
  }

  // --- 11. PORTFOLIO & WALLET OVERVIEW ---
  function updateWalletHeader() {
    if (elAccountBalance) {
      elAccountBalance.textContent = `$${tradingEngine.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }
  }

  function updatePortfolioView() {
    const stats = tradingEngine.getPortfolioSummary();

    const elNetWorth = document.getElementById("statNetWorth");
    const elCash = document.getElementById("statCash");
    const elHoldings = document.getElementById("statHoldings");
    const elTotalPnl = document.getElementById("statTotalPnl");

    if (elNetWorth) elNetWorth.textContent = `$${stats.netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (elCash) elCash.textContent = `$${stats.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    if (elHoldings) elHoldings.textContent = `$${stats.positionsValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    if (elTotalPnl) {
      const isUp = stats.totalPnl >= 0;
      const sign = isUp ? "+" : "";
      elTotalPnl.textContent = `${sign}$${stats.totalPnl.toFixed(2)} (${sign}${stats.totalPnlPct.toFixed(2)}%)`;
      elTotalPnl.className = `p-card-change ${isUp ? 'up' : 'down'}`;
      elTotalPnl.style.color = isUp ? "var(--bull-green)" : "var(--bear-red)";
    }
  }

  // --- 12. NAVIGATION ROUTING ---
  function switchView(viewName) {
    currentView = viewName;
    document.querySelectorAll(".view-section").forEach(sec => sec.classList.remove("active"));
    document.querySelectorAll(".nav-tab-btn").forEach(btn => btn.classList.remove("active"));

    const targetSection = document.getElementById(`view-${viewName}`);
    const targetNav = document.getElementById(`nav-btn-${viewName}`);

    if (targetSection) targetSection.classList.add("active");
    if (targetNav) targetNav.classList.add("active");

    if (viewName === "terminal") {
      setTimeout(() => chart.handleResize(), 50);
    } else if (viewName === "indian") {
      setTimeout(() => {
        if (indianChart) {
          indianChart.handleResize();
          if (indianMarketController && indianMarketController.selectedCompany) {
            indianMarketController.selectCompany(indianMarketController.selectedCompany.symbol);
          }
        }
      }, 50);
    } else if (viewName === "ipo") {
      if (ipoManager) ipoManager.renderIpoList();
    } else if (viewName === "matcher") {
      renderQuizStep();
    } else if (viewName === "portfolio") {
      updatePortfolioView();
    }
  }

  // --- 13. EVENT BINDINGS ---
  function bindEvents() {
    document.querySelectorAll(".nav-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => switchView(btn.dataset.view));
    });

    document.querySelectorAll(".tf-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tf-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentTimeframe = btn.dataset.tf;
        selectAsset(currentSymbol);
      });
    });

    document.getElementById("btnChartCandle")?.addEventListener("click", (e) => {
      e.target.classList.add("active");
      document.getElementById("btnChartLine")?.classList.remove("active");
      chart.setChartType("candle");
    });

    document.getElementById("btnChartLine")?.addEventListener("click", (e) => {
      e.target.classList.add("active");
      document.getElementById("btnChartCandle")?.classList.remove("active");
      chart.setChartType("line");
    });

    document.getElementById("btnToggleSMA")?.addEventListener("click", (e) => {
      const active = chart.toggleSma();
      e.target.classList.toggle("active", active);
    });

    // Indian Moving Chart Toolbar Controls
    document.getElementById("btnIndChartCandle")?.addEventListener("click", (e) => {
      e.target.classList.add("active");
      document.getElementById("btnIndChartLine")?.classList.remove("active");
      if (indianChart) indianChart.setChartType("candle");
    });

    document.getElementById("btnIndChartLine")?.addEventListener("click", (e) => {
      e.target.classList.add("active");
      document.getElementById("btnIndChartCandle")?.classList.remove("active");
      if (indianChart) indianChart.setChartType("line");
    });

    document.getElementById("btnIndToggleSMA")?.addEventListener("click", (e) => {
      if (indianChart) {
        const active = indianChart.toggleSma();
        e.target.classList.toggle("active", active);
      }
    });

    document.getElementById("orderTabBuy")?.addEventListener("click", () => {
      currentOrderTab = "BUY";
      document.getElementById("orderTabBuy").classList.add("active");
      document.getElementById("orderTabSell").classList.remove("active");
      updateOrderFormPricing();
    });

    document.getElementById("orderTabSell")?.addEventListener("click", () => {
      currentOrderTab = "SELL";
      document.getElementById("orderTabSell").classList.add("active");
      document.getElementById("orderTabBuy").classList.remove("active");
      updateOrderFormPricing();
    });

    elOrderTypeSelect?.addEventListener("change", (e) => {
      currentOrderType = e.target.value;
      if (currentOrderType === "LIMIT") {
        elLimitPriceGroup.style.display = "flex";
        elLimitPriceInput.value = (tradingEngine.prices[currentSymbol]?.price || 100).toFixed(2);
      } else {
        elLimitPriceGroup.style.display = "none";
      }
      updateOrderFormPricing();
    });

    elOrderSharesInput?.addEventListener("input", updateOrderFormPricing);
    elLimitPriceInput?.addEventListener("input", updateOrderFormPricing);

    document.querySelectorAll(".pct-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const pct = parseFloat(btn.dataset.pct) / 100;
        const curPrice = tradingEngine.prices[currentSymbol]?.price || 1;

        if (currentOrderTab === "BUY") {
          const maxShares = Math.floor((tradingEngine.cash * pct) / curPrice);
          elOrderSharesInput.value = maxShares > 0 ? maxShares : 1;
        } else {
          const holding = tradingEngine.positions[currentSymbol]?.shares || 0;
          elOrderSharesInput.value = Math.max(1, Math.floor(holding * pct));
        }
        updateOrderFormPricing();
      });
    });

    elSubmitOrderBtn?.addEventListener("click", executeOrder);

    const wlSearch = document.getElementById("watchlistSearchInput");
    wlSearch?.addEventListener("input", (e) => {
      const activeChip = document.querySelector(".chip-btn.active");
      renderWatchlist(activeChip?.dataset.category || "all", e.target.value);
    });

    document.querySelectorAll(".chip-btn").forEach(chip => {
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        renderWatchlist(chip.dataset.category, wlSearch?.value || "");
      });
    });

    document.querySelectorAll(".subtab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".subtab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".subtab-content").forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        const target = document.getElementById(btn.dataset.tab);
        if (target) target.classList.add("active");
      });
    });

    document.querySelectorAll(".p-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".p-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        const cat = btn.dataset.filter;
        if (cat === "all") {
          renderPlatforms(TRADING_PLATFORMS);
        } else if (cat === "zero_fees") {
          renderPlatforms(TRADING_PLATFORMS.filter(p => p.tradingFees.toLowerCase().includes("0%")));
        } else if (cat === "crypto") {
          renderPlatforms(TRADING_PLATFORMS.filter(p => p.category.toLowerCase().includes("crypto")));
        } else if (cat === "pro") {
          renderPlatforms(TRADING_PLATFORMS.filter(p => p.badges.includes("Best for Pros") || p.badges.includes("Editor's Choice")));
        } else if (cat === "beginner") {
          renderPlatforms(TRADING_PLATFORMS.filter(p => p.badges.includes("Best for Beginners") || p.bestFor.includes("Beginner")));
        }
      });
    });

    document.getElementById("screenerSearchInput")?.addEventListener("input", (e) => {
      renderScreenerTable(e.target.value);
    });

    document.getElementById("platformModalClose")?.addEventListener("click", () => {
      document.getElementById("platformModalOverlay")?.classList.remove("active");
    });
    document.getElementById("platformModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "platformModalOverlay") {
        e.target.classList.remove("active");
      }
    });

    document.getElementById("btnResetAccount")?.addEventListener("click", () => {
      if (confirm("Reset paper trading balance to $100,000.00 and clear all positions?")) {
        tradingEngine.resetAccount();
        updateWalletHeader();
        renderPositionsTable();
        renderOrdersTable();
        updatePortfolioView();
        window.showAppToast("Account successfully reset to $100,000.00 virtual cash.", "success");
      }
    });

    document.getElementById("btnAddFunds")?.addEventListener("click", () => {
      const amt = prompt("Enter amount of paper trading cash to deposit (USD):", "25000");
      const num = parseFloat(amt);
      if (num && num > 0) {
        tradingEngine.depositFunds(num);
        updateWalletHeader();
        updatePortfolioView();
        window.showAppToast(`Deposited $${num.toLocaleString()} virtual USD!`, "success");
      }
    });

    document.getElementById("btnToggleSound")?.addEventListener("click", (e) => {
      tradingEngine.soundEnabled = !tradingEngine.soundEnabled;
      e.target.textContent = tradingEngine.soundEnabled ? "🔔" : "🔕";
      window.showAppToast(tradingEngine.soundEnabled ? "Audio alerts enabled" : "Audio alerts muted", "success");
    });
  }

  // Run app
  init();
});
