# Crypto Market Data Service

A NestJS-based service for fetching and storing cryptocurrency market data from multiple exchanges using CCXT.

## Features

- Multi-exchange support (Binance, KuCoin, OKX)
- Real-time and historical candle data
- Configurable timeframes (1h, 4h, 1d)
- Automatic data collection and storage
- RESTful API endpoints
- Database persistence
- Docker support
- Input validation and sanitization
  - Strict type checking
  - Pattern matching
  - Automatic transformation
  - Detailed error messages

## Tech Stack

- **Backend Framework**: NestJS v11
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Exchange Integration**: CCXT
- **Task Scheduling**: @nestjs/schedule
- **Configuration**: @nestjs/config
- **Validation**: class-validator, class-transformer
- **Container**: Docker
- **Language**: TypeScript

## API Endpoints

### 1. Root Endpoint
```
GET /
Response: "Hello World"
Purpose: Health check
```

### 2. Coins Endpoints
```
GET /coins
Response: Array of coins with their details
Purpose: Get list of supported coins

POST /coins/update
Response: { "message": "Coins updated successfully" }
Purpose: Update coins list from CoinGecko
```

### 3. Real-time Candles Endpoint
```
GET /candles/latest
Query Parameters:
  - symbol (required): e.g., "BTC", "ETH"
  - exchange (required): "binance", "kucoin", "okx"
  - timeframe (optional): "1h" (default), "4h", "1d"
Response: Latest 1000 candles from exchange
Purpose: Fetch real-time market data
```

### 4. Database Candles Endpoint
```
GET /candles/db/:symbol/:exchange
Path Parameters:
  - symbol: e.g., "BTC", "ETH"
  - exchange: "binance", "kucoin", "okx"
Query Parameters:
  - timeframe (optional): "1h" (default), "4h", "1d"
  - startTime (optional): timestamp in milliseconds
  - endTime (optional): timestamp in milliseconds
  - limit (optional): default 100
  - page (optional): default 1
Response: Historical candle data with pagination
Purpose: Query historical market data
```

### Error Responses

The API uses standard HTTP status codes:

- 200: Successful operation
- 400: Bad Request
  - Invalid input format
  - Missing required fields
  - Pattern matching failures
- 404: Resource not found
- 409: Conflict (e.g., duplicate entries)
- 500: Internal server error
- 502: Exchange connection error

Example error response:
```json
{
  "statusCode": 400,
  "message": "Name can only contain letters, numbers, underscores and hyphens",
  "error": "Bad Request"
}
```

## Quick Start with Docker

### Prerequisites
- Docker (v20.10.0 or higher)
- Docker Compose (v2.0.0 or higher)

### Running the Application

1. Clone the repository and navigate to the project directory:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Start the services:
```bash
docker-compose up -d
```

3. Verify the installation:
```bash
# Health check
curl http://localhost:3000

# Get coins list
curl http://localhost:3000/coins
```

### Managing the Application

```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Restart services
docker-compose restart
```

### Troubleshooting

If you encounter any issues:

1. Check container status:
```bash
docker-compose ps
```

2. View logs:
```bash
# All services
docker-compose logs -f
```

3. Check database connection:
```bash
docker-compose exec postgres psql -U postgres -d crypto_trading
```

4. Common Issues:
- If the application can't connect to the database, ensure postgres container is running:
  ```bash
  docker-compose restart postgres
  ```
- If you see "port already in use" errors, ensure no other services are using ports 3000 or 5432

## Testing

### API Tests
Located in `tests/curl/` directory, these are shell scripts to test all API endpoints:

```bash
# Run all tests
./tests/curl/run_all_tests.sh

# Run individual test suites
./tests/curl/test_root.sh        # Test root endpoint
./tests/curl/test_coins.sh       # Test coins endpoints
./tests/curl/test_realtime_candles.sh  # Test real-time candles
./tests/curl/test_db_candles.sh  # Test database candles
```

### E2E Tests
Located in `test/` directory, these are TypeScript-based end-to-end tests:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e test/candles-db.e2e-spec.ts
```

The test suite includes:
- Database connection tests
- API endpoint validation
- Data retrieval verification
- Error handling scenarios