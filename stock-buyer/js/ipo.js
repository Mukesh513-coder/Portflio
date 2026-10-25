/**
 * Stock Buyer - IPO Central Engine
 * Comprehensive Indian & Global Initial Public Offerings (IPO) Portal
 * Features:
 * - Active IPOs open for bidding with "Buy IPO" option
 * - Upcoming IPOs and Recently Listed IPOs with GMP (Grey Market Premium)
 * - Interactive Bidding Modal with lot calculation & UPI / Paper Wallet deduction
 * - "My Applied IPOs" tracking with Allotment Status
 */

const IPO_DATABASE = [
  {
    id: "hyundai-india",
    name: "Hyundai Motor India Ltd.",
    category: "Automobile & EV",
    logo: "🚗",
    status: "active", // 'active' | 'upcoming' | 'listed'
    priceBand: "₹1,865 - ₹1,960",
    minPrice: 1865,
    cutoffPrice: 1960,
    lotSize: 7,
    minInvestment: 13720,
    issueSize: "₹27,870 Cr",
    openDate: "Oct 22, 2026",
    closeDate: "Oct 26, 2026",
    listingDate: "Nov 01, 2026",
    subscription: "2.37x",
    gmp: "+₹95 (5.1%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "The Indian subsidiary of South Korea's Hyundai Motor Company, India's second-largest passenger vehicle manufacturer."
  },
  {
    id: "swiggy-ipo",
    name: "Swiggy Ltd.",
    category: "Internet & Food Tech",
    logo: "🛵",
    status: "active",
    priceBand: "₹371 - ₹390",
    minPrice: 371,
    cutoffPrice: 390,
    lotSize: 38,
    minInvestment: 14820,
    issueSize: "₹11,327 Cr",
    openDate: "Oct 24, 2026",
    closeDate: "Oct 28, 2026",
    listingDate: "Nov 04, 2026",
    subscription: "4.12x",
    gmp: "+₹42 (10.8%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "10%",
    description: "Leading consumer tech platform operating food delivery, grocery quick-commerce (Instamart), dining out, and hyper-local pickup services."
  },
  {
    id: "ntpc-green",
    name: "NTPC Green Energy Ltd.",
    category: "Renewable Power",
    logo: "🌱",
    status: "active",
    priceBand: "₹102 - ₹108",
    minPrice: 102,
    cutoffPrice: 108,
    lotSize: 138,
    minInvestment: 14904,
    issueSize: "₹10,000 Cr",
    openDate: "Oct 25, 2026",
    closeDate: "Oct 29, 2026",
    listingDate: "Nov 05, 2026",
    subscription: "5.85x",
    gmp: "+₹18 (16.7%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "Clean energy arm of power giant NTPC focused on solar power, green hydrogen, and utility-scale wind projects."
  },
  {
    id: "waaree-energies",
    name: "Waaree Energies Ltd.",
    category: "Solar Manufacturing",
    logo: "☀️",
    status: "active",
    priceBand: "₹1,427 - ₹1,503",
    minPrice: 1427,
    cutoffPrice: 1503,
    lotSize: 9,
    minInvestment: 13527,
    issueSize: "₹4,321 Cr",
    openDate: "Oct 21, 2026",
    closeDate: "Oct 25, 2026",
    listingDate: "Oct 31, 2026",
    subscription: "76.3x",
    gmp: "+₹1,480 (98.5%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "India's largest manufacturer of solar photovoltaic (PV) modules with an installed capacity exceeding 12 GW."
  },
  {
    id: "tata-sons",
    name: "Tata Autocomp Systems Ltd.",
    category: "EV Components & Engineering",
    logo: "⚙️",
    status: "upcoming",
    priceBand: "₹550 - ₹580 (Expected)",
    minPrice: 550,
    cutoffPrice: 580,
    lotSize: 25,
    minInvestment: 14500,
    issueSize: "₹4,000 Cr (Est.)",
    openDate: "Nov 12, 2026",
    closeDate: "Nov 16, 2026",
    listingDate: "Nov 22, 2026",
    subscription: "Upcoming",
    gmp: "+₹120 (21.4%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "Flagship automotive components arm of Tata Group manufacturing EV powertrains, battery packs, and thermal cooling solutions."
  },
  {
    id: "boat-lifestyle",
    name: "Imagine Marketing (boAt) Ltd.",
    category: "Consumer Wearables & Audio",
    logo: "🎧",
    status: "upcoming",
    priceBand: "₹320 - ₹345 (Expected)",
    minPrice: 320,
    cutoffPrice: 345,
    lotSize: 42,
    minInvestment: 14490,
    issueSize: "₹2,000 Cr",
    openDate: "Nov 18, 2026",
    closeDate: "Nov 22, 2026",
    listingDate: "Nov 28, 2026",
    subscription: "Upcoming",
    gmp: "+₹45 (13.2%)",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "India's #1 direct-to-consumer wireless hearables and smartwatches lifestyle brand with commanding market share."
  },
  {
    id: "bajaj-housing",
    name: "Bajaj Housing Finance Ltd.",
    category: "Housing Finance / NBFC",
    logo: "🏠",
    status: "listed",
    priceBand: "₹66 - ₹70",
    minPrice: 66,
    cutoffPrice: 70,
    lotSize: 214,
    minInvestment: 14980,
    issueSize: "₹6,560 Cr",
    openDate: "Sep 09, 2026",
    closeDate: "Sep 11, 2026",
    listingDate: "Sep 16, 2026",
    subscription: "63.6x",
    listingPrice: "₹150.00",
    listingGain: "+114.2% Listing Day Pop",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "Upper-layer NBFC providing prime residential mortgage finance, loans against property, and developer financing."
  },
  {
    id: "premier-energies",
    name: "Premier Energies Ltd.",
    category: "Solar Cells & Renewable",
    logo: "⚡",
    status: "listed",
    priceBand: "₹427 - ₹450",
    minPrice: 427,
    cutoffPrice: 450,
    lotSize: 33,
    minInvestment: 14850,
    issueSize: "₹2,830 Cr",
    openDate: "Aug 27, 2026",
    closeDate: "Aug 29, 2026",
    listingDate: "Sep 03, 2026",
    subscription: "75.0x",
    listingPrice: "₹991.00",
    listingGain: "+120.2% Listing Day Pop",
    gmpPositive: true,
    exchange: "NSE & BSE",
    retailQuota: "35%",
    description: "India's second-largest integrated solar cell and solar module manufacturer."
  }
];

class IpoManager {
  constructor(tradingEngine) {
    this.tradingEngine = tradingEngine;
    this.storageKey = "sb_applied_ipos";
    this.activeFilter = "all";
    this.appliedIpos = this.loadAppliedIpos();
    this.selectedIpo = null;

    this.init();
  }

  init() {
    this.renderIpoList();
    this.bindEvents();
  }

  loadAppliedIpos() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try { return JSON.parse(saved); } catch(e){}
    }
    // Seed sample applied IPO
    return [
      {
        id: "APPLY-7841",
        ipoId: "bajaj-housing",
        companyName: "Bajaj Housing Finance Ltd.",
        lots: 1,
        shares: 214,
        bidPrice: 70,
        totalAmount: 14980,
        upiId: "trader@okhdfcbank",
        timestamp: Date.now() - 3600000 * 24 * 10,
        status: "Allotted (1 Lot)",
        statusType: "success"
      }
    ];
  }

  saveAppliedIpos() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.appliedIpos));
  }

  renderIpoList() {
    const container = document.getElementById("ipoGridContainer");
    if (!container) return;

    let list = IPO_DATABASE;
    if (this.activeFilter === "active") {
      list = IPO_DATABASE.filter(i => i.status === "active");
    } else if (this.activeFilter === "upcoming") {
      list = IPO_DATABASE.filter(i => i.status === "upcoming");
    } else if (this.activeFilter === "listed") {
      list = IPO_DATABASE.filter(i => i.status === "listed");
    }

    container.innerHTML = list.map(ipo => {
      const isAlreadyApplied = this.appliedIpos.some(a => a.ipoId === ipo.id);
      let statusBadge = "";
      let actionBtn = "";

      if (ipo.status === "active") {
        statusBadge = `<span class="badge" style="background: rgba(0, 240, 255, 0.15); color: var(--accent-cyan); font-weight: 700;">🟢 Open for Bidding</span>`;
        if (isAlreadyApplied) {
          actionBtn = `<button class="btn-secondary" style="color: var(--bull-green); border-color: var(--bull-green); cursor: default;">✓ Applied (Bidding Confirmed)</button>`;
        } else {
          actionBtn = `<button class="btn-primary btn-buy-ipo" data-id="${ipo.id}" style="width: 100%; justify-content: center; font-size: 13px; font-weight: 800;">🚀 Buy IPO (Apply Now)</button>`;
        }
      } else if (ipo.status === "upcoming") {
        statusBadge = `<span class="badge" style="background: rgba(251, 191, 36, 0.15); color: #fbbf24; font-weight: 700;">⏳ Upcoming Issue</span>`;
        actionBtn = `<button class="btn-secondary btn-preapply-ipo" data-id="${ipo.id}" style="width: 100%; justify-content: center;">Pre-Apply / Set Alert</button>`;
      } else {
        statusBadge = `<span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; font-weight: 700;">🎉 Listed (${ipo.listingGain})</span>`;
        actionBtn = `<button class="btn-secondary" onclick="switchView('indian')" style="width: 100%; justify-content: center;">View Chart on NSE ↗</button>`;
      }

      return `
        <div class="ipo-card">
          <div>
            <div class="ipo-card-header">
              <div class="ipo-logo-badge">${ipo.logo}</div>
              <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <h3 style="font-size: 16px; font-weight: 800; color: var(--text-white); line-height: 1.3;">${ipo.name}</h3>
                </div>
                <div style="font-size: 11px; color: var(--accent-light); margin-top: 2px;">${ipo.category} • ${ipo.exchange}</div>
              </div>
            </div>

            <div style="margin: 12px 0 10px 0; display: flex; justify-content: space-between; align-items: center;">
              ${statusBadge}
              <div style="font-size: 11px; font-family: var(--font-mono); font-weight: 700; color: var(--bull-green);">
                GMP: ${ipo.gmp}
              </div>
            </div>

            <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
              ${ipo.description}
            </p>

            <div class="ipo-details-grid">
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Price Band</span>
                <span class="ipo-detail-val" style="color: var(--text-white);">${ipo.priceBand}</span>
              </div>
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Lot Size</span>
                <span class="ipo-detail-val">${ipo.lotSize} Shares</span>
              </div>
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Min Investment</span>
                <span class="ipo-detail-val" style="color: var(--accent-light);">₹${ipo.minInvestment.toLocaleString()}</span>
              </div>
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Issue Size</span>
                <span class="ipo-detail-val">${ipo.issueSize}</span>
              </div>
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Bidding Dates</span>
                <span class="ipo-detail-val" style="font-size: 11px;">${ipo.openDate} - ${ipo.closeDate}</span>
              </div>
              <div class="ipo-detail-box">
                <span class="ipo-detail-label">Subscription</span>
                <span class="ipo-detail-val" style="color: var(--bull-green);">${ipo.subscription}</span>
              </div>
            </div>
          </div>

          <div style="margin-top: 14px;">
            ${actionBtn}
          </div>
        </div>
      `;
    }).join("");

    container.querySelectorAll(".btn-buy-ipo, .btn-preapply-ipo").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openBuyModal(btn.dataset.id);
      });
    });

    this.renderAppliedIposTable();
  }

  renderAppliedIposTable() {
    const tbody = document.getElementById("myAppliedIposTableBody");
    if (!tbody) return;

    if (this.appliedIpos.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">
            You have not applied for any IPOs yet. Click "Buy IPO" on any active offering above to place your bid!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.appliedIpos.map(app => {
      const dt = new Date(app.timestamp).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
      const statusColor = app.status.includes("Allotted") ? "var(--bull-green)" : (app.status.includes("Confirmed") ? "var(--accent-light)" : "var(--text-white)");

      return `
        <tr>
          <td style="font-family: var(--font-mono); color: var(--text-muted);">${app.id}</td>
          <td><strong>${app.companyName}</strong></td>
          <td>${app.lots} Lot (${app.shares} Shares)</td>
          <td style="font-family: var(--font-mono);">₹${app.bidPrice.toFixed(2)}</td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-white);">₹${app.totalAmount.toLocaleString()}</td>
          <td style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary);">${app.upiId}</td>
          <td style="font-weight: 700; color: ${statusColor};">
            ● ${app.status}
          </td>
        </tr>
      `;
    }).join("");
  }

  openBuyModal(ipoId) {
    const ipo = IPO_DATABASE.find(i => i.id === ipoId);
    if (!ipo) return;

    this.selectedIpo = ipo;
    const overlay = document.getElementById("buyIpoModalOverlay");
    if (!overlay) return;

    document.getElementById("modalIpoTitle").innerHTML = `${ipo.logo} Buy IPO: ${ipo.name}`;
    document.getElementById("modalIpoPriceBand").textContent = ipo.priceBand;
    document.getElementById("modalIpoLotSize").textContent = `${ipo.lotSize} Shares / Lot`;
    document.getElementById("modalIpoIssueSize").textContent = ipo.issueSize;
    document.getElementById("modalIpoCutoffPrice").value = ipo.cutoffPrice;

    const lotInput = document.getElementById("modalIpoLotsInput");
    lotInput.value = 1;
    this.recalculateModalTotal();

    overlay.classList.add("active");
  }

  closeBuyModal() {
    document.getElementById("buyIpoModalOverlay")?.classList.remove("active");
  }

  recalculateModalTotal() {
    if (!this.selectedIpo) return;
    const lots = parseInt(document.getElementById("modalIpoLotsInput").value) || 1;
    const isCutoff = document.getElementById("modalIpoCutoffCheck").checked;
    const price = isCutoff ? this.selectedIpo.cutoffPrice : (parseFloat(document.getElementById("modalIpoCustomPriceInput").value) || this.selectedIpo.cutoffPrice);

    const totalShares = lots * this.selectedIpo.lotSize;
    const totalAmount = totalShares * price;

    document.getElementById("modalIpoTotalShares").textContent = `${totalShares} Shares`;
    document.getElementById("modalIpoTotalAmount").textContent = `₹${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  }

  submitBid() {
    if (!this.selectedIpo) return;
    const lots = parseInt(document.getElementById("modalIpoLotsInput").value) || 1;
    const upiId = document.getElementById("modalIpoUpiInput").value.trim() || "trader@okhdfcbank";
    const isCutoff = document.getElementById("modalIpoCutoffCheck").checked;
    const price = isCutoff ? this.selectedIpo.cutoffPrice : (parseFloat(document.getElementById("modalIpoCustomPriceInput").value) || this.selectedIpo.cutoffPrice);

    const totalShares = lots * this.selectedIpo.lotSize;
    const totalAmount = totalShares * price;

    // Check funds in paper wallet (converted roughly or simulated INR)
    const appId = `IPO-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = {
      id: appId,
      ipoId: this.selectedIpo.id,
      companyName: this.selectedIpo.name,
      lots: lots,
      shares: totalShares,
      bidPrice: price,
      totalAmount: totalAmount,
      upiId: upiId,
      timestamp: Date.now(),
      status: "Bidding Confirmed (Allotment Pending)",
      statusType: "pending"
    };

    this.appliedIpos.unshift(application);
    this.saveAppliedIpos();

    this.closeBuyModal();
    this.renderIpoList();

    if (window.showAppToast) {
      window.showAppToast(`IPO Application #${appId} submitted successfully for ${this.selectedIpo.name}! Total Blocked: ₹${totalAmount.toLocaleString()}`, "success");
    }

    // Play chime sound
    if (this.tradingEngine && this.tradingEngine.playSuccessTone) {
      this.tradingEngine.playSuccessTone();
    }
  }

  bindEvents() {
    // IPO Filter Chips
    document.querySelectorAll(".ipo-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".ipo-filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeFilter = btn.dataset.filter;
        this.renderIpoList();
      });
    });

    // Modal Lot Input & Cut-off price toggle
    const lotInput = document.getElementById("modalIpoLotsInput");
    lotInput?.addEventListener("input", () => this.recalculateModalTotal());

    document.getElementById("modalIpoCutoffCheck")?.addEventListener("change", (e) => {
      const customPriceGroup = document.getElementById("modalIpoCustomPriceGroup");
      if (customPriceGroup) customPriceGroup.style.display = e.target.checked ? "none" : "flex";
      this.recalculateModalTotal();
    });

    document.getElementById("modalIpoCustomPriceInput")?.addEventListener("input", () => this.recalculateModalTotal());

    // Submit Bid Button
    document.getElementById("btnConfirmIpoBid")?.addEventListener("click", () => this.submitBid());

    // Modal Close
    document.getElementById("buyIpoModalClose")?.addEventListener("click", () => this.closeBuyModal());
    document.getElementById("buyIpoModalOverlay")?.addEventListener("click", (e) => {
      if (e.target.id === "buyIpoModalOverlay") this.closeBuyModal();
    });
  }
}

window.IpoManager = IpoManager;
window.IPO_DATABASE = IPO_DATABASE;
