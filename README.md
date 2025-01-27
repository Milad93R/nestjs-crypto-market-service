# Crypto Trading Application

A NestJS-based application for cryptocurrency trading that integrates with various exchanges using CCXT.

## Features

- Real-time cryptocurrency data fetching
- Integration with multiple exchanges (Binance, KuCoin, OKX)
- RESTful API endpoints for coin management
- Containerized with Docker for easy deployment
- PostgreSQL database for data persistence

## Prerequisites

- Docker and Docker Compose
- Node.js 20.x (for local development)
- npm or yarn

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-trading
```

2. Start the application using Docker:
```bash
docker-compose up -d
```

The application will be available at:
- API: http://localhost:3000
- Database: localhost:5436

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=crypto_trading

# Node Environment
NODE_ENV=development

# Application Port
PORT=3000

# CoinGecko Configuration (Optional)
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_api_key
COINGECKO_REQUEST_DELAY=1000
COINGECKO_TOP_COINS_LIMIT=100
```

## API Endpoints

### Coins

- `GET /` - Health check endpoint
- `GET /coins` - Get list of all coins
- `POST /coins/update` - Update coin information

## Development

### Local Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

### Docker Setup

The application is containerized using Docker with the following components:
- NestJS application (Node.js 20)
- PostgreSQL 16 database

To rebuild the containers:
```bash
docker-compose up --build
```

## Project Structure

```
├── src/
│   ├── candles/           # Candle (OHLCV) data management
│   ├── coins/             # Cryptocurrency management
│   ├── config/            # Application configuration
│   ├── exchanges/         # Exchange integrations
│   └── tasks/             # Scheduled tasks
├── docker-compose.yml     # Docker composition
├── Dockerfile            # Application container definition
└── package.json         # Project dependencies
```

## Contributing

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Commit your changes:
```bash
git commit -m "Add your feature description"
```

3. Push to the branch:
```bash
git push origin feature/your-feature-name
```

4. Create a Pull Request

## License

[MIT License](LICENSE)
