/**
 * Stock Buyer - Trading Engine & State Management
 * Technology: Pure Vanilla JavaScript (Zero external libraries)
 * Features: Paper trading wallet, Portfolio tracking, Order book, Limit & Market orders,
 * Web Audio sound effects, real-time simulated price ticks.
 */

class TradingEngine {
  constructor() {
    this.initialBalance = 100000.00;
    this.soundEnabled = true;

    // Load persisted state or initialize
    this.loadState();

    // Active market asset prices dictionary
    this.prices = {};
    MARKET_ASSETS.forEach(a => {
      this.prices[a.symbol] = {
        price: a.price,
        prevClose: a.prevClose,
        high: a.high,
        low: a.low,
        change: a.change,
        changePercent: a.changePercent
      };
    });

    // Start live market simulation tick
    this.startMarketEngine();
  }

  // --- LOCAL STORAGE PERSISTENCE ---
  loadState() {
    const savedCash = localStorage.getItem("sb_cash");
    this.cash = savedCash !== null ? parseFloat(savedCash) : this.initialBalance;

    const savedPositions = localStorage.getItem("sb_positions");
    this.positions = savedPositions ? JSON.parse(savedPositions) : {
      NVDA: { symbol: "NVDA", shares: 25, avgPrice: 124.50 },
      AAPL: { symbol: "AAPL", shares: 40, avgPrice: 220.10 },
      "BTC-USD": { symbol: "BTC-USD", shares: 0.35, avgPrice: 62400.00 }
    };

    const savedOrders = localStorage.getItem("sb_orders");
    this.orders = savedOrders ? JSON.parse(savedOrders) : [
      {
        id: "ORD-9481",
        symbol: "NVDA",
        type: "BUY",
        orderType: "MARKET",
        shares: 25,
        price: 124.50,
        total: 3112.50,
        timestamp: Date.now() - 3600000 * 2,
        status: "FILLED"
      },
      {
        id: "ORD-9480",
        symbol: "AAPL",
        type: "BUY",
        orderType: "MARKET",
        shares: 40,
        price: 220.10,
        total: 8804.00,
        timestamp: Date.now() - 3600000 * 5,
        status: "FILLED"
      }
    ];

    const savedPending = localStorage.getItem("sb_pending");
    this.pendingOrders = savedPending ? JSON.parse(savedPending) : [];

    const savedWatchlist = localStorage.getItem("sb_watchlist");
    this.watchlist = savedWatchlist ? JSON.parse(savedWatchlist) : ["NVDA", "AAPL", "TSLA", "BTC-USD", "MSFT", "SOL-USD"];
  }

  saveState() {
    localStorage.setItem("sb_cash", this.cash.toFixed(2));
    localStorage.setItem("sb_positions", JSON.stringify(this.positions));
    localStorage.setItem("sb_orders", JSON.stringify(this.orders));
    localStorage.setItem("sb_pending", JSON.stringify(this.pendingOrders));
    localStorage.setItem("sb_watchlist", JSON.stringify(this.watchlist));
  }

  resetAccount() {
    this.cash = this.initialBalance;
    this.positions = {};
    this.orders = [];
    this.pendingOrders = [];
    this.saveState();
    this.playTone(440, 0.1, "sine");
  }

  depositFunds(amount) {
    if (amount <= 0) return false;
    this.cash += amount;
    this.saveState();
    this.playTone(587, 0.15, "triangle");
    return true;
  }

  toggleWatchlist(symbol) {
    const idx = this.watchlist.indexOf(symbol);
    if (idx >= 0) {
      this.watchlist.splice(idx, 1);
    } else {
      this.watchlist.push(symbol);
    }
    this.saveState();
    return this.watchlist.includes(symbol);
  }

  // --- TRADING EXECUTION ---
  buyOrder(symbol, shares, orderType = "MARKET", limitPrice = 0) {
    const currentPrice = this.prices[symbol]?.price || 0;
    if (currentPrice <= 0 || shares <= 0) {
      return { success: false, message: "Invalid order parameters." };
    }

    const execPrice = orderType === "MARKET" ? currentPrice : limitPrice;
    const totalCost = execPrice * shares;

    if (this.cash < totalCost) {
      this.playErrorTone();
      return {
        success: false,
        message: `Insufficient buying power. Required: $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}, Available: $${this.cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      };
    }

    if (orderType === "LIMIT" && limitPrice < currentPrice) {
      // Queue as pending limit order
      const order = {
        id: `LMT-${Math.floor(1000 + Math.random() * 9000)}`,
        symbol,
        type: "BUY",
        orderType: "LIMIT",
        shares,
        targetPrice: limitPrice,
        total: totalCost,
        timestamp: Date.now(),
        status: "PENDING"
      };
      this.pendingOrders.unshift(order);
      this.saveState();
      this.playTone(523.25, 0.12, "sine");
      return { success: true, message: `Limit BUY order submitted for ${shares} ${symbol} @ $${limitPrice.toFixed(2)}.` };
    }

    // Immediate Market Execution
    this.cash -= totalCost;

    if (this.positions[symbol]) {
      const existing = this.positions[symbol];
      const newShares = existing.shares + shares;
      const newAvg = (existing.shares * existing.avgPrice + totalCost) / newShares;
      this.positions[symbol] = {
        symbol,
        shares: newShares,
        avgPrice: parseFloat(newAvg.toFixed(2))
      };
    } else {
      this.positions[symbol] = {
        symbol,
        shares: shares,
        avgPrice: execPrice
      };
    }

    const completedOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol,
      type: "BUY",
      orderType: orderType,
      shares,
      price: execPrice,
      total: totalCost,
      timestamp: Date.now(),
      status: "FILLED"
    };

    this.orders.unshift(completedOrder);
    this.saveState();
    this.playSuccessTone();

    return {
      success: true,
      message: `Successfully bought ${shares} ${symbol} @ $${execPrice.toFixed(2)}! Total: $${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
    };
  }

  sellOrder(symbol, shares, orderType = "MARKET", limitPrice = 0) {
    const currentPrice = this.prices[symbol]?.price || 0;
    const currentHolding = this.positions[symbol]?.shares || 0;

    if (shares <= 0 || currentHolding < shares) {
      this.playErrorTone();
      return {
        success: false,
        message: `You do not own enough shares to sell. Owned: ${currentHolding}, Requested: ${shares}.`
      };
    }

    const execPrice = orderType === "MARKET" ? currentPrice : limitPrice;
    const totalProceeds = execPrice * shares;

    if (orderType === "LIMIT" && limitPrice > currentPrice) {
      // Pending limit order to sell at higher price
      const order = {
        id: `LMT-${Math.floor(1000 + Math.random() * 9000)}`,
        symbol,
        type: "SELL",
        orderType: "LIMIT",
        shares,
        targetPrice: limitPrice,
        total: totalProceeds,
        timestamp: Date.now(),
        status: "PENDING"
      };
      this.pendingOrders.unshift(order);
      this.saveState();
      this.playTone(440, 0.12, "sine");
      return { success: true, message: `Limit SELL order placed for ${shares} ${symbol} @ $${limitPrice.toFixed(2)}.` };
    }

    // Execute Sell
    this.cash += totalProceeds;
    const pos = this.positions[symbol];
    pos.shares -= shares;

    if (pos.shares <= 0.000001) {
      delete this.positions[symbol];
    }

    const completedOrder = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol,
      type: "SELL",
      orderType: orderType,
      shares,
      price: execPrice,
      total: totalProceeds,
      timestamp: Date.now(),
      status: "FILLED"
    };

    this.orders.unshift(completedOrder);
    this.saveState();
    this.playSuccessTone();

    return {
      success: true,
      message: `Sold ${shares} ${symbol} @ $${execPrice.toFixed(2)}! Received: $${totalProceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`
    };
  }

  closePosition(symbol) {
    const pos = this.positions[symbol];
    if (!pos || pos.shares <= 0) return { success: false, message: "No open position found." };
    return this.sellOrder(symbol, pos.shares, "MARKET");
  }

  cancelPendingOrder(orderId) {
    const idx = this.pendingOrders.findIndex(o => o.id === orderId);
    if (idx >= 0) {
      this.pendingOrders.splice(idx, 1);
      this.saveState();
      this.playTone(330, 0.1, "sine");
      return true;
    }
    return false;
  }

  // --- PORTFOLIO VALUATION ---
  getPortfolioSummary() {
    let positionsValue = 0;
    let totalCostBasis = 0;

    Object.values(this.positions).forEach(pos => {
      const curPrice = this.prices[pos.symbol]?.price || pos.avgPrice;
      positionsValue += pos.shares * curPrice;
      totalCostBasis += pos.shares * pos.avgPrice;
    });

    const netWorth = this.cash + positionsValue;
    const totalPnl = netWorth - this.initialBalance;
    const totalPnlPct = (totalPnl / this.initialBalance) * 100;
    const unrealizedPnl = positionsValue - totalCostBasis;
    const unrealizedPnlPct = totalCostBasis > 0 ? (unrealizedPnl / totalCostBasis) * 100 : 0;

    return {
      cash: this.cash,
      positionsValue,
      netWorth,
      totalCostBasis,
      unrealizedPnl,
      unrealizedPnlPct,
      totalPnl,
      totalPnlPct
    };
  }

  // --- ORDER BOOK GENERATION ---
  getOrderBook(symbol) {
    const currentPrice = this.prices[symbol]?.price || 100;
    const isCrypto = symbol.includes("BTC") || symbol.includes("ETH");
    const spread = isCrypto ? currentPrice * 0.0003 : 0.02;

    const bids = [];
    const asks = [];

    let cumBidSize = 0;
    let cumAskSize = 0;

    for (let i = 1; i <= 6; i++) {
      const bidPrice = currentPrice - spread * i - (Math.random() * 0.03);
      const askPrice = currentPrice + spread * i + (Math.random() * 0.03);
      const bidSize = isCrypto ? (Math.random() * 1.5 + 0.1).toFixed(3) : Math.floor(Math.random() * 250 + 20);
      const askSize = isCrypto ? (Math.random() * 1.5 + 0.1).toFixed(3) : Math.floor(Math.random() * 250 + 20);

      cumBidSize += parseFloat(bidSize);
      cumAskSize += parseFloat(askSize);

      bids.push({
        price: parseFloat(bidPrice.toFixed(2)),
        size: bidSize,
        total: cumBidSize.toFixed(isCrypto ? 3 : 0)
      });

      asks.push({
        price: parseFloat(askPrice.toFixed(2)),
        size: askSize,
        total: cumAskSize.toFixed(isCrypto ? 3 : 0)
      });
    }

    return { bids, asks: asks.reverse() };
  }

  // --- MARKET SIMULATION ENGINE ---
  startMarketEngine() {
    setInterval(() => {
      // Pick random asset to update
      const randomIndex = Math.floor(Math.random() * MARKET_ASSETS.length);
      const asset = MARKET_ASSETS[randomIndex];
      const cur = this.prices[asset.symbol];
      if (!cur) return;

      const isCrypto = asset.type === "crypto";
      const volatility = isCrypto ? 0.004 : 0.0018;
      const deltaPercent = (Math.random() - 0.49) * volatility;

      const newPrice = Math.max(0.01, cur.price * (1 + deltaPercent));
      cur.price = parseFloat(newPrice.toFixed(2));
      cur.change = parseFloat((cur.price - cur.prevClose).toFixed(2));
      cur.changePercent = parseFloat(((cur.change / cur.prevClose) * 100).toFixed(2));
      if (cur.price > cur.high) cur.high = cur.price;
      if (cur.price < cur.low) cur.low = cur.price;

      // Check pending limit orders for execution
      this.checkPendingOrders(asset.symbol, cur.price);

      // Notify UI listener if registered
      if (this.onPriceTick) {
        this.onPriceTick(asset.symbol, cur);
      }
    }, 1200);
  }

  checkPendingOrders(symbol, currentPrice) {
    for (let i = this.pendingOrders.length - 1; i >= 0; i--) {
      const order = this.pendingOrders[i];
      if (order.symbol !== symbol) continue;

      let shouldFill = false;
      if (order.type === "BUY" && currentPrice <= order.targetPrice) {
        shouldFill = true;
      } else if (order.type === "SELL" && currentPrice >= order.targetPrice) {
        shouldFill = true;
      }

      if (shouldFill) {
        this.pendingOrders.splice(i, 1);
        if (order.type === "BUY") {
          this.cash -= order.total;
          if (this.positions[symbol]) {
            const ex = this.positions[symbol];
            const newShares = ex.shares + order.shares;
            const newAvg = (ex.shares * ex.avgPrice + order.total) / newShares;
            this.positions[symbol] = { symbol, shares: newShares, avgPrice: parseFloat(newAvg.toFixed(2)) };
          } else {
            this.positions[symbol] = { symbol, shares: order.shares, avgPrice: currentPrice };
          }
        } else if (order.type === "SELL") {
          this.cash += order.total;
          if (this.positions[symbol]) {
            this.positions[symbol].shares -= order.shares;
            if (this.positions[symbol].shares <= 0.0001) delete this.positions[symbol];
          }
        }

        order.status = "FILLED";
        order.price = currentPrice;
        order.timestamp = Date.now();
        this.orders.unshift(order);
        this.saveState();
        this.playSuccessTone();

        if (this.onOrderFilled) {
          this.onOrderFilled(order);
        }
      }
    }
  }

  // --- NATIVE WEB AUDIO API SYNTHESIZER ---
  // Pure browser synthesizer, zero audio files required
  playTone(frequency, duration, type = "sine") {
    if (!this.soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioCtx = new AudioContext();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }

  playSuccessTone() {
    this.playTone(523.25, 0.08, "triangle"); // C5
    setTimeout(() => this.playTone(659.25, 0.12, "triangle"), 90); // E5
    setTimeout(() => this.playTone(783.99, 0.20, "triangle"), 180); // G5
  }

  playErrorTone() {
    this.playTone(280, 0.12, "sawtooth");
    setTimeout(() => this.playTone(210, 0.18, "sawtooth"), 100);
  }
}
