#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Exchanges Endpoint"

# Test successful cases
make_request "Add Binance exchange" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{
        "name": "binance"
    }'

make_request "Add KuCoin exchange" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{
        "name": "kucoin"
    }'

make_request "Add OKX exchange" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{
        "name": "okx"
    }'

# Test getting all exchanges
make_request "Get all exchanges" \
    "$BASE_URL/exchanges" \
    "GET"

# Test error cases
print_header "Testing Error Cases"

# Test duplicate exchange
make_request "Test duplicate exchange" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{
        "name": "binance"
    }'

# Test missing required fields
make_request "Test missing name" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{}'

# Test invalid name format
make_request "Test invalid name format" \
    "$BASE_URL/exchanges" \
    "POST" \
    '{
        "name": ""
    }' 