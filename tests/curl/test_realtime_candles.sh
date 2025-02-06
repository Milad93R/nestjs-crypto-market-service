#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Real-time Candles Endpoint"

# Test successful cases
make_request "Get Latest BTC Candles from Binance (1h)" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=binance&timeframe=1h"

make_request "Get Latest ETH Candles from Binance (4h)" \
    "$BASE_URL/candles/latest?symbol=ETH&exchange=binance&timeframe=4h"

make_request "Get Latest BTC Candles from KuCoin (1d)" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=kucoin&timeframe=1d"

# Test error cases
print_header "Testing Error Cases"

make_request "Test Missing Symbol" \
    "$BASE_URL/candles/latest?exchange=binance&timeframe=1h"

make_request "Test Missing Exchange" \
    "$BASE_URL/candles/latest?symbol=BTC&timeframe=1h"

make_request "Test Invalid Exchange" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=invalid&timeframe=1h"

make_request "Test Invalid Timeframe" \
    "$BASE_URL/candles/latest?symbol=BTC&exchange=binance&timeframe=5m" 