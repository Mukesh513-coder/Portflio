/**
 * Stock Buyer - Pure Vanilla Canvas Charting Engine
 * Zero external libraries: 100% Native HTML5 Canvas
 * Features: Candlestick & Area modes, Crosshair, Tooltip, Volume bars, SMA lines
 * Color Scheme: Dark Blue (#0b1a30) & Light Blue (#38bdf8) accents
 */

class TradingChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");

    this.candles = [];
    this.chartType = "candle"; // 'candle' | 'line'
    this.showSma = true;
    this.showVolume = true;
    this.timeframe = "1D";
    this.activeSymbol = "NVDA";

    // Mouse crosshair tracking
    this.mouseX = -1;
    this.mouseY = -1;
    this.hoverIndex = -1;
    this.currency = "$"; // Currency prefix ('$' or '₹')

    // Palette: Clean White background, Light Blue lines & emerald/crimson candles
    this.colors = {
      bg: "#ffffff",
      grid: "#e2e8f0",
      text: "#475569",
      textMuted: "#94a3b8",
      crosshair: "#0284c7",
      upCandle: "#059669",     // Crisp green for gain on white
      downCandle: "#e11d48",   // Crisp crimson for drop on white
      sma20: "#d97706",        // Amber gold
      sma50: "#0284c7",        // Sky blue
      volumeUp: "rgba(5, 150, 105, 0.25)",
      volumeDown: "rgba(225, 29, 72, 0.25)",
      areaGradientStart: "rgba(2, 132, 199, 0.25)",
      areaGradientEnd: "rgba(255, 255, 255, 0.0)"
    };

    this.initEvents();
    this.handleResize();
  }

  initEvents() {
    window.addEventListener("resize", () => this.handleResize());

    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      this.render();
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.mouseX = -1;
      this.mouseY = -1;
      this.hoverIndex = -1;
      this.render();
      if (this.onHoverCallback) this.onHoverCallback(null);
    });
  }

  handleResize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;

    this.render();
  }

  setData(candles, symbol, timeframe, currency) {
    this.candles = candles || [];
    if (symbol) this.activeSymbol = symbol;
    if (timeframe) this.timeframe = timeframe;
    if (currency) this.currency = currency;
    else if (symbol && (symbol.includes(".NS") || symbol.includes(".BO") || window.ALL_INDIAN_COMPANIES?.some(c => c.symbol === symbol))) {
      this.currency = "₹";
    } else {
      this.currency = "$";
    }
    this.render();
  }

  updateLatestPrice(newPrice) {
    if (!this.candles || this.candles.length === 0) return;
    const latest = this.candles[this.candles.length - 1];
    latest.close = parseFloat(newPrice.toFixed(2));
    if (latest.close > latest.high) latest.high = latest.close;
    if (latest.close < latest.low) latest.low = latest.close;
    this.render();
  }

  calculateSMA(period) {
    const sma = [];
    for (let i = 0; i < this.candles.length; i++) {
      if (i < period - 1) {
        sma.push(null);
      } else {
        let sum = 0;
        for (let j = 0; j < period; j++) {
          sum += this.candles[i - j].close;
        }
        sma.push(sum / period);
      }
    }
    return sma;
  }

  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear canvas
    ctx.clearRect(0, 0, w, h);

    // Padding specs
    const padTop = 35;
    const padBottom = 45;
    const padRight = 75; // price axis width
    const padLeft = 15;

    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;
    const volumeH = this.showVolume ? chartH * 0.22 : 0;
    const priceH = chartH - volumeH;

    // Background fill
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, w, h);

    if (this.candles.length === 0) {
      ctx.fillStyle = this.colors.textMuted;
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Loading market data...", w / 2, h / 2);
      return;
    }

    // Min & Max Price
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVolume = 0;

    for (const c of this.candles) {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVolume) maxVolume = c.volume;
    }

    // Give 5% breathing margin
    const priceRange = maxPrice - minPrice || 1;
    minPrice -= priceRange * 0.05;
    maxPrice += priceRange * 0.05;
    const effectiveRange = maxPrice - minPrice;

    const getY = (price) => padTop + (1 - (price - minPrice) / effectiveRange) * priceH;
    const getVolY = (vol) => padTop + chartH - (vol / (maxVolume || 1)) * volumeH;

    const n = this.candles.length;
    const candleSpacing = chartW / n;
    const candleW = Math.max(candleSpacing * 0.7, 2);

    // 1. Draw Grid Lines & Price Labels
    const gridRows = 6;
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.colors.grid;
    ctx.fillStyle = this.colors.text;
    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";

    for (let i = 0; i <= gridRows; i++) {
      const y = padTop + (priceH / gridRows) * i;
      const priceVal = maxPrice - (effectiveRange / gridRows) * i;

      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padRight, y);
      ctx.stroke();

      // Right axis price label
      ctx.fillText(`${this.currency}${priceVal.toFixed(2)}`, w - padRight + 10, y + 4);
    }

    // 2. Draw Volume Bars (if enabled)
    if (this.showVolume && maxVolume > 0) {
      for (let i = 0; i < n; i++) {
        const c = this.candles[i];
        const x = padLeft + i * candleSpacing + candleSpacing / 2;
        const vY = getVolY(c.volume);
        const barH = padTop + chartH - vY;

        ctx.fillStyle = c.close >= c.open ? this.colors.volumeUp : this.colors.volumeDown;
        ctx.fillRect(x - candleW / 2, vY, candleW, barH);
      }
    }

    // 3. Draw Chart (Candles or Area/Line)
    if (this.chartType === "candle") {
      // Candlesticks
      for (let i = 0; i < n; i++) {
        const c = this.candles[i];
        const x = padLeft + i * candleSpacing + candleSpacing / 2;
        const isUp = c.close >= c.open;
        const color = isUp ? this.colors.upCandle : this.colors.downCandle;

        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);

        // Wick line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2;
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // Candle body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);

        ctx.fillStyle = color;
        ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyHeight);
      }
    } else {
      // Area / Line chart with subtle glowing cyan gradient
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const c = this.candles[i];
        const x = padLeft + i * candleSpacing + candleSpacing / 2;
        const y = getY(c.close);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Stroke Line
      ctx.strokeStyle = this.colors.sma50;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Area fill
      const lastX = padLeft + (n - 1) * candleSpacing + candleSpacing / 2;
      const firstX = padLeft + candleSpacing / 2;
      ctx.lineTo(lastX, padTop + priceH);
      ctx.lineTo(firstX, padTop + priceH);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + priceH);
      gradient.addColorStop(0, this.colors.areaGradientStart);
      gradient.addColorStop(1, this.colors.areaGradientEnd);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 4. Moving Averages (SMA 20 & SMA 50)
    if (this.showSma) {
      const drawSMA = (period, color) => {
        const smaVals = this.calculateSMA(period);
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < n; i++) {
          if (smaVals[i] !== null) {
            const x = padLeft + i * candleSpacing + candleSpacing / 2;
            const y = getY(smaVals[i]);
            if (!started) {
              ctx.moveTo(x, y);
              started = true;
            } else {
              ctx.lineTo(x, y);
            }
          }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      };

      drawSMA(20, this.colors.sma20);
      drawSMA(50, this.colors.sma50);
    }

    // 5. Time Axis Labels
    ctx.fillStyle = this.colors.textMuted;
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    const labelStep = Math.max(Math.floor(n / 6), 1);

    for (let i = 0; i < n; i += labelStep) {
      const c = this.candles[i];
      const x = padLeft + i * candleSpacing + candleSpacing / 2;
      const d = new Date(c.timestamp);
      let label = "";

      if (this.timeframe === "1D") {
        label = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      } else {
        label = d.toLocaleDateString([], { month: "short", day: "numeric" });
      }

      ctx.fillText(label, x, h - padBottom + 20);
    }

    // 6. Crosshair & Hover Tooltip
    if (this.mouseX >= padLeft && this.mouseX <= w - padRight && this.mouseY >= padTop && this.mouseY <= h - padBottom) {
      const idx = Math.min(
        Math.max(Math.floor((this.mouseX - padLeft) / candleSpacing), 0),
        n - 1
      );
      this.hoverIndex = idx;
      const hoverCandle = this.candles[idx];
      const crossX = padLeft + idx * candleSpacing + candleSpacing / 2;
      const crossY = this.mouseY;

      // Draw dashed crosshair lines
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 1;

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(crossX, padTop);
      ctx.lineTo(crossX, h - padBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(padLeft, crossY);
      ctx.lineTo(w - padRight, crossY);
      ctx.stroke();
      ctx.restore();

      // Current Price badge on the right axis
      const hoveredPrice = maxPrice - ((crossY - padTop) / priceH) * effectiveRange;
      ctx.fillStyle = "#0284c7"; // blue badge
      ctx.fillRect(w - padRight + 2, crossY - 10, padRight - 4, 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px 'JetBrains Mono', monospace";
      ctx.textAlign = "left";
      ctx.fillText(`${this.currency}${hoveredPrice.toFixed(2)}`, w - padRight + 8, crossY + 4);

      // HUD Badge in top-left
      this.renderHUD(hoverCandle);

      if (this.onHoverCallback) {
        this.onHoverCallback(hoverCandle);
      }
    } else {
      // 7. Live Moving Price Beacon (Draws when idle to show active price movement)
      if (this.candles.length > 0) {
        const latestCandle = this.candles[n - 1];
        const latestY = getY(latestCandle.close);
        const latestX = padLeft + (n - 1) * candleSpacing + candleSpacing / 2;
        const isLatestUp = latestCandle.close >= latestCandle.open;
        const beaconColor = isLatestUp ? this.colors.upCandle : this.colors.downCandle;

        ctx.save();
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = beaconColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padLeft, latestY);
        ctx.lineTo(w - padRight, latestY);
        ctx.stroke();

        // Pulsing head circle on the moving tick
        ctx.beginPath();
        ctx.arc(latestX, latestY, 4, 0, Math.PI * 2);
        ctx.fillStyle = beaconColor;
        ctx.shadowColor = beaconColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // Right axis latest price badge
        ctx.fillStyle = beaconColor;
        ctx.fillRect(w - padRight + 2, latestY - 9, padRight - 4, 18);
        ctx.fillStyle = "#041021";
        ctx.font = "bold 10px 'JetBrains Mono', monospace";
        ctx.textAlign = "left";
        ctx.fillText(`${this.currency}${latestCandle.close.toFixed(2)}`, w - padRight + 6, latestY + 4);

        // Render HUD with the latest candle
        this.renderHUD(latestCandle);
      }
    }
  }

  renderHUD(candle) {
    if (!candle) return;
    const ctx = this.ctx;
    const isUp = candle.close >= candle.open;
    const diff = (candle.close - candle.open).toFixed(2);
    const diffPct = (((candle.close - candle.open) / candle.open) * 100).toFixed(2);
    const sign = diff >= 0 ? "+" : "";

    ctx.font = "11px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";

    let textX = 20;
    const textY = 22;

    const printItem = (label, value, color) => {
      ctx.fillStyle = "#60a5fa"; // soft light blue label
      ctx.fillText(label, textX, textY);
      textX += ctx.measureText(label).width + 3;

      ctx.fillStyle = color || "#f0f9ff";
      ctx.fillText(value, textX, textY);
      textX += ctx.measureText(value).width + 14;
    };

    printItem("O:", `${this.currency}${candle.open.toFixed(2)}`);
    printItem("H:", `${this.currency}${candle.high.toFixed(2)}`);
    printItem("L:", `${this.currency}${candle.low.toFixed(2)}`);
    printItem("C:", `${this.currency}${candle.close.toFixed(2)}`, isUp ? this.colors.upCandle : this.colors.downCandle);
    printItem("CHG:", `${sign}${diff} (${sign}${diffPct}%)`, isUp ? this.colors.upCandle : this.colors.downCandle);
    printItem("VOL:", candle.volume.toLocaleString());

    if (this.showSma) {
      ctx.fillStyle = this.colors.sma20;
      ctx.fillText("● SMA20", textX, textY);
      textX += ctx.measureText("● SMA20").width + 10;

      ctx.fillStyle = this.colors.sma50;
      ctx.fillText("● SMA50", textX, textY);
    }
  }

  setChartType(type) {
    this.chartType = type;
    this.render();
  }

  toggleSma() {
    this.showSma = !this.showSma;
    this.render();
    return this.showSma;
  }

  toggleVolume() {
    this.showVolume = !this.showVolume;
    this.render();
    return this.showVolume;
  }
}
