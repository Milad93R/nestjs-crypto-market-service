import { CCXTService } from './ccxt.service';

describe('CCXTService', () => {
  const queryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };
  const repository = {
    createQueryBuilder: jest.fn(() => queryBuilder),
    findOne: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) => key === 'exchanges'
      ? [{ name: 'binance', timeframe: '1h', status: 2 }]
      : ['1h']),
  };

  let service: CCXTService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CCXTService(config as never, repository as never);
  });

  it('maps exchange OHLCV rows into the service candle shape', async () => {
    const fetchOHLCV = jest.fn().mockResolvedValue([
      [1_700_000_000_000, 100, 110, 90, 105, 12.5],
    ]);
    (service as any).ccxtInstances.binance = { fetchOHLCV, rateLimit: -1 };

    await expect(service.fetchCandlesFromCCXT(
      'BTC', 'binance', '1h', 1_699_000_000_000, 500,
    )).resolves.toEqual([
      { timestamp: 1_700_000_000_000, open: 100, high: 110, low: 90, close: 105, volume: 12.5 },
    ]);
    expect(fetchOHLCV).toHaveBeenCalledWith(
      'BTC/USDT', '1h', 1_699_000_000_000, 500, { limit: 500 },
    );
  });

  it('fails clearly when the requested exchange was not initialized', async () => {
    await expect(service.fetchCandlesFromCCXT('BTC', 'missing', '1h'))
      .rejects.toThrow('Exchange missing not initialized');
  });

  it('applies time bounds and pagination to database queries', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[{ timestamp: 200 }], 1]);

    await expect(service.getCandles('BTC', 'binance', '1h', 100, 300, 25, 3))
      .resolves.toEqual({ candles: [{ timestamp: 200 }], total: 1 });

    expect(queryBuilder.where).toHaveBeenCalledWith('candle.symbol = :symbol', { symbol: 'BTC' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('candle.exchange = :exchange', { exchange: 'binance' });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('candle.timestamp >= :startTime', { startTime: 100 });
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('candle.timestamp <= :endTime', { endTime: 300 });
    expect(queryBuilder.skip).toHaveBeenCalledWith(50);
    expect(queryBuilder.take).toHaveBeenCalledWith(25);
  });

  it('returns the configured status for an exchange timeframe pair', async () => {
    await expect(service.getExchangeTimeframeStatus('binance', '1h')).resolves.toBe(2);
    await expect(service.getExchangeTimeframeStatus('binance', '1d')).resolves.toBeUndefined();
  });
});
