import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface TimeFrame {
  name: string;
  interval: string;
  minutes: number;
}

interface Coin {
  name: string;
  symbol: string;
}

const timeframes: TimeFrame[] = [
  { name: '1 Hour', interval: '1h', minutes: 60 },
  { name: '4 Hours', interval: '4h', minutes: 240 },
  { name: '1 Day', interval: '1d', minutes: 1440 },
];

const coins: Coin[] = [
  { name: 'Bitcoin', symbol: 'BTC' },
  { name: 'Ethereum', symbol: 'ETH' },
  { name: 'XRP', symbol: 'XRP' },
  { name: 'Stellar', symbol: 'XLM' },
  { name: 'Toncoin', symbol: 'TON' },
  { name: 'The Sandbox', symbol: 'SAND' },
  { name: 'Ravencoin', symbol: 'RVN' },
  { name: 'Oasis Network', symbol: 'ROSE' },
  { name: 'Harmony', symbol: 'ONE' },
  { name: 'NEAR Protocol', symbol: 'NEAR' },
  { name: 'Injective', symbol: 'INJ' },
  { name: 'Holo', symbol: 'HOT' },
  { name: 'Cardano', symbol: 'ADA' },
  { name: 'Filecoin', symbol: 'FIL' },
  { name: 'Ethereum Classic', symbol: 'ETC' },
  { name: 'Enjin Coin', symbol: 'ENJ' },
  { name: 'MultiversX', symbol: 'EGLD' },
  { name: 'Polkadot', symbol: 'DOT' },
  { name: 'Dogecoin', symbol: 'DOGE' },
  { name: 'Pepe', symbol: 'PEPE' },
  { name: 'Floki', symbol: 'FLOKI' },
  { name: 'Shiba Inu', symbol: 'SHIB' },
  { name: 'Compound', symbol: 'COMP' },
  { name: 'BNB', symbol: 'BNB' },
  { name: 'Avalanche', symbol: 'AVAX' },
  { name: 'Theta Network', symbol: 'THETA' },
  { name: 'VeChain', symbol: 'VET' },
];

async function initializeData() {
  try {
    console.log('Starting initialization...');

    // Add timeframes
    console.log('\nAdding timeframes...');
    for (const timeframe of timeframes) {
      try {
        const response = await axios.post(`${API_URL}/timeframes`, timeframe);
        console.log(`✅ Added timeframe: ${timeframe.interval}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`ℹ️ Timeframe ${timeframe.interval} already exists`);
        } else {
          console.error(`❌ Failed to add timeframe ${timeframe.interval}:`, error.response?.data?.message || error.message);
        }
      }
    }

    // Add Binance exchange
    console.log('\nAdding Binance exchange...');
    try {
      const response = await axios.post(`${API_URL}/exchanges`, { name: 'binance' });
      console.log('✅ Added Binance exchange');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('ℹ️ Binance exchange already exists');
      } else {
        console.error('❌ Failed to add Binance:', error.response?.data?.message || error.message);
      }
    }

    // Add coins
    console.log('\nAdding coins...');
    for (const coin of coins) {
      try {
        const response = await axios.post(`${API_URL}/coins`, coin);
        console.log(`✅ Added coin: ${coin.symbol}`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`ℹ️ Coin ${coin.symbol} already exists`);
        } else {
          console.error(`❌ Failed to add coin ${coin.symbol}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\nInitialization completed successfully!');
  } catch (error) {
    console.error('Failed to initialize data:', error.message);
  }
}

// Run the initialization
initializeData(); 