#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Database Candles Endpoint"

# Test successful cases
make_request "Get BTC Candles from Database (Default params)" \
    "$BASE_URL/candles/db/BTC/binance"

make_request "Get ETH Candles with Timeframe and Pagination" \
    "$BASE_URL/candles/db/ETH/binance?timeframe=4h&limit=50&page=1"

make_request "Get BTC Candles with Time Range" \
    "$BASE_URL/candles/db/BTC/binance?timeframe=1h&startTime=1706745600000&endTime=1706832000000"

# Test error cases
print_header "Testing Error Cases"

make_request "Test Invalid Symbol" \
    "$BASE_URL/candles/db/INVALID/binance"

make_request "Test Invalid Exchange" \
    "$BASE_URL/candles/db/BTC/invalid"

make_request "Test Invalid Timeframe" \
    "$BASE_URL/candles/db/BTC/binance?timeframe=5m"

make_request "Test Invalid Time Range" \
    "$BASE_URL/candles/db/BTC/binance?startTime=invalid"

make_request "Test Invalid Pagination" \
    "$BASE_URL/candles/db/BTC/binance?page=0&limit=0" 