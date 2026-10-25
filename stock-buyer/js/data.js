/**
 * Stock Buyer - Trading Platforms & Market Data Engine
 * Contains datasets for top global trading platforms, stock & crypto assets,
 * historical price generation, and market news.
 */

// 1. TOP GLOBAL TRADING PLATFORMS DATABASE
const TRADING_PLATFORMS = [
  {
    id: "robinhood",
    name: "Robinhood",
    logo: "🏹",
    tagline: "Pioneer of commission-free stock and options trading with sleek mobile UX.",
    category: "Stock & Options Broker",
    rating: 4.6,
    reviewCount: "420K+",
    minDeposit: "$0",
    tradingFees: "0% Commission",
    marginRate: "5.75% (Gold)",
    assetClasses: ["Stocks", "ETFs", "Options", "Crypto", "Retirement IRA"],
    bestFor: "Beginners & Mobile Investors",
    badges: ["Zero Commission", "Best for Beginners"],
    pros: [
      "Intuitive, clean mobile and web interface",
      "Fractional share investing from $1",
      "High yield cash sweep with Robinhood Gold",
      "Commission-free crypto and options trading"
    ],
    cons: [
      "Limited advanced technical charting tools",
      "No mutual funds or fixed-income bonds",
      "Customer support historically criticized"
    ],
    keyFeatures: [
      "Fractional Shares ($1 minimum)",
      "24 Hour Market on select stocks",
      "Instant Deposits up to $50,000",
      "Robinhood Gold 5% APY on uninvested cash"
    ],
    websiteUrl: "https://robinhood.com",
    established: 2013,
    headquarters: "Menlo Park, CA, USA",
    regulatedBy: "SEC, FINRA, SIPC"
  },
  {
    id: "ibkr",
    name: "Interactive Brokers (IBKR)",
    logo: "🌐",
    tagline: "The premier institutional and active trader platform across 150+ global markets.",
    category: "Full-Service Global Broker",
    rating: 4.9,
    reviewCount: "185K+",
    minDeposit: "$0",
    tradingFees: "$0 (IBKR Lite) / $0.005 per share (IBKR Pro)",
    marginRate: "5.83% - 6.83%",
    assetClasses: ["Stocks", "Options", "Futures", "Forex", "Bonds", "Funds", "Crypto"],
    bestFor: "Advanced & Professional Global Traders",
    badges: ["Editor's Choice", "Lowest Margin Rates", "Best for Pros"],
    pros: [
      "Direct market access to 150 global exchanges in 34 countries",
      "Industry-lowest margin interest rates",
      "Powerful Trader Workstation (TWS) desktop suite",
      "Deep institutional execution quality and order routing"
    ],
    cons: [
      "Steep learning curve for Trader Workstation",
      "Complex tiered fee structure for beginners",
      "Customer service can be technical"
    ],
    keyFeatures: [
      "Trader Workstation (TWS) professional trading platform",
      "GlobalTrader mobile app for simplified global access",
      "IBKR GlobalAnalyst tool for international valuation",
      "Automated algorithmic trading and Python/REST APIs"
    ],
    websiteUrl: "https://www.interactivebrokers.com",
    established: 1978,
    headquarters: "Greenwich, CT, USA",
    regulatedBy: "SEC, FINRA, FCA, ASIC, MAS"
  },
  {
    id: "webull",
    name: "Webull",
    logo: "🐂",
    tagline: "Zero-commission active trading with comprehensive technical analysis & paper trading.",
    category: "Discount Brokerage",
    rating: 4.7,
    reviewCount: "310K+",
    minDeposit: "$0",
    tradingFees: "0% Commission",
    marginRate: "5.49% - 9.49%",
    assetClasses: ["Stocks", "ETFs", "Options", "Futures", "Crypto (via Webull Pay)"],
    bestFor: "Active Technical Traders & Intermediate Users",
    badges: ["Best Charting", "Zero Commission"],
    pros: [
      "Full extended-hours trading (4:00 AM – 8:00 PM ET)",
      "Free simulated paper trading with real-time data",
      "Advanced charting with 50+ technical indicators",
      "No contract fees on stock options trading"
    ],
    cons: [
      "Crypto requires separate Webull Pay app in certain regions",
      "No OTC penny stock trading or mutual funds",
      "Customer phone support can have long wait times"
    ],
    keyFeatures: [
      "Full Extended Hours Trading",
      "Nasdaq Level 2 Advance (TotalView) quotes",
      "Multi-platform desktop client (Windows/Mac/Linux)",
      "Screeners with technical indicator alerts"
    ],
    websiteUrl: "https://www.webull.com",
    established: 2017,
    headquarters: "St. Petersburg, FL, USA",
    regulatedBy: "SEC, FINRA, SIPC"
  },
  {
    id: "tradingview",
    name: "TradingView",
    logo: "📊",
    tagline: "World's most popular financial charting and social network for active traders.",
    category: "Charting & Analytics Platform",
    rating: 4.9,
    reviewCount: "500K+",
    minDeposit: "$0 (Free tier available)",
    tradingFees: "Free to $59.95/mo (Connects to external brokers)",
    marginRate: "N/A (Broker dependent)",
    assetClasses: ["Stocks", "Crypto", "Forex", "Futures", "Indices", "Bonds"],
    bestFor: "Technical Analysis, Charting & Social Trading",
    badges: ["Top Charting Suite", "Global Community"],
    pros: [
      "Industry gold-standard HTML5 charts with 100+ drawing tools",
      "Pine Script™ programming language for custom indicators & backtesting",
      "Direct integration with 50+ major brokers for seamless execution",
      "Massive social community sharing trading ideas and strategies"
    ],
    cons: [
      "Free version includes ads and limits indicators per chart",
      "Not a standalone brokerage; requires connected broker account",
      "Real-time data for non-US exchanges requires paid add-ons"
    ],
    keyFeatures: [
      "Custom Pine Script™ algorithmic strategy backtester",
      "Multi-chart layouts (up to 8 charts per tab)",
      "Server-side price and indicator alerts via SMS/Webhook",
      "Comprehensive heatmaps, economic calendars and screeners"
    ],
    websiteUrl: "https://www.tradingview.com",
    established: 2011,
    headquarters: "Westerville, OH & London, UK",
    regulatedBy: "Integrated with SEC/FINRA brokers"
  },
  {
    id: "binance",
    name: "Binance",
    logo: "🪙",
    tagline: "The world's largest cryptocurrency exchange by trading volume and liquidity.",
    category: "Crypto Exchange",
    rating: 4.8,
    reviewCount: "680K+",
    minDeposit: "$10",
    tradingFees: "0.02% - 0.10% (Spot)",
    marginRate: "Flexible interest rates",
    assetClasses: ["Crypto Spot", "Futures & Derivatives", "DeFi Staking", "NFTs"],
    bestFor: "Crypto Traders & Web3 Enthusiasts",
    badges: ["Highest Crypto Liquidity", "Lowest Crypto Fees"],
    pros: [
      "Deepest liquidity and lowest spot trading fees in crypto",
      "Over 350+ cryptocurrencies and thousands of trading pairs",
      "Comprehensive ecosystem: Spot, Margin, Futures, Launchpad, Staking",
      "Advanced trading interface with TradingView integration"
    ],
    cons: [
      "US citizens restricted to separate Binance.US entity",
      "Regulatory scrutiny across several jurisdictions",
      "Can be overwhelming for non-crypto natives"
    ],
    keyFeatures: [
      "Binance Convert for zero-fee instant swaps",
      "Futures trading up to 125x leverage (regional rules apply)",
      "Earn & Staking yields on idle digital assets",
      "Strict Proof-of-Reserves transparency reporting"
    ],
    websiteUrl: "https://www.binance.com",
    established: 2017,
    headquarters: "Global",
    regulatedBy: "Registered in multiple international jurisdictions"
  },
  {
    id: "thinkorswim",
    name: "Charles Schwab (thinkorswim)",
    logo: "🏛️",
    tagline: "Legendary elite trading platform engineered for serious options and equity traders.",
    category: "Full-Service Brokerage",
    rating: 4.8,
    reviewCount: "350K+",
    minDeposit: "$0",
    tradingFees: "$0 Stocks/ETFs, $0.65 per options contract",
    marginRate: "6.50% - 11.25%",
    assetClasses: ["Stocks", "ETFs", "Options", "Futures", "Forex", "Bonds", "Mutual Funds"],
    bestFor: "Advanced Options & Derivatives Specialists",
    badges: ["Best Research", "Top Options Platform"],
    pros: [
      "Unrivaled thinkorswim desktop suite with deep options analytics",
      "Free access to top-tier Morningstar, Schwab, and Reuters research",
      "24/7 dedicated telephone and live chat trader support",
      "PaperMoney® simulator with $100K virtual practice money"
    ],
    cons: [
      "High margin interest rates compared to IBKR",
      "Desktop software has a significant initial learning curve",
      "Futures contract fees are slightly higher than boutique futures brokers"
    ],
    keyFeatures: [
      "thinkorswim Desktop, Web, and Mobile environments",
      "thinkScript for proprietary strategy modeling",
      "Analyze tab for multi-leg option probability cones",
      "Real-time news from CNBC live streaming directly inside the terminal"
    ],
    websiteUrl: "https://www.schwab.com/trading",
    established: 1971,
    headquarters: "Westlake, TX, USA",
    regulatedBy: "SEC, FINRA, SIPC"
  },
  {
    id: "etoro",
    name: "eToro",
    logo: "👥",
    tagline: "The world's leading social investing platform with patented CopyTrader™ technology.",
    category: "Social Trading Broker",
    rating: 4.5,
    reviewCount: "290K+",
    minDeposit: "$50",
    tradingFees: "$0 Commission on Stocks, 1% on Crypto",
    marginRate: "Varies by jurisdiction",
    assetClasses: ["Stocks", "Crypto", "ETFs", "Commodities", "Forex", "Smart Portfolios"],
    bestFor: "Social Traders & Copy Trading",
    badges: ["Best Copy Trading", "Social Investing"],
    pros: [
      "CopyTrader™ automatically mirrors top-performing vetted traders",
      "Community feed with real-time sentiment and market discussions",
      "Commission-free stocks in the US and Europe",
      "Thematic Smart Portfolios for diversified thematic exposure"
    ],
    cons: [
      "$5 withdrawal fee in some non-US regions",
      "1% fee on crypto purchases is higher than dedicated exchanges",
      "Limited advanced charting compared to TradingView or thinkorswim"
    ],
    keyFeatures: [
      "CopyTrader™ with transparent performance history",
      "Popular Investor Program with compensation for followed traders",
      "Virtual portfolio with $100,000 demo credits",
      "Smart Portfolios grouped by sector, AI, and top performers"
    ],
    websiteUrl: "https://www.etoro.com",
    established: 2007,
    headquarters: "Tel Aviv, Israel",
    regulatedBy: "SEC, FINRA, FCA, CySEC, ASIC"
  },
  {
    id: "fidelity",
    name: "Fidelity Investments",
    logo: "🛡️",
    tagline: "America's top-rated comprehensive powerhouse for long-term wealth, trading, and research.",
    category: "Full-Service Brokerage",
    rating: 4.9,
    reviewCount: "480K+",
    minDeposit: "$0",
    tradingFees: "$0 Stocks/ETFs, $0.65 per options contract",
    marginRate: "5.50% - 9.00%",
    assetClasses: ["Stocks", "ETFs", "Options", "Bonds", "Mutual Funds", "Crypto (Fidelity Crypto)", "IRAs"],
    bestFor: "Long-Term Investors, Retirement & Research",
    badges: ["Best Overall Broker", "Zero Expense Ratio Funds"],
    pros: [
      "No account fees, no minimum deposit, and zero domestic wire fees",
      "Industry-first ZERO expense ratio mutual funds (FZROX)",
      "Outstanding price execution: 85% of orders filled at price better than NBBO",
      "Exceptional 24/7 customer service and branches across the US"
    ],
    cons: [
      "Active Trader Pro desktop software feels dated compared to modern apps",
      "No direct futures or forex trading",
      "Cryptocurrency offering is currently limited to BTC and ETH"
    ],
    keyFeatures: [
      "Active Trader Pro customizable desktop workspace",
      "Fidelity ZERO Index Funds with 0.00% expense ratio",
      "Automatic cash sweep into 4.9%+ money market government fund",
      "Robust portfolio analysis and retirement planning calculators"
    ],
    websiteUrl: "https://www.fidelity.com",
    established: 1946,
    headquarters: "Boston, MA, USA",
    regulatedBy: "SEC, FINRA, SIPC"
  },
  {
    id: "coinbase",
    name: "Coinbase & Coinbase Advanced",
    logo: "🔵",
    tagline: "The most trusted, publicly traded gateway to digital assets and web3.",
    category: "Crypto Exchange & Web3 Wallet",
    rating: 4.7,
    reviewCount: "410K+",
    minDeposit: "$2",
    tradingFees: "0.05% - 0.60% (Advanced Trade maker/taker)",
    marginRate: "Institutional only",
    assetClasses: ["Crypto Spot", "Crypto Derivatives (US Perps)", "Staking", "DeFi Web3 Wallet"],
    bestFor: "Security-Minded Crypto Investors",
    badges: ["Most Secure Crypto", "Publicly Traded (NASDAQ: COIN)"],
    pros: [
      "NASDAQ publicly traded firm (COIN) with audited financials",
      "Unmatched security standards; 98% of cold storage assets offline",
      "Coinbase Advanced provides TradingView charts, order books, and API",
      "Seamless fiat deposits/withdrawals via ACH, Wire, Apple Pay"
    ],
    cons: [
      "Simple trading interface incurs high spread/convenience fees",
      "Advanced fees are higher than Binance for small retail volume",
      "Customer phone support can be slow during crypto bull runs"
    ],
    keyFeatures: [
      "Coinbase One subscription for zero trading fees and boosted staking",
      "Coinbase Advanced with depth charts and full REST/WebSocket API",
      "Base Layer-2 ecosystem integration",
      "Vault storage with time-locked multisig withdrawals"
    ],
    websiteUrl: "https://www.coinbase.com",
    established: 2012,
    headquarters: "San Francisco, CA, USA",
    regulatedBy: "US NYDFS BitLicense, FinCEN, FCA"
  },
  {
    id: "zerodha",
    name: "Zerodha (Kite)",
    logo: "🪁",
    tagline: "India's largest discount broker that revolutionized digital equity investing.",
    category: "Discount Brokerage",
    rating: 4.8,
    reviewCount: "550K+",
    minDeposit: "₹0 ($0)",
    tradingFees: "₹0 Equity Delivery, ₹20 per intraday/F&O order",
    marginRate: "0.05% per day",
    assetClasses: ["Indian Equities (NSE/BSE)", "Futures & Options", "Commodities", "Currencies", "Direct Mutual Funds"],
    bestFor: "Indian Market Equities & F&O Traders",
    badges: ["#1 in India", "Zero Delivery Brokerage"],
    pros: [
      "Ultra-minimalist, blazing fast Kite trading interface",
      "Completely free equity delivery investments forever",
      "Flat ₹20 ($0.24) capped brokerage on intraday and options",
      "Vast educational ecosystem via Varsity"
    ],
    cons: [
      "Only supports Indian domestic markets (NSE, BSE, MCX)",
      "No 3-in-1 banking account integration",
      "Occasional server glitches during unprecedented market volatility"
    ],
    keyFeatures: [
      "Kite 3.0 minimalist responsive web and mobile app",
      "Kite Connect API for algorithmic python bots",
      "Streak strategy scanner without code",
      "Coin platform for direct, zero-commission mutual funds"
    ],
    websiteUrl: "https://zerodha.com",
    established: 2010,
    headquarters: "Bengaluru, India",
    regulatedBy: "SEBI"
  },
  {
    id: "kraken",
    name: "Kraken",
    logo: "🐙",
    tagline: "Industry-leading security, high liquidity, and comprehensive spot & margin crypto trading.",
    category: "Crypto Exchange",
    rating: 4.7,
    reviewCount: "220K+",
    minDeposit: "$10",
    tradingFees: "0.16% maker / 0.26% taker (Kraken Pro)",
    marginRate: "0.02% per 4 hours",
    assetClasses: ["Crypto Spot", "Crypto Margin (up to 5x)", "Futures", "NFTs"],
    bestFor: "Security & Margin Crypto Traders",
    badges: ["Flawless Security History", "Best Support"],
    pros: [
      "Never suffered a major security breach since founding in 2011",
      "Kraken Pro provides sophisticated order books and TradingView integration",
      "High margin limits up to 5x leverage on 100+ collateral assets",
      "Regular cryptographic Proof-of-Reserves audits"
    ],
    cons: [
      "Standard mobile app has higher fees than Kraken Pro",
      "ACH deposit options can take time to clear for new users",
      "Futures unavailable to US clients due to regulations"
    ],
    keyFeatures: [
      "Kraken Pro terminal with customizable modular layouts",
      "Advanced order types (Stop-loss, Take-profit, Trailing stop)",
      "24/7 human live chat support with swift response times",
      "Cryptographic Merkle tree Proof-of-Reserves verification"
    ],
    websiteUrl: "https://www.kraken.com",
    established: 2011,
    headquarters: "San Francisco, CA, USA",
    regulatedBy: "FinCEN, FCA, AUSTRAC, JFSA"
  },
  {
    id: "tradestation",
    name: "TradeStation",
    logo: "📈",
    tagline: "Professional-grade automated strategy testing and direct-market access execution.",
    category: "Active Trader Brokerage",
    rating: 4.6,
    reviewCount: "95K+",
    minDeposit: "$0",
    tradingFees: "$0 Stocks & ETFs, $0.60 Options",
    marginRate: "6.75% - 11.50%",
    assetClasses: ["Stocks", "ETFs", "Options", "Futures", "Crypto"],
    bestFor: "Quantitative & Automated Strategy Traders",
    badges: ["Best for Strategy Automation", "Direct Market Access"],
    pros: [
      "EasyLanguage® coding environment for non-programmers",
      "Decades of reliable historical tick data for backtesting",
      "Award-winning desktop analytics with Matrix order book",
      "Direct market routing and custom order algorithms"
    ],
    cons: [
      "Platform inactivity fees if minimum balance or trades not met",
      "Steep learning curve for EasyLanguage and desktop setup",
      "Customer service primarily geared toward experienced traders"
    ],
    keyFeatures: [
      "EasyLanguage® automated backtesting engine",
      "TradeStation Matrix 'ladder' for lightning-fast scalping",
      "RadarScreen® real-time scanner tracking 1,000 symbols simultaneously",
      "Direct API integration for C++, Python, and C# developers"
    ],
    websiteUrl: "https://www.tradestation.com",
    established: 1982,
    headquarters: "Plantation, FL, USA",
    regulatedBy: "SEC, FINRA, SIPC"
  }
];

// 2. STOCKS & CRYPTO TICKERS DATABASE
const MARKET_ASSETS = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    category: "Semiconductors & AI",
    type: "stock",
    price: 138.25,
    prevClose: 134.80,
    change: 3.45,
    changePercent: 2.56,
    high: 139.10,
    low: 135.20,
    volume: "58.4M",
    marketCap: "$3.41T",
    peRatio: "62.4",
    dividendYield: "0.03%",
    day52High: 140.76,
    day52Low: 39.23,
    description: "NVIDIA designs graphics processing units (GPUs) and specialized AI chips powering generative AI, autonomous robotics, supercomputers, and modern cloud data centers."
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    category: "Consumer Tech",
    type: "stock",
    price: 231.80,
    prevClose: 229.40,
    change: 2.40,
    changePercent: 1.05,
    high: 232.50,
    low: 228.90,
    volume: "42.1M",
    marketCap: "$3.52T",
    peRatio: "34.8",
    dividendYield: "0.43%",
    day52High: 237.23,
    day52Low: 164.08,
    description: "Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and sells a variety of related digital subscription services (Apple Music, iCloud, AppleCare)."
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    category: "Automotive & Clean Energy",
    type: "stock",
    price: 218.40,
    prevClose: 211.50,
    change: 6.90,
    changePercent: 3.26,
    high: 220.30,
    low: 212.10,
    volume: "64.8M",
    marketCap: "$695B",
    peRatio: "61.2",
    dividendYield: "0.00%",
    day52High: 271.00,
    day52Low: 138.80,
    description: "Tesla designs, develops, manufactures, and sells fully electric vehicles, energy generation and storage systems, and autonomous Full Self-Driving (FSD) software solutions."
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    category: "Enterprise Cloud & AI",
    type: "stock",
    price: 428.15,
    prevClose: 425.20,
    change: 2.95,
    changePercent: 0.69,
    high: 430.00,
    low: 424.80,
    volume: "18.3M",
    marketCap: "$3.18T",
    peRatio: "36.1",
    dividendYield: "0.71%",
    day52High: 468.35,
    day52Low: 326.93,
    description: "Microsoft produces computer software, consumer electronics, personal computers, and enterprise cloud services through Azure and commercial Office 365 copilot tools."
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    category: "E-Commerce & Cloud",
    type: "stock",
    price: 186.75,
    prevClose: 184.20,
    change: 2.55,
    changePercent: 1.38,
    high: 188.10,
    low: 183.90,
    volume: "31.7M",
    marketCap: "$1.95T",
    peRatio: "43.5",
    dividendYield: "0.00%",
    day52High: 201.20,
    day52Low: 118.35,
    description: "Amazon focuses on retail e-commerce, cloud computing infrastructure (AWS), online advertising, digital streaming, and artificial intelligence solutions."
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    category: "Search & Cloud",
    type: "stock",
    price: 165.40,
    prevClose: 167.10,
    change: -1.70,
    changePercent: -1.02,
    high: 167.50,
    low: 164.20,
    volume: "24.6M",
    marketCap: "$2.06T",
    peRatio: "23.9",
    dividendYield: "0.48%",
    day52High: 191.75,
    day52Low: 120.21,
    description: "Alphabet is the parent conglomerate of Google, YouTube, Android, Google Cloud, Waymo self-driving vehicles, and DeepMind AI research laboratories."
  },
  {
    symbol: "BTC-USD",
    name: "Bitcoin",
    category: "Digital Gold / Crypto",
    type: "crypto",
    price: 67850.00,
    prevClose: 65400.00,
    change: 2450.00,
    changePercent: 3.75,
    high: 68420.00,
    low: 65110.00,
    volume: "$34.2B",
    marketCap: "$1.34T",
    peRatio: "N/A",
    dividendYield: "0.00%",
    day52High: 73750.00,
    day52Low: 38500.00,
    description: "Bitcoin is a decentralized digital cryptocurrency without a central bank or single administrator that can be sent peer-to-peer on the proof-of-work blockchain network."
  },
  {
    symbol: "ETH-USD",
    name: "Ethereum",
    category: "Smart Contracts / Crypto",
    type: "crypto",
    price: 2540.80,
    prevClose: 2470.00,
    change: 70.80,
    changePercent: 2.87,
    high: 2580.00,
    low: 2465.00,
    volume: "$16.8B",
    marketCap: "$305B",
    peRatio: "N/A",
    dividendYield: "3.2% (Staking)",
    day52High: 4090.00,
    day52Low: 1520.00,
    description: "Ethereum is a decentralized, open-source blockchain featuring smart contract functionality. Ether is the native cryptocurrency powering decentralized finance (DeFi) and Web3."
  },
  {
    symbol: "SOL-USD",
    name: "Solana",
    category: "Layer 1 Blockchain",
    type: "crypto",
    price: 168.90,
    prevClose: 159.20,
    change: 9.70,
    changePercent: 6.09,
    high: 172.40,
    low: 158.50,
    volume: "$4.1B",
    marketCap: "$79B",
    peRatio: "N/A",
    dividendYield: "6.8% (Staking)",
    day52High: 210.00,
    day52Low: 21.15,
    description: "Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale today, processing thousands of transactions per second at sub-penny fees."
  },
  {
    symbol: "AMD",
    name: "Advanced Micro Devices",
    category: "Semiconductors",
    type: "stock",
    price: 156.40,
    prevClose: 153.10,
    change: 3.30,
    changePercent: 2.16,
    high: 157.90,
    low: 152.80,
    volume: "35.2M",
    marketCap: "$253B",
    peRatio: "115.8",
    dividendYield: "0.00%",
    day52High: 227.30,
    day52Low: 93.12,
    description: "AMD develops computer processors, graphics cards, and related technologies for business and consumer computing, data centers, and Instinct AI accelerators."
  },
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    category: "Index ETF",
    type: "etf",
    price: 582.30,
    prevClose: 579.10,
    change: 3.20,
    changePercent: 0.55,
    high: 583.40,
    low: 578.90,
    volume: "45.0M",
    marketCap: "$560B",
    peRatio: "27.5",
    dividendYield: "1.22%",
    day52High: 585.10,
    day52Low: 409.21,
    description: "The SPDR S&P 500 ETF Trust seeks to provide investment results that correspond generally to the price and yield performance of the S&P 500 Index."
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    category: "Tech Index ETF",
    type: "etf",
    price: 492.60,
    prevClose: 487.40,
    change: 5.20,
    changePercent: 1.07,
    high: 494.10,
    low: 486.80,
    volume: "29.8M",
    marketCap: "$280B",
    peRatio: "31.2",
    dividendYield: "0.58%",
    day52High: 503.50,
    day52Low: 350.20,
    description: "Invesco QQQ is an exchange-traded fund that tracks the Nasdaq-100 Index, holding the 100 largest non-financial innovative companies listed on Nasdaq."
  }
];

// 3. FINANCIAL NEWS & MARKET HEADLINES
const MARKET_NEWS = [
  {
    id: 1,
    title: "Fed Signals Steady Interest Rates Amid Robust Corporate Earnings Expansion",
    source: "Bloomberg Market Desk",
    timeAgo: "14m ago",
    category: "Macro",
    sentiment: "Bullish",
    symbols: ["SPY", "QQQ"],
    summary: "Federal Reserve officials noted persistent economic resilience while inflation measures decelerate toward the 2% target, fueling optimism for extended equity expansion."
  },
  {
    id: 2,
    title: "NVIDIA Next-Gen Blackwell Architecture Achieves Record Hyperscaler Pre-Orders",
    source: "Reuters Tech",
    timeAgo: "32m ago",
    category: "AI & Tech",
    sentiment: "Bullish",
    symbols: ["NVDA", "MSFT", "GOOGL"],
    summary: "Cloud titans Microsoft, Google, and Amazon expand capital expenditure commitments, allocating over $50B in hardware orders for enterprise AI clusters."
  },
  {
    id: 3,
    title: "Bitcoin Surges Past $67,000 as Institutional Spot ETF Inflows Reach Weekly Peak",
    source: "CoinDesk",
    timeAgo: "1h ago",
    category: "Crypto",
    sentiment: "Bullish",
    symbols: ["BTC-USD", "COIN"],
    summary: "US Spot Bitcoin ETFs recorded net daily inflows exceeding $450 million led by BlackRock's IBIT and Fidelity's FBTC funds."
  },
  {
    id: 4,
    title: "Tesla Autonomous Cybercab Unveiling Draws Mixed Analyst Reactions on Timeline",
    source: "Wall Street Journal",
    timeAgo: "2h ago",
    category: "Automotive",
    sentiment: "Neutral",
    symbols: ["TSLA"],
    summary: "Wall Street firms praise vehicle aesthetics and charging efficiency while requesting more concrete regulatory filing timetables for driverless commercial deployment."
  },
  {
    id: 5,
    title: "Global Semiconductor Equipment Demand Rises 18% Quarter-over-Quarter",
    source: "Financial Times",
    timeAgo: "3h ago",
    category: "Semiconductors",
    sentiment: "Bullish",
    symbols: ["AMD", "NVDA"],
    summary: "Surging requirements for high-bandwidth memory (HBM3e) and advanced silicon packaging lift global chip equipment backlogs to multi-year highs."
  },
  {
    id: 6,
    title: "Apple Intelligence Rollout Expands Across European and Asian Territories",
    source: "CNBC International",
    timeAgo: "4h ago",
    category: "Tech",
    sentiment: "Bullish",
    symbols: ["AAPL"],
    summary: "Apple accelerates local language model training, aiming to drive an accelerated iPhone upgrade supercycle into early next year."
  }
];

// 4. HISTORICAL CANDLESTICK GENERATOR
// Generates realistic OHLCV price series for any symbol and timeframe
function generateHistoricalCandles(symbol, basePrice, timeframe = "1D", count = 60) {
  const candles = [];
  let currentClose = basePrice * 0.94; // start slightly lower for an organic trend
  const now = Date.now();

  let timeStep;
  switch (timeframe) {
    case "1D":
      timeStep = 5 * 60 * 1000; // 5 min candles
      break;
    case "1W":
      timeStep = 60 * 60 * 1000; // 1 hour candles
      break;
    case "1M":
      timeStep = 24 * 60 * 60 * 1000; // 1 day candles
      break;
    case "1Y":
      timeStep = 7 * 24 * 60 * 60 * 1000; // 1 week candles
      break;
    default:
      timeStep = 15 * 60 * 1000;
  }

  const volatility = symbol.includes("BTC") || symbol.includes("SOL") ? 0.018 : 0.008;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * timeStep);

    // Brownian motion random walk with slight upward drift
    const randomFactor = (Math.random() - 0.48) * 2; // slight positive bias
    const pctChange = randomFactor * volatility;

    const open = currentClose;
    let close = open * (1 + pctChange);
    if (i === 0) close = basePrice; // anchor latest candle to current price

    const highExtra = Math.random() * (open * volatility * 0.9);
    const lowExtra = Math.random() * (open * volatility * 0.9);

    const high = Math.max(open, close) + highExtra;
    const low = Math.min(open, close) - lowExtra;
    const volume = Math.floor(Math.random() * 85000 + 15000);

    candles.push({
      time: time,
      timestamp: time.getTime(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: volume
    });

    currentClose = close;
  }

  return candles;
}

// 5. PLATFORM MATCHER QUIZ QUESTIONS
const MATCHER_QUIZ = [
  {
    id: 1,
    question: "What is your primary investment or trading focus?",
    subtitle: "Select the asset class you plan to trade most frequently",
    options: [
      { text: "US Stocks & ETFs for long-term growth", value: "stocks_passive", platformId: "fidelity" },
      { text: "Active Stock & Options swing trading", value: "options_active", platformId: "thinkorswim" },
      { text: "Cryptocurrencies & Web3 tokens", value: "crypto_focus", platformId: "binance" },
      { text: "Global multi-asset (International stocks, Forex, Futures)", value: "global_multi", platformId: "ibkr" },
      { text: "Copying successful traders automatically", value: "social_copy", platformId: "etoro" }
    ]
  },
  {
    id: 2,
    question: "How would you describe your trading experience level?",
    subtitle: "This helps us match the interface complexity to your workflow",
    options: [
      { text: "Total Beginner - I want a super clean, simple mobile app", value: "beginner", platformId: "robinhood" },
      { text: "Intermediate - I need technical charts, screeners & paper trading", value: "intermediate", platformId: "webull" },
      { text: "Expert / Quant - I want multi-screen setups, API access & algorithmic tools", value: "pro", platformId: "ibkr" },
      { text: "Visual Chart Analyst - I live in technical indicators & Pine Script", value: "analyst", platformId: "tradingview" }
    ]
  },
  {
    id: 3,
    question: "What is your top priority when choosing a trading platform?",
    subtitle: "Every platform has unique superpowers",
    options: [
      { text: "0% Commission and zero account maintenance fees", value: "zero_fees", platformId: "robinhood" },
      { text: "Lowest margin interest rates to trade on leverage", value: "margin_rates", platformId: "ibkr" },
      { text: "Institutional-grade security and audited proof-of-reserves", value: "security", platformId: "coinbase" },
      { text: "World-class charting tools and live market screeners", value: "charting", platformId: "tradingview" },
      { text: "Free extended hours trading and simulated paper trading", value: "paper_trade", platformId: "webull" }
    ]
  },
  {
    id: 4,
    question: "What device do you plan to trade on primarily?",
    subtitle: "Some platforms shine on mobile while others dominate multi-monitor desktops",
    options: [
      { text: "Mobile phone (iOS / Android app on the go)", value: "mobile", platformId: "robinhood" },
      { text: "Modern Web Browser on Laptop/MacBook", value: "web", platformId: "webull" },
      { text: "Dedicated Multi-Monitor Desktop Software (Windows/Mac)", value: "desktop", platformId: "thinkorswim" }
    ]
  }
];
