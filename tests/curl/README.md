# API Endpoint Tests

This directory contains curl-based tests for all API endpoints in the crypto market data service.

## Test Files Structure

1. `common.sh` - Common utilities and functions used by all test files
2. `test_root.sh` - Tests for root endpoint (health check)
3. `test_coins.sh` - Tests for coins endpoints
4. `test_realtime_candles.sh` - Tests for real-time candles endpoint
5. `test_db_candles.sh` - Tests for database candles endpoint
6. `run_all_tests.sh` - Script to run all test files

## Available Endpoints

1. Root Endpoint
   - GET / - Basic health check

2. Coins Endpoints
   - GET /coins - Get all coins
   - POST /coins/update - Update coins list

3. Real-time Candles Endpoint
   - GET /candles/latest - Get latest candles directly from exchanges
   - Parameters:
     - symbol (required): e.g., BTC, ETH
     - exchange (required): binance, kucoin, okx
     - timeframe (optional): 1h (default), 4h, 1d

4. Database Candles Endpoint
   - GET /candles/db/:symbol/:exchange - Get historical candles from database
   - Parameters:
     - symbol (path): e.g., BTC, ETH
     - exchange (path): binance, kucoin, okx
     - timeframe (query, optional): 1h (default), 4h, 1d
     - startTime (query, optional): timestamp in milliseconds
     - endTime (query, optional): timestamp in milliseconds
     - limit (query, optional): default 100
     - page (query, optional): default 1

## Usage

1. Make sure the application is running (either locally or in Docker)

2. Run all tests:
   ```bash
   ./run_all_tests.sh
   ```

3. Run specific test suite:
   ```bash
   ./test_root.sh          # Test root endpoint
   ./test_coins.sh         # Test coins endpoints
   ./test_realtime_candles.sh  # Test real-time candles
   ./test_db_candles.sh    # Test database candles
   ```

## Output

The script provides colored output:
- 🟢 Green: Success messages and passed tests
- 🔴 Red: Failed requests and errors
- 🔵 Blue: Section headers

Each test shows:
- Test description
- Endpoint being tested
- Method (GET/POST)
- Request details
- Response (formatted JSON)
- Success/Failure status

## Error Cases

Each test file includes various error scenarios:
- Missing required parameters
- Invalid symbols
- Invalid exchanges
- Invalid timeframes
- Invalid time ranges
- Invalid pagination parameters

## Requirements

- bash shell
- curl
- json_pp (for JSON formatting)

## Configuration

The base URL can be configured in `common.sh`:
- Local: http://localhost:3000
- Docker: http://localhost:3000 (with port forwarding)
- Production: Your production URL

## Adding New Tests

1. Use `common.sh` functions in your test file:
   ```bash
   source "$(dirname "$0")/common.sh"
   ```

2. Use the `make_request` function:
   ```bash
   make_request "Description" "endpoint_url" ["METHOD"]
   ```

3. Add your test file to `run_all_tests.sh` 