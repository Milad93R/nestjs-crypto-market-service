import { getUnixTime, parseTimeframe } from './time.utils';

describe('time utilities', () => {
  it.each([
    ['1m', 60],
    ['15m', 900],
    ['4h', 14_400],
    ['1d', 86_400],
  ])('converts %s to %i seconds', (timeframe, expected) => {
    expect(parseTimeframe(timeframe)).toBe(expected);
  });

  it('rejects unsupported timeframe units', () => {
    expect(() => parseTimeframe('1w')).toThrow('Invalid timeframe: 1w');
  });

  it('returns whole Unix seconds', () => {
    expect(getUnixTime(new Date('2026-01-01T00:00:00.999Z'))).toBe(1_767_225_600);
  });
});
