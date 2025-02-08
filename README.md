# 📊 Crypto Market Data Service

A high-performance, scalable NestJS service for fetching and storing cryptocurrency market data from multiple exchanges using CCXT. Built with TypeScript and modern best practices.

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

</div>

## ✨ Features

### 🔄 Multi-Exchange Support
- Seamless integration with major exchanges:
  - Binance
  - KuCoin
  - OKX
  - Bybit
  - And more...
- Easy to extend with new exchanges

### 📈 Comprehensive Market Data
- Real-time and historical candle data
- Multiple timeframes support:
  - 1 minute (1m)
  - 5 minutes (5m)
  - 15 minutes (15m)
  - 30 minutes (30m)
  - 1 hour (1h)
  - 4 hours (4h)
  - 1 day (1d)
- Automatic data collection and updates
- Historical data backfilling

### 🚀 High Performance
- Concurrent processing for faster data fetching
- Efficient database operations with TypeORM
- Rate limiting and retry mechanisms
- Optimized for high-frequency updates

### 💾 Data Management
- Automatic data synchronization
- Configurable update intervals
- Smart data backfilling
- Efficient storage with PostgreSQL
- Data integrity checks

### 🛠 Architecture & Design
- Clean architecture with NestJS
- RESTful API design
- Modular and extensible codebase
- Docker containerization
- Environment-based configuration
- Comprehensive logging

## 🔧 Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/) v11
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Exchange Integration**: [CCXT](https://github.com/ccxt/ccxt)
- **Task Scheduling**: [@nestjs/schedule](https://docs.nestjs.com/techniques/task-scheduling)
- **Configuration**: [@nestjs/config](https://docs.nestjs.com/techniques/configuration)
- **Container**: [Docker](https://www.docker.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## 📚 API Documentation

### 🌐 Base URL
All endpoints are prefixed with `/api/v1`

### 🔍 Available Endpoints

#### 1. System
```http
GET /
Response: "Hello World"
Purpose: Health check and system status
```

#### 2. Cryptocurrency Management
```http
# List all supported coins
GET /coins
Response: Array of coins with their details

# Update coin list from CoinGecko
POST /coins/update
Response: { "message": "Coins updated successfully" }

# Add new coin
POST /coins
Request: { "name": "Bitcoin", "symbol": "BTC" }
Response: Created coin object

# Reset coin list
DELETE /coins
Response: { "message": "All coins have been successfully deleted" }
```

#### 3. Market Data Operations
```http
# Fetch real-time candles
GET /candles/latest
Parameters:
  - symbol: "BTC", "ETH", etc.
  - exchange: "binance", "kucoin", "okx"
  - timeframe: "1h" (default), "4h", "1d"
Response: Latest 1000 candles

# Bulk update historical data
POST /candles/fetch-all
Response: Processing results with success/error details

# Update recent market data
POST /candles/fetch-recent
Response: Processing results for active pairs

# Query historical data
GET /candles/db/:symbol/:exchange
Parameters:
  - timeframe: "1h" (default), "4h", "1d"
  - startTime: milliseconds timestamp
  - endTime: milliseconds timestamp
  - limit: default 100
  - page: default 1
Response: Paginated historical data
```

#### 4. Exchange Configuration
```http
# List exchanges
GET /exchanges
Response: Configured exchanges list

# Add exchange
POST /exchanges
Request: { "name": "binance", "isActive": true }
Response: Exchange configuration

# Get exchange timeframes
GET /exchanges/:name/timeframes
Response: Exchange-specific timeframe settings
```

#### 5. Timeframe Management
```http
# List timeframes
GET /timeframes
Response: Available timeframe configurations

# Add timeframe
POST /timeframes
Request: { "interval": "1h", "minutes": 60 }
Response: Timeframe configuration
```

#### 6. Pair Configuration
```http
# List pairs
GET /coin-exchanges
Response: Configured trading pairs

# Configure pair
POST /coin-exchanges
Request: {
  "coin_id": "uuid",
  "exchange_id": "uuid",
  "timeframe_id": "uuid",
  "isActive": true,
  "status": 1
}
Response: Pair configuration

# Update pair settings
PATCH /coin-exchanges/:id
Request: { "isActive": boolean, "status": number }
Response: Updated configuration
```

## 🚀 Quick Start

### Prerequisites
- Docker v20.10.0+
- Docker Compose v2.0.0+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Start services:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
docker-compose exec app npm run typeorm -- migration:run -d typeorm.config.ts
```

4. Verify installation:
```bash
# Health check
curl http://localhost:3000/api/v1

# List coins
curl http://localhost:3000/api/v1/coins
```

## 🛠 Development

### Local Setup
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test
```

### Docker Commands
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.