#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Timeframes Endpoint"

# Test successful cases
make_request "Add 1 Hour timeframe" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "1 Hour",
        "interval": "1h",
        "minutes": 60
    }'

make_request "Add 4 Hours timeframe" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "4 Hours",
        "interval": "4h",
        "minutes": 240
    }'

make_request "Add 1 Day timeframe" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "1 Day",
        "interval": "1d",
        "minutes": 1440
    }'

# Test getting all timeframes
make_request "Get all timeframes" \
    "$BASE_URL/timeframes" \
    "GET"

# Test error cases
print_header "Testing Error Cases"

# Test duplicate interval
make_request "Test duplicate interval" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "One Hour",
        "interval": "1h",
        "minutes": 60
    }'

# Test duplicate name
make_request "Test duplicate name" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "1 Hour",
        "interval": "60m",
        "minutes": 60
    }'

# Test missing required fields
make_request "Test missing name" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "interval": "1h",
        "minutes": 60
    }'

make_request "Test missing interval" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "1 Hour",
        "minutes": 60
    }'

make_request "Test missing minutes" \
    "$BASE_URL/timeframes" \
    "POST" \
    '{
        "name": "1 Hour",
        "interval": "1h"
    }' 