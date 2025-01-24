export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getUnixTime = (date: Date = new Date()): number => {
  return Math.floor(date.getTime() / 1000);
};

export const parseTimeframe = (timeframe: string): number => {
  const unit = timeframe.slice(-1);
  const value = parseInt(timeframe.slice(0, -1));

  switch (unit) {
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid timeframe: ${timeframe}`);
  }
}; 