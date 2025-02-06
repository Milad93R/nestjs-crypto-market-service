#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BLUE='\033[0;34m'

# Base URL
BASE_URL="http://localhost:3000"

# Function to print section header
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to make a curl request and check response
make_request() {
    local description=$1
    local endpoint=$2
    
    echo -e "${GREEN}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    echo "Request:"
    
    response=$(curl -s "$endpoint")
    status=$?
    
    echo "Response:"
    echo "$response" | json_pp
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ Success${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
    fi
    echo "----------------------------------------"
}

# Test Root Endpoint
print_header "Testing Root Endpoint"
make_request "Get Hello World" \
    "$BASE_URL/"

# Test Coins Endpoints
print_header "Testing Coins Endpoints"
make_request "Get All Coins" \
    "$BASE_URL/coins"

make_request "Update Coins" \
    "$BASE_URL/coins/update" \
    "-X POST"

# Test Real-time Candles Endpoint
print_header "Testing Real-time Candles Endpoint"
make_request "Get Latest BTC Candles from Binance (1h)" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=binance&timeframe=1h"

make_request "Get Latest ETH Candles from Binance (4h)" \
    "$BASE_URL/candles/latest?symbol=ETH&exchange=binance&timeframe=4h"

make_request "Get Latest BTC Candles from KuCoin (1d)" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=kucoin&timeframe=1d"

# Test error cases for real-time candles
make_request "Test Invalid Symbol" \
    "$BASE_URL/candles/latest?exchange=binance&timeframe=1h"

make_request "Test Invalid Exchange" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=invalid&timeframe=1h"

make_request "Test Invalid Timeframe" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=binance&timeframe=5m"

# Test Database Candles Endpoint
print_header "Testing Database Candles Endpoint"
make_request "Get BTC Candles from Database (Default params)" \
    "$BASE_URL/candles/db/BTC/binance"

make_request "Get ETH Candles with Timeframe and Pagination" \
    "$BASE_URL/candles/db/ETH/binance?timeframe=4h&limit=50&page=1"

make_request "Get BTC Candles with Time Range" \
    "$BASE_URL/candles/db/BTC/binance?timeframe=1h&startTime=1706745600000&endTime=1706832000000"

# Test error cases for database candles
make_request "Test Invalid Symbol in DB" \
    "$BASE_URL/candles/db/INVALID/binance"

make_request "Test Invalid Exchange in DB" \
    "$BASE_URL/candles/db/BTC/invalid"

make_request "Test Invalid Timeframe in DB" \
    "$BASE_URL/candles/db/BTC/binance?timeframe=5m"

echo -e "\n${GREEN}All tests completed!${NC}\n" 