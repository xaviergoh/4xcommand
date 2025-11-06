import { Position, Hedge, ResetRequest, AuditEvent, MarketRate, Trade } from '@/types/treasury';

export const mockMarketRates: MarketRate[] = [
  { pair: 'USD/SGD', bid: 1.3420, ask: 1.3425, mid: 1.3422, change: 0.0012, changePercent: 0.09, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/USD', bid: 1.0850, ask: 1.0855, mid: 1.0852, change: -0.0023, changePercent: -0.21, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/USD', bid: 1.2720, ask: 1.2725, mid: 1.2722, change: 0.0045, changePercent: 0.35, lastUpdate: new Date().toISOString() },
  { pair: 'AUD/USD', bid: 0.6580, ask: 0.6585, mid: 0.6582, change: -0.0008, changePercent: -0.12, lastUpdate: new Date().toISOString() },
  { pair: 'USD/JPY', bid: 149.25, ask: 149.30, mid: 149.27, change: 0.35, changePercent: 0.23, lastUpdate: new Date().toISOString() },
  { pair: 'EUR/SGD', bid: 1.4560, ask: 1.4565, mid: 1.4562, change: 0.0015, changePercent: 0.10, lastUpdate: new Date().toISOString() },
  { pair: 'GBP/SGD', bid: 1.7080, ask: 1.7085, mid: 1.7082, change: 0.0062, changePercent: 0.36, lastUpdate: new Date().toISOString() },
];

export const mockPositions: Position[] = [
  {
    id: 'POS-0001',
    currency: 'SGD',
    liquidityProvider: 'Citibank',
    netPosition: 2500000,
    currentRate: 1.3422,
    mtmValue: 1862335,
    unrealizedPnL: 10500,
    realizedPnL: 5200,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0001',
        tradeDate: new Date(Date.now() - 86400000).toISOString(),
        customerOrder: 'CUST-001',
        originalPair: 'USD/SGD',
        originalAmount: 1500000,
        usdLegs: [
          { pair: 'USDSGD', amount: 1500000, rate: 1.3400, usdEquivalent: 1500000 }
        ]
      },
      {
        id: 'TRD-0002',
        tradeDate: new Date(Date.now() - 172800000).toISOString(),
        customerOrder: 'CUST-005',
        originalPair: 'EUR/SGD',
        originalAmount: 1000000,
        usdLegs: [
          { pair: 'EURUSD', amount: 1000000, rate: 1.0850, usdEquivalent: 1085000 },
          { pair: 'USDSGD', amount: 1085000, rate: 1.3380, usdEquivalent: 1000000 }
        ]
      }
    ]
  },
  {
    id: 'POS-0002',
    currency: 'EUR',
    liquidityProvider: 'HSBC',
    netPosition: -1800000,
    currentRate: 1.0852,
    mtmValue: -1953360,
    unrealizedPnL: 12240,
    realizedPnL: -3500,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0003',
        tradeDate: new Date(Date.now() - 259200000).toISOString(),
        customerOrder: 'CUST-012',
        originalPair: 'EUR/USD',
        originalAmount: -1800000,
        usdLegs: [
          { pair: 'EURUSD', amount: -1800000, rate: 1.0920, usdEquivalent: -1965600 }
        ]
      }
    ]
  },
  {
    id: 'POS-0003',
    currency: 'GBP',
    liquidityProvider: 'Standard Chartered',
    netPosition: 1200000,
    currentRate: 1.2722,
    mtmValue: 1526640,
    unrealizedPnL: 8640,
    realizedPnL: 2100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0004',
        tradeDate: new Date(Date.now() - 345600000).toISOString(),
        customerOrder: 'CUST-018',
        originalPair: 'GBP/USD',
        originalAmount: 1200000,
        usdLegs: [
          { pair: 'GBPUSD', amount: 1200000, rate: 1.2650, usdEquivalent: 1518000 }
        ]
      }
    ]
  },
  {
    id: 'POS-0004',
    currency: 'AUD',
    liquidityProvider: 'DBS',
    netPosition: -950000,
    currentRate: 0.6582,
    mtmValue: -625290,
    unrealizedPnL: 3610,
    realizedPnL: -1800,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0005',
        tradeDate: new Date(Date.now() - 432000000).toISOString(),
        customerOrder: 'CUST-024',
        originalPair: 'AUD/USD',
        originalAmount: -950000,
        usdLegs: [
          { pair: 'AUDUSD', amount: -950000, rate: 0.6620, usdEquivalent: -628900 }
        ]
      }
    ]
  },
  {
    id: 'POS-0005',
    currency: 'JPY',
    liquidityProvider: 'UOB',
    netPosition: 3200000,
    currentRate: 149.27,
    mtmValue: 21435,
    unrealizedPnL: 1504,
    realizedPnL: 8900,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0006',
        tradeDate: new Date(Date.now() - 518400000).toISOString(),
        customerOrder: 'CUST-031',
        originalPair: 'USD/JPY',
        originalAmount: 3200000,
        usdLegs: [
          { pair: 'USDJPY', amount: 3200000, rate: 148.80, usdEquivalent: 21505 }
        ]
      }
    ]
  },
  {
    id: 'POS-0006',
    currency: 'MYR',
    liquidityProvider: 'Citibank',
    netPosition: 4500000,
    currentRate: 4.4650,
    mtmValue: 1007826,
    unrealizedPnL: 5200,
    realizedPnL: 3100,
    status: 'Open',
    trades: [
      {
        id: 'TRD-0007',
        tradeDate: new Date(Date.now() - 604800000).toISOString(),
        customerOrder: 'CUST-042',
        originalPair: 'MYR/HKD',
        originalAmount: 4500000,
        usdLegs: [
          { pair: 'USDMYR', amount: 4500000, rate: 4.4500, usdEquivalent: 1011236 },
          { pair: 'USDHKD', amount: -1011236, rate: 7.8200, usdEquivalent: -4500000 }
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
