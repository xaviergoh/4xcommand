import { Position, Hedge, ResetRequest, AuditEvent, MarketRate, Trade, DirectTradingConfig } from '@/types/treasury';

// G10 Currencies - Default Direct Trading Currencies (includes SGD)
export const G10_CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD', 'SEK', 'NOK', 'SGD'];

// Additional non-G10 currencies for mock data showcase
const ADDITIONAL_CURRENCIES = ['MYR', 'HKD', 'CNH', 'THB', 'IDR', 'KRW', 'MXN'];

// Helper to normalize pair keys (always alphabetical)
export const normalizePair = (base: string, quote: string): string => {
  return [base, quote].sort().join('/');
};

// Initialize default pair configurations
const initializeDefaultPairConfigs = (): Record<string, 'direct' | 'exotic'> => {
  const configs: Record<string, 'direct' | 'exotic'> = {};
  
  // All G10xG10 pairs are 'direct' (now includes SGD)
  for (let i = 0; i < G10_CURRENCIES.length; i++) {
    for (let j = i + 1; j < G10_CURRENCIES.length; j++) {
      const pair = normalizePair(G10_CURRENCIES[i], G10_CURRENCIES[j]);
      configs[pair] = 'direct';
    }
  }
  
  // Any pair involving a non-G10 currency is 'exotic' (requires USD routing)
  for (const g10 of G10_CURRENCIES) {
    for (const nonG10 of ADDITIONAL_CURRENCIES) {
      if (g10 !== 'USD') {
        configs[normalizePair(g10, nonG10)] = 'exotic';
      }
    }
  }
  
  // Non-G10 x Non-G10 pairs are also exotic
  for (let i = 0; i < ADDITIONAL_CURRENCIES.length; i++) {
    for (let j = i + 1; j < ADDITIONAL_CURRENCIES.length; j++) {
      const pair = normalizePair(ADDITIONAL_CURRENCIES[i], ADDITIONAL_CURRENCIES[j]);
      configs[pair] = 'exotic';
    }
  }
  
  return configs;
};

// Direct Trading Configuration
export let directTradingConfig: DirectTradingConfig = {
  id: 'default-config',
  currencies: [...G10_CURRENCIES, ...ADDITIONAL_CURRENCIES],
  hiddenCurrencies: [],
  pairConfigurations: initializeDefaultPairConfigs(),
  lastModifiedBy: 'System',
  lastModifiedAt: new Date().toISOString(),
};

// Helper function to check if a currency pair trades directly
export const isDirectPair = (baseCcy: string, quoteCcy: string): boolean => {
  const pair = normalizePair(baseCcy, quoteCcy);
  return directTradingConfig.pairConfigurations[pair] === 'direct';
};

// Helper to get pair status
export const getPairStatus = (base: string, quote: string): 'direct' | 'exotic' => {
  const pair = normalizePair(base, quote);
  return directTradingConfig.pairConfigurations[pair] || 'exotic';
};

// Helper function to update configuration
export const updateDirectTradingConfig = (
  newCurrencies: string[], 
  newPairConfigs: Record<string, 'direct' | 'exotic'>,
  newHiddenCurrencies: string[],
  user: string
): DirectTradingConfig => {
  const previousConfig = { ...directTradingConfig };
  directTradingConfig = {
    id: directTradingConfig.id,
    currencies: [...newCurrencies],
    hiddenCurrencies: [...newHiddenCurrencies],
    pairConfigurations: { ...newPairConfigs },
    lastModifiedBy: user,
    lastModifiedAt: new Date().toISOString(),
    previousCurrencies: previousConfig.currencies,
  };
  return directTradingConfig;
};

// Helper function to log configuration changes to audit trail
export const logConfigChange = (
  previousCurrencies: string[],
  newCurrencies: string[],
  previousPairConfigs: Record<string, 'direct' | 'exotic'>,
  newPairConfigs: Record<string, 'direct' | 'exotic'>,
  user: string
): AuditEvent => {
  const added = newCurrencies.filter(c => !previousCurrencies.includes(c));
  const removed = previousCurrencies.filter(c => !newCurrencies.includes(c));
  
  // Track pair changes
  const pairsChanged: Array<{ pair: string; from: 'direct' | 'exotic'; to: 'direct' | 'exotic' }> = [];
  const allPairs = new Set([...Object.keys(previousPairConfigs), ...Object.keys(newPairConfigs)]);
  
  allPairs.forEach(pair => {
    const oldStatus = previousPairConfigs[pair];
    const newStatus = newPairConfigs[pair];
    if (oldStatus && newStatus && oldStatus !== newStatus) {
      pairsChanged.push({ pair, from: oldStatus, to: newStatus });
    }
  });
  
  const event: AuditEvent = {
    id: `AUD-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: 'Configuration Change',
    description: 'Direct Trading configuration updated',
    user,
    details: {
      previousCurrencies,
      newCurrencies,
      currenciesAdded: added,
      currenciesRemoved: removed,
      pairsChanged,
      totalPairsModified: pairsChanged.length,
      impactScope: 'Applies to new trades only',
    },
    status: 'Completed',
  };
  
  mockAuditEvents.unshift(event);
  return event;
};

export const mockMarketRates: MarketRate[] = [
  { pair: 'USD/SGD', bid: 1.3420, ask: 1.3425, mid: 1.3422, change: 0.0012, changePercent: 0.09, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/USD', bid: 1.0850, ask: 1.0855, mid: 1.0852, change: -0.0023, changePercent: -0.21, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/USD', bid: 1.2720, ask: 1.2725, mid: 1.2722, change: 0.0045, changePercent: 0.35, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/USD', bid: 0.6580, ask: 0.6585, mid: 0.6582, change: -0.0008, changePercent: -0.12, lastUpdate: new Date().toISOString() },
  { pair: 'USD/JPY', bid: 149.25, ask: 149.30, mid: 149.27, change: 0.35, changePercent: 0.23, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CAD', bid: 1.3580, ask: 1.3585, mid: 1.3582, change: 0.0018, changePercent: 0.13, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CHF', bid: 0.8720, ask: 0.8725, mid: 0.8722, change: -0.0012, changePercent: -0.14, lastUpdate: new Date().toISOString() },
  { pair: 'NZD/USD', bid: 0.5980, ask: 0.5985, mid: 0.5982, change: 0.0015, changePercent: 0.25, lastUpdate: new Date().toISOString() },
  { pair: 'USD/MYR', bid: 4.4625, ask: 4.4675, mid: 4.4650, change: 0.0025, changePercent: 0.06, lastUpdate: new Date().toISOString() },
  { pair: 'USD/HKD', bid: 7.8185, ask: 7.8215, mid: 7.8200, change: -0.0015, changePercent: -0.02, lastUpdate: new Date().toISOString() },
  { pair: 'USD/CNH', bid: 7.2425, ask: 7.2475, mid: 7.2450, change: 0.0050, changePercent: 0.07, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/SGD', bid: 1.4560, ask: 1.4565, mid: 1.4562, change: 0.0015, changePercent: 0.10, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/GBP', bid: 0.8525, ask: 0.8530, mid: 0.8527, change: -0.0008, changePercent: -0.09, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/JPY', bid: 162.05, ask: 162.15, mid: 162.10, change: 0.48, changePercent: 0.30, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/JPY', bid: 190.10, ask: 190.20, mid: 190.15, change: 0.65, changePercent: 0.34, lastUpdate: new Date().toISOString() },
  { pair: 'JPY/SGD', bid: 0.00898, ask: 0.00902, mid: 0.00900, change: 0.00003, changePercent: 0.33, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/SGD', bid: 0.8828, ask: 0.8836, mid: 0.8832, change: -0.0012, changePercent: -0.14, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/SGD', bid: 1.7080, ask: 1.7085, mid: 1.7082, change: 0.0062, changePercent: 0.36, lastUpdate: new Date().toISOString() },
  { pair: 'CAD/SGD', bid: 0.9882, ask: 0.9890, mid: 0.9886, change: 0.0005, changePercent: 0.05, lastUpdate: new Date().toISOString() },
  { pair: 'CHF/SGD', bid: 1.5385, ask: 1.5392, mid: 1.5388, change: 0.0022, changePercent: 0.14, lastUpdate: new Date().toISOString() },
  { pair: 'NZD/SGD', bid: 0.8025, ask: 0.8032, mid: 0.8028, change: -0.0008, changePercent: -0.10, lastUpdate: new Date().toISOString() },
  { pair: 'USD/THB', bid: 35.25, ask: 35.28, mid: 35.265, change: -0.15, changePercent: -0.42, lastUpdate: new Date().toISOString() },
  { pair: 'USD/IDR', bid: 15780, ask: 15790, mid: 15785, change: 20, changePercent: 0.13, lastUpdate: new Date().toISOString() },
  { pair: 'USD/KRW', bid: 1325, ask: 1327, mid: 1326, change: -5, changePercent: -0.38, lastUpdate: new Date().toISOString() },
  { pair: 'USD/MXN', bid: 17.15, ask: 17.18, mid: 17.165, change: 0.12, changePercent: 0.70, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/MYR', bid: 4.84, ask: 4.85, mid: 4.845, change: 0.02, changePercent: 0.41, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/THB', bid: 44.85, ask: 44.92, mid: 44.885, change: 0.18, changePercent: 0.40, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/IDR', bid: 10385, ask: 10395, mid: 10390, change: -35, changePercent: -0.34, lastUpdate: new Date().toISOString() },
  { pair: 'JPY/KRW', bid: 8.88, ask: 8.90, mid: 8.89, change: 0.02, changePercent: 0.23, lastUpdate: new Date().toISOString() },
  { pair: 'CAD/MXN', bid: 12.64, ask: 12.66, mid: 12.65, change: 0.08, changePercent: 0.63, lastUpdate: new Date().toISOString() },
];

// ============================================================================
// EXOTIC PAIR DECOMPOSITION LOGIC:
// When a customer trades a non-USD pair (e.g., JPY/SGD):
// 1. Break down into two USD legs
// 2. First leg: Convert base currency to/from USD
// 3. Second leg: Convert USD to/from quote currency
// 4. This creates positions in BOTH currencies
// 5. The intermediate USD exposure is reflected in both legs
// ============================================================================

export const mockPositions: Position[] = [
  {
    id: 'POS-0001',
    currency: 'SGD',
    liquidityProvider: 'Citibank',
    netPosition: 1800000,
    currentRate: 1.3422,
    mtmValue: 1341000,
    unrealizedPnL: 8200,
    realizedPnL: 4100,
    status: 'Open',
    trades: [
      // Standard USD/SGD trade
      {
        id: 'TRD-0001',
        tradeDate: new Date(Date.now() - 86400000).toISOString(),
        customerOrder: 'CUST-001',
        originalPair: 'USD/SGD',
        originalAmount: 1500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/SGD', buy_amount: 1500000, sell_amount: 0, usd_position: 1500000, local_position: 1500000, rate: 1.3400, legType: 'Buy Leg' }
        ]
      },
      // GBP/SGD - Direct pair (G10xG10) - kept as example
      {
        id: 'TRD-0010',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-061',
        originalPair: 'GBP/SGD',
        originalAmount: 300000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/SGD', buy_amount: 300000, sell_amount: 0, usd_position: 0, local_position: 300000, rate: 1.7082, legType: 'Buy Leg' }
        ]
      },
      // CNH/SGD - Exotic pair (non-G10 requires USD routing)
      {
        id: 'TRD-0011',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: 554866,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell CNH, buy SGD via USD',
        netUsdExposure: 0,
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' },
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0002',
    currency: 'EUR',
    liquidityProvider: 'HSBC',
    netPosition: -1950000,
    currentRate: 1.0852,
    mtmValue: -2116140,
    unrealizedPnL: 6800,
    realizedPnL: -1800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0003',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-012',
        originalPair: 'EUR/USD',
        originalAmount: -1800000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/USD', buy_amount: 0, sell_amount: 1800000, usd_position: -1965600, local_position: -1800000, rate: 1.0920, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0013',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-095',
        originalPair: 'EUR/JPY',
        originalAmount: -500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/JPY', buy_amount: 0, sell_amount: 500000, usd_position: 0, local_position: -500000, rate: 161.80, legType: 'Sell Leg' }
        ]
      },
      // EUR/MYR - Exotic pair (EUR x non-G10)
      {
        id: 'TRD-0028',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-089',
        originalPair: 'EUR/MYR',
        originalAmount: 850000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy EUR, sell MYR via USD',
        netUsdExposure: 15200,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 0, sell_amount: 4100000, usd_position: 918367, local_position: -4100000, rate: 4.4650, legType: 'Buy Leg' },
          { pair: 'USD/EUR', buy_amount: 850000, sell_amount: 0, usd_position: -903167, local_position: 850000, rate: 1.0622, legType: 'Sell Leg' }
        ]
      },
      // EUR/MYR - Exotic pair #2
      {
        id: 'TRD-0029',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-091',
        originalPair: 'EUR/MYR',
        originalAmount: -1500000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell EUR, buy MYR via USD',
        netUsdExposure: -8500,
        usdLegs: [
          { pair: 'USD/EUR', buy_amount: 0, sell_amount: 1500000, usd_position: 1593300, local_position: -1500000, rate: 1.0622, legType: 'Buy Leg' },
          { pair: 'USD/MYR', buy_amount: 7250000, sell_amount: 0, usd_position: -1601800, local_position: 7250000, rate: 4.5250, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0003',
    currency: 'GBP',
    liquidityProvider: 'Standard Chartered',
    netPosition: 1500000,
    currentRate: 1.2722,
    mtmValue: 1908300,
    unrealizedPnL: 7200,
    realizedPnL: 3800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0004',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-018',
        originalPair: 'GBP/USD',
        originalAmount: 1200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/USD', buy_amount: 1200000, sell_amount: 0, usd_position: 1518000, local_position: 1200000, rate: 1.2650, legType: 'Buy Leg' }
        ]
      },
      // GBP/SGD cross-currency trade (also in SGD position)
      {
        id: 'TRD-0010',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-061',
        originalPair: 'GBP/SGD',
        originalAmount: -300000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'GBP/SGD', buy_amount: 0, sell_amount: 300000, usd_position: 0, local_position: -300000, rate: 1.7082, legType: 'Sell Leg' }
        ]
      },
      // GBP/THB - Exotic pair (GBP x non-G10)
      {
        id: 'TRD-0030',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-117',
        originalPair: 'GBP/THB',
        originalAmount: 600000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy GBP, sell THB via USD',
        netUsdExposure: 4800,
        usdLegs: [
          { pair: 'USD/THB', buy_amount: 0, sell_amount: 27000000, usd_position: 765306, local_position: -27000000, rate: 35.28, legType: 'Buy Leg' },
          { pair: 'USD/GBP', buy_amount: 600000, sell_amount: 0, usd_position: -760506, local_position: 600000, rate: 1.2675, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0004',
    currency: 'AUD',
    liquidityProvider: 'DBS',
    netPosition: -1100000,
    currentRate: 0.6582,
    mtmValue: -724020,
    unrealizedPnL: 2100,
    realizedPnL: -950,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0005',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-024',
        originalPair: 'AUD/USD',
        originalAmount: -950000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'AUD/USD', buy_amount: 0, sell_amount: 950000, usd_position: -628900, local_position: -950000, rate: 0.6620, legType: 'Sell Leg' }
        ]
      },
      // AUD/IDR - Exotic pair (AUD x non-G10)
      {
        id: 'TRD-0031',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-135',
        originalPair: 'AUD/IDR',
        originalAmount: -150000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell AUD, buy IDR via USD',
        netUsdExposure: -850,
        usdLegs: [
          { pair: 'USD/AUD', buy_amount: 0, sell_amount: 150000, usd_position: 98850, local_position: -150000, rate: 1.5186, legType: 'Buy Leg' },
          { pair: 'USD/IDR', buy_amount: 1550000000, sell_amount: 0, usd_position: -99700, local_position: 1550000000, rate: 15550, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0005',
    currency: 'JPY',
    liquidityProvider: 'UOB',
    netPosition: 9900000,
    currentRate: 149.27,
    mtmValue: 66315,
    unrealizedPnL: -3200,
    realizedPnL: 2800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0006',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-031',
        originalPair: 'USD/JPY',
        originalAmount: 3200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 3200000, sell_amount: 0, usd_position: 21505, local_position: 3200000, rate: 148.80, legType: 'Buy Leg' }
        ]
      },
      // EUR/JPY cross-currency trade (also in EUR position)
      {
        id: 'TRD-0013',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-095',
        originalPair: 'EUR/JPY',
        originalAmount: 80900000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'EUR/JPY', buy_amount: 80900000, sell_amount: 0, usd_position: 0, local_position: 80900000, rate: 161.80, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0015',
        tradeDate: new Date(Date.now() - 950400000).toISOString(),
        customerOrder: 'CUST-118',
        originalPair: 'USD/JPY',
        originalAmount: 52500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 52500000, sell_amount: 0, usd_position: 353535, local_position: 52500000, rate: 148.50, legType: 'Buy Leg' }
        ]
      },
      // JPY/KRW - Exotic pair (JPY x non-G10)
      {
        id: 'TRD-0032',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-158',
        originalPair: 'JPY/KRW',
        originalAmount: -126300000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell JPY, buy KRW via USD',
        netUsdExposure: -1200,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 0, sell_amount: 126300000, usd_position: 847458, local_position: -126300000, rate: 149.00, legType: 'Buy Leg' },
          { pair: 'USD/KRW', buy_amount: 1120000000, sell_amount: 0, usd_position: -848658, local_position: 1120000000, rate: 1320, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0006',
    currency: 'MYR',
    liquidityProvider: 'Citibank',
    netPosition: 15850000,
    currentRate: 4.4650,
    mtmValue: 3549944,
    unrealizedPnL: 12400,
    realizedPnL: 5800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: 4500000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0016',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-126',
        originalPair: 'USD/MYR',
        originalAmount: 2500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2500000, sell_amount: 0, usd_position: 562838, local_position: 2500000, rate: 4.4400, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0017',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'MYR/HKD',
        originalAmount: 2200000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      // EUR/MYR exotic trade leg (from EUR position)
      {
        id: 'TRD-0028',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-089',
        originalPair: 'EUR/MYR',
        originalAmount: -4100000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy EUR, sell MYR via USD',
        netUsdExposure: 15200,
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 0, sell_amount: 4100000, usd_position: 918367, local_position: -4100000, rate: 4.4650, legType: 'Buy Leg' },
          { pair: 'USD/EUR', buy_amount: 850000, sell_amount: 0, usd_position: -903167, local_position: 850000, rate: 1.0622, legType: 'Sell Leg' }
        ]
      },
      // EUR/MYR exotic trade #2 leg (from EUR position)
      {
        id: 'TRD-0029',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-091',
        originalPair: 'EUR/MYR',
        originalAmount: 7250000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell EUR, buy MYR via USD',
        netUsdExposure: -8500,
        usdLegs: [
          { pair: 'USD/EUR', buy_amount: 0, sell_amount: 1500000, usd_position: 1593300, local_position: -1500000, rate: 1.0622, legType: 'Buy Leg' },
          { pair: 'USD/MYR', buy_amount: 7250000, sell_amount: 0, usd_position: -1601800, local_position: 7250000, rate: 4.5250, legType: 'Sell Leg' }
        ]
      },
      // GBP/THB exotic trade leg - creates MYR exposure indirectly
      {
        id: 'TRD-0033',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-175',
        originalPair: 'GBP/THB',
        originalAmount: 3500000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell GBP, buy THB via USD',
        netUsdExposure: -2400,
        usdLegs: [
          { pair: 'USD/GBP', buy_amount: 0, sell_amount: 800000, usd_position: 1014000, local_position: -800000, rate: 1.2675, legType: 'Buy Leg' },
          { pair: 'USD/THB', buy_amount: 35700000, sell_amount: 0, usd_position: -1016400, local_position: 35700000, rate: 35.12, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0007',
    currency: 'CNH',
    liquidityProvider: 'HSBC',
    netPosition: -5200000,
    currentRate: 7.2450,
    mtmValue: -717838,
    unrealizedPnL: -3800,
    realizedPnL: 1900,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0011',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'CNH/SGD',
        originalAmount: -3000000, // Selling 3M CNH
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell CNH, buy SGD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' },
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0018',
        tradeDate: new Date(Date.now() - 1209600000).toISOString(),
        customerOrder: 'CUST-145',
        originalPair: 'USD/CNH',
        originalAmount: -2200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 2200000, usd_position: -304709, local_position: -2200000, rate: 7.2200, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0008',
    currency: 'CAD',
    liquidityProvider: 'RBC',
    netPosition: 2000000,
    currentRate: 1.3582,
    mtmValue: 1472460,
    unrealizedPnL: 5500,
    realizedPnL: 2700,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0019',
        tradeDate: new Date(Date.now() - 1296000000).toISOString(),
        customerOrder: 'CUST-152',
        originalPair: 'USD/CAD',
        originalAmount: 1500000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CAD', buy_amount: 1500000, sell_amount: 0, usd_position: 1106940, local_position: 1500000, rate: 1.3550, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0021',
        tradeDate: new Date(Date.now() - 1468800000).toISOString(),
        customerOrder: 'CUST-179',
        originalPair: 'USD/CAD',
        originalAmount: -200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CAD', buy_amount: 0, sell_amount: 200000, usd_position: -147059, local_position: -200000, rate: 1.3600, legType: 'Sell Leg' }
        ]
      },
      // CAD/MXN - Exotic pair (CAD x non-G10)
      {
        id: 'TRD-0034',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-192',
        originalPair: 'CAD/MXN',
        originalAmount: 700000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy CAD, sell MXN via USD',
        netUsdExposure: 3200,
        usdLegs: [
          { pair: 'USD/MXN', buy_amount: 0, sell_amount: 8900000, usd_position: 518605, local_position: -8900000, rate: 17.16, legType: 'Buy Leg' },
          { pair: 'USD/CAD', buy_amount: 700000, sell_amount: 0, usd_position: -515405, local_position: 700000, rate: 1.3585, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0009',
    currency: 'CHF',
    liquidityProvider: 'UBS',
    netPosition: -600000,
    currentRate: 0.8722,
    mtmValue: -688020,
    unrealizedPnL: 2800,
    realizedPnL: -1500,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0022',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-187',
        originalPair: 'USD/CHF',
        originalAmount: -600000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/CHF', buy_amount: 0, sell_amount: 600000, usd_position: -685714, local_position: -600000, rate: 0.8750, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0010',
    currency: 'NZD',
    liquidityProvider: 'ANZ',
    netPosition: 580000,
    currentRate: 0.5982,
    mtmValue: 346956,
    unrealizedPnL: 3200,
    realizedPnL: 1800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0024',
        tradeDate: new Date(Date.now() - 1728000000).toISOString(),
        customerOrder: 'CUST-215',
        originalPair: 'NZD/USD',
        originalAmount: 1200000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/USD', buy_amount: 1200000, sell_amount: 0, usd_position: 714000, local_position: 1200000, rate: 0.5950, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0026',
        tradeDate: new Date(Date.now() - 1900800000).toISOString(),
        customerOrder: 'CUST-241',
        originalPair: 'NZD/USD',
        originalAmount: -620000,
        isExoticPair: false,
        usdLegs: [
          { pair: 'NZD/USD', buy_amount: 0, sell_amount: 620000, usd_position: -372000, local_position: -620000, rate: 0.6000, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0011',
    currency: 'HKD',
    liquidityProvider: 'Bank of China HK',
    netPosition: -12500000,
    currentRate: 7.8200,
    mtmValue: -1598465,
    unrealizedPnL: -6200,
    realizedPnL: 3100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: -7910026, // Selling 7.91M HKD
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0017',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'MYR/HKD',
        originalAmount: -3866467, // Selling 3.87M HKD
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy MYR, sell HKD via USD',
        netUsdExposure: 0, // Net USD exposure is near zero after both legs
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' },
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0027',
        tradeDate: new Date(Date.now() - 1987200000).toISOString(),
        customerOrder: 'CUST-256',
        originalPair: 'USD/HKD',
        originalAmount: -723507,
        isExoticPair: false,
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 723507, usd_position: 92649, local_position: -723507, rate: 7.8100, legType: 'Buy Leg' }
        ]
      }
    ]
  },
  // New non-G10 currency positions
  {
    id: 'POS-0012',
    currency: 'THB',
    liquidityProvider: 'Bangkok Bank',
    netPosition: -62700000,
    currentRate: 35.265,
    mtmValue: -1778009,
    unrealizedPnL: -2800,
    realizedPnL: 1400,
    status: 'Open',
    trades: [
      // GBP/THB exotic trade leg
      {
        id: 'TRD-0030',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-117',
        originalPair: 'GBP/THB',
        originalAmount: -27000000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy GBP, sell THB via USD',
        netUsdExposure: 4800,
        usdLegs: [
          { pair: 'USD/THB', buy_amount: 0, sell_amount: 27000000, usd_position: 765306, local_position: -27000000, rate: 35.28, legType: 'Buy Leg' },
          { pair: 'USD/GBP', buy_amount: 600000, sell_amount: 0, usd_position: -760506, local_position: 600000, rate: 1.2675, legType: 'Sell Leg' }
        ]
      },
      // GBP/THB exotic trade #2 leg
      {
        id: 'TRD-0033',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-175',
        originalPair: 'GBP/THB',
        originalAmount: -35700000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell GBP, buy THB via USD',
        netUsdExposure: -2400,
        usdLegs: [
          { pair: 'USD/GBP', buy_amount: 0, sell_amount: 800000, usd_position: 1014000, local_position: -800000, rate: 1.2675, legType: 'Buy Leg' },
          { pair: 'USD/THB', buy_amount: 35700000, sell_amount: 0, usd_position: -1016400, local_position: 35700000, rate: 35.12, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0013',
    currency: 'IDR',
    liquidityProvider: 'Bank Mandiri',
    netPosition: 1550000000,
    currentRate: 15785,
    mtmValue: 98197,
    unrealizedPnL: -1200,
    realizedPnL: 800,
    status: 'Open',
    trades: [
      // AUD/IDR exotic trade leg
      {
        id: 'TRD-0031',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-135',
        originalPair: 'AUD/IDR',
        originalAmount: 1550000000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell AUD, buy IDR via USD',
        netUsdExposure: -850,
        usdLegs: [
          { pair: 'USD/AUD', buy_amount: 0, sell_amount: 150000, usd_position: 98850, local_position: -150000, rate: 1.5186, legType: 'Buy Leg' },
          { pair: 'USD/IDR', buy_amount: 1550000000, sell_amount: 0, usd_position: -99700, local_position: 1550000000, rate: 15550, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0014',
    currency: 'KRW',
    liquidityProvider: 'KB Kookmin Bank',
    netPosition: 1120000000,
    currentRate: 1326,
    mtmValue: 844538,
    unrealizedPnL: -1800,
    realizedPnL: 950,
    status: 'Open',
    trades: [
      // JPY/KRW exotic trade leg
      {
        id: 'TRD-0032',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-158',
        originalPair: 'JPY/KRW',
        originalAmount: 1120000000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Sell JPY, buy KRW via USD',
        netUsdExposure: -1200,
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 0, sell_amount: 126300000, usd_position: 847458, local_position: -126300000, rate: 149.00, legType: 'Buy Leg' },
          { pair: 'USD/KRW', buy_amount: 1120000000, sell_amount: 0, usd_position: -848658, local_position: 1120000000, rate: 1320, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  {
    id: 'POS-0015',
    currency: 'MXN',
    liquidityProvider: 'BBVA Mexico',
    netPosition: -8900000,
    currentRate: 17.165,
    mtmValue: -518450,
    unrealizedPnL: -950,
    realizedPnL: 600,
    status: 'Open',
    trades: [
      // CAD/MXN exotic trade leg
      {
        id: 'TRD-0034',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-192',
        originalPair: 'CAD/MXN',
        originalAmount: -8900000,
        isExoticPair: true,
        decompositionReason: 'Exotic pair - USD routing required. Buy CAD, sell MXN via USD',
        netUsdExposure: 3200,
        usdLegs: [
          { pair: 'USD/MXN', buy_amount: 0, sell_amount: 8900000, usd_position: 518605, local_position: -8900000, rate: 17.16, legType: 'Buy Leg' },
          { pair: 'USD/CAD', buy_amount: 700000, sell_amount: 0, usd_position: -515405, local_position: 700000, rate: 1.3585, legType: 'Sell Leg' }
        ]
      }
    ]
  },
  // USD Position - Aggregates all exotic trade USD legs
  {
    id: 'POS-USD',
    currency: 'USD',
    liquidityProvider: 'Multiple',
    netPosition: 0,
    currentRate: 1.0000,
    mtmValue: 0,
    unrealizedPnL: 0,
    realizedPnL: 0,
    status: 'Open',
    trades: [
      // USD legs from TRD-0007 (MYR/HKD)
      {
        id: 'TRD-0007-USDMYR',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'USD/MYR',
        originalAmount: -1011236,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0007). Buying 4.5M MYR requires selling USD.',
        parentTradeId: 'TRD-0007',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 4500000, sell_amount: 0, usd_position: -1011236, local_position: 4500000, rate: 4.4500, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0007-USDHKD',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'USD/HKD',
        originalAmount: 1011236,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0007). Selling 7.91M HKD generates USD.',
        parentTradeId: 'TRD-0007',
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 7910026, usd_position: 1011236, local_position: -7910026, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      // USD legs from TRD-0011 (CNH/SGD)
      {
        id: 'TRD-0011-USDCNH',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'USD/CNH',
        originalAmount: 414079,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CNH/SGD (TRD-0011). Selling 3M CNH generates USD.',
        parentTradeId: 'TRD-0011',
        usdLegs: [
          { pair: 'USD/CNH', buy_amount: 0, sell_amount: 3000000, usd_position: 414079, local_position: -3000000, rate: 7.2450, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0011-USDSGD',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-073',
        originalPair: 'USD/SGD',
        originalAmount: -414079,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CNH/SGD (TRD-0011). Buying 554,866 SGD requires selling USD.',
        parentTradeId: 'TRD-0011',
        usdLegs: [
          { pair: 'USD/SGD', buy_amount: 554866, sell_amount: 0, usd_position: -414079, local_position: 554866, rate: 1.3400, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0017 (MYR/HKD)
      {
        id: 'TRD-0017-USDMYR',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'USD/MYR',
        originalAmount: -494382,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0017). Buying 2.2M MYR requires selling USD.',
        parentTradeId: 'TRD-0017',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 2200000, sell_amount: 0, usd_position: -494382, local_position: 2200000, rate: 4.4500, legType: 'Sell Leg' }
        ]
      },
      {
        id: 'TRD-0017-USDHKD',
        tradeDate: new Date(Date.now() - 1123200000).toISOString(),
        customerOrder: 'CUST-134',
        originalPair: 'USD/HKD',
        originalAmount: 494382,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade MYR/HKD (TRD-0017). Selling 3.87M HKD generates USD.',
        parentTradeId: 'TRD-0017',
        usdLegs: [
          { pair: 'USD/HKD', buy_amount: 0, sell_amount: 3866467, usd_position: 494382, local_position: -3866467, rate: 7.8200, legType: 'Buy Leg' }
        ]
      },
      // USD legs from TRD-0028 (EUR/MYR)
      {
        id: 'TRD-0028-USDMYR',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-089',
        originalPair: 'USD/MYR',
        originalAmount: 918367,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade EUR/MYR (TRD-0028). Selling 4.1M MYR generates USD.',
        parentTradeId: 'TRD-0028',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 0, sell_amount: 4100000, usd_position: 918367, local_position: -4100000, rate: 4.4650, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0028-USDEUR',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-089',
        originalPair: 'USD/EUR',
        originalAmount: -903167,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade EUR/MYR (TRD-0028). Buying 850K EUR requires selling USD.',
        parentTradeId: 'TRD-0028',
        usdLegs: [
          { pair: 'USD/EUR', buy_amount: 850000, sell_amount: 0, usd_position: -903167, local_position: 850000, rate: 1.0622, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0029 (EUR/MYR)
      {
        id: 'TRD-0029-USDEUR',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-091',
        originalPair: 'USD/EUR',
        originalAmount: 1593300,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade EUR/MYR (TRD-0029). Selling 1.5M EUR generates USD.',
        parentTradeId: 'TRD-0029',
        usdLegs: [
          { pair: 'USD/EUR', buy_amount: 0, sell_amount: 1500000, usd_position: 1593300, local_position: -1500000, rate: 1.0622, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0029-USDMYR',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-091',
        originalPair: 'USD/MYR',
        originalAmount: -1601800,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade EUR/MYR (TRD-0029). Buying 7.25M MYR requires selling USD.',
        parentTradeId: 'TRD-0029',
        usdLegs: [
          { pair: 'USD/MYR', buy_amount: 7250000, sell_amount: 0, usd_position: -1601800, local_position: 7250000, rate: 4.5250, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0030 (GBP/THB)
      {
        id: 'TRD-0030-USDTHB',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-117',
        originalPair: 'USD/THB',
        originalAmount: 765306,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade GBP/THB (TRD-0030). Selling 27M THB generates USD.',
        parentTradeId: 'TRD-0030',
        usdLegs: [
          { pair: 'USD/THB', buy_amount: 0, sell_amount: 27000000, usd_position: 765306, local_position: -27000000, rate: 35.28, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0030-USDGBP',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-117',
        originalPair: 'USD/GBP',
        originalAmount: -760506,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade GBP/THB (TRD-0030). Buying 600K GBP requires selling USD.',
        parentTradeId: 'TRD-0030',
        usdLegs: [
          { pair: 'USD/GBP', buy_amount: 600000, sell_amount: 0, usd_position: -760506, local_position: 600000, rate: 1.2675, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0031 (AUD/IDR)
      {
        id: 'TRD-0031-USDAUD',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-135',
        originalPair: 'USD/AUD',
        originalAmount: 98850,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade AUD/IDR (TRD-0031). Selling 150K AUD generates USD.',
        parentTradeId: 'TRD-0031',
        usdLegs: [
          { pair: 'USD/AUD', buy_amount: 0, sell_amount: 150000, usd_position: 98850, local_position: -150000, rate: 1.5186, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0031-USDIDR',
        tradeDate: new Date(Date.now() - 691200000).toISOString(),
        customerOrder: 'CUST-135',
        originalPair: 'USD/IDR',
        originalAmount: -99700,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade AUD/IDR (TRD-0031). Buying 1.55B IDR requires selling USD.',
        parentTradeId: 'TRD-0031',
        usdLegs: [
          { pair: 'USD/IDR', buy_amount: 1550000000, sell_amount: 0, usd_position: -99700, local_position: 1550000000, rate: 15550, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0032 (JPY/KRW)
      {
        id: 'TRD-0032-USDJPY',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-158',
        originalPair: 'USD/JPY',
        originalAmount: 847458,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade JPY/KRW (TRD-0032). Selling 126.3M JPY generates USD.',
        parentTradeId: 'TRD-0032',
        usdLegs: [
          { pair: 'USD/JPY', buy_amount: 0, sell_amount: 126300000, usd_position: 847458, local_position: -126300000, rate: 149.00, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0032-USDKRW',
        tradeDate: new Date(Date.now() - 1036800000).toISOString(),
        customerOrder: 'CUST-158',
        originalPair: 'USD/KRW',
        originalAmount: -848658,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade JPY/KRW (TRD-0032). Buying 1.12B KRW requires selling USD.',
        parentTradeId: 'TRD-0032',
        usdLegs: [
          { pair: 'USD/KRW', buy_amount: 1120000000, sell_amount: 0, usd_position: -848658, local_position: 1120000000, rate: 1320, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0033 (GBP/THB)
      {
        id: 'TRD-0033-USDGBP',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-175',
        originalPair: 'USD/GBP',
        originalAmount: 1014000,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade GBP/THB (TRD-0033). Selling 800K GBP generates USD.',
        parentTradeId: 'TRD-0033',
        usdLegs: [
          { pair: 'USD/GBP', buy_amount: 0, sell_amount: 800000, usd_position: 1014000, local_position: -800000, rate: 1.2675, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0033-USDTHB',
        tradeDate: new Date(Date.now() - 777600000).toISOString(),
        customerOrder: 'CUST-175',
        originalPair: 'USD/THB',
        originalAmount: -1016400,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade GBP/THB (TRD-0033). Buying 35.7M THB requires selling USD.',
        parentTradeId: 'TRD-0033',
        usdLegs: [
          { pair: 'USD/THB', buy_amount: 35700000, sell_amount: 0, usd_position: -1016400, local_position: 35700000, rate: 35.12, legType: 'Sell Leg' }
        ]
      },
      // USD legs from TRD-0034 (CAD/MXN)
      {
        id: 'TRD-0034-USDMXN',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-192',
        originalPair: 'USD/MXN',
        originalAmount: 518605,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CAD/MXN (TRD-0034). Selling 8.9M MXN generates USD.',
        parentTradeId: 'TRD-0034',
        usdLegs: [
          { pair: 'USD/MXN', buy_amount: 0, sell_amount: 8900000, usd_position: 518605, local_position: -8900000, rate: 17.16, legType: 'Buy Leg' }
        ]
      },
      {
        id: 'TRD-0034-USDCAD',
        tradeDate: new Date(Date.now() - 1555200000).toISOString(),
        customerOrder: 'CUST-192',
        originalPair: 'USD/CAD',
        originalAmount: -515405,
        isExoticPair: false,
        decompositionReason: 'USD leg from exotic trade CAD/MXN (TRD-0034). Buying 700K CAD requires selling USD.',
        parentTradeId: 'TRD-0034',
        usdLegs: [
          { pair: 'USD/CAD', buy_amount: 700000, sell_amount: 0, usd_position: -515405, local_position: 700000, rate: 1.3585, legType: 'Sell Leg' }
        ]
      }
    ]
  }
];

export const mockHedges: Hedge[] = [
  {
    id: 'HDG-0001',
    currencyPair: 'USD/SGD',
    type: 'Forward',
    amount: 500000,
    rate: 1.3400,
    liquidityProvider: 'Citibank',
    externalReference: 'FWD-2024-001',
    status: 'Fully Matched',
    requiresDualAuth: false,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'HDG-0002',
    currencyPair: 'EUR/USD',
    type: 'Spot',
    amount: 2000000,
    rate: 1.0880,
    liquidityProvider: 'HSBC',
    externalReference: 'SPOT-2024-042',
    status: 'Pending',
    requiresDualAuth: true,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'HDG-0003',
    currencyPair: 'GBP/USD',
    type: 'NDF',
    amount: 750000,
    rate: 1.2700,
    liquidityProvider: 'Standard Chartered',
    externalReference: 'NDF-2024-018',
    status: 'Partially Matched',
    requiresDualAuth: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const mockResetRequests: ResetRequest[] = [
  {
    id: 'RST-0001',
    positionId: 'POS-0001',
    currentPosition: 2500000,
    targetPosition: 2300000,
    reason: 'Cancelled Deal Correction',
    justification: 'Customer cancelled spot deal worth USD 200,000 due to documentation issues. Need to reverse the position impact to maintain accurate treasury records.',
    status: 'First Approved',
    requestedBy: 'john.trader@company.com',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
    approvals: [
      {
        level: 1,
        approver: 'sarah.manager@company.com',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        comments: 'Verified cancellation documentation. Approved for CFO review.',
      },
    ],
  },
  {
    id: 'RST-0002',
    positionId: 'POS-0003',
    currentPosition: 1200000,
    targetPosition: 1500000,
    reason: 'System Error Correction',
    justification: 'Identified system error in position calculation from last week. Three forward contracts totaling GBP 300,000 were not properly recorded in the system. IT has confirmed the root cause and implemented a fix.',
    status: 'Pending',
    requestedBy: 'mike.ops@company.com',
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    approvals: [],
  },
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 'AUD-0000',
    timestamp: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    eventType: 'Configuration Change',
    description: 'Updated Direct Trading Configuration: Added SGD to G10 currencies and configured MYR, HKD, CNH pairs',
    user: 'system@4xcommand.com',
    details: {
      currenciesAdded: ['SGD', 'MYR', 'HKD', 'CNH'],
      pairsConfigured: {
        'EUR/SGD': 'direct',
        'JPY/SGD': 'direct',
        'AUD/SGD': 'direct',
        'GBP/SGD': 'direct',
        'MYR/HKD': 'exotic',
        'CNH/SGD': 'exotic'
      },
      rationale: 'SGD elevated to G10 status for direct trading. Regional currencies MYR, HKD, CNH added for Asia-Pacific market coverage.'
    },
    status: 'Completed',
  },
  {
    id: 'AUD-0001',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    eventType: 'Hedge Entry',
    description: 'Manual hedge entry submitted for approval',
    user: 'john.trader@company.com',
    details: { hedgeId: 'HDG-0002', amount: 2000000, pair: 'EUR/USD' },
    status: 'Pending',
  },
  {
    id: 'AUD-0002',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
    eventType: 'Approval',
    description: 'First level approval for position reset',
    user: 'sarah.manager@company.com',
    details: { resetId: 'RST-0001', level: 1 },
    status: 'Approved',
  },
  {
    id: 'AUD-0003',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    eventType: 'Hedge Entry',
    description: 'Forward hedge executed and matched',
    user: 'john.trader@company.com',
    details: { hedgeId: 'HDG-0001', amount: 500000, pair: 'USD/SGD' },
    status: 'Completed',
  },
  {
    id: 'AUD-0004',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    eventType: 'Rate Update',
    description: 'Market rates updated from Reuters feed',
    user: 'system',
    details: { pairs: 7, source: 'Reuters' },
    status: 'Completed',
  },
];
