export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const getUnixTime = (date: Date = new Date()): number => {
  return Math.floor(date.getTime() / 1000);
};

export const parseTimeframe = (timeframe: string): number => {
  if (typeof timeframe !== 'string') {
    throw new Error(`Invalid timeframe: ${String(timeframe)}`);
  }

  const match = /^([1-9][0-9]*)([mhd])$/.exec(timeframe);
  if (!match) {
    throw new Error(`Invalid timeframe: ${timeframe}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

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
