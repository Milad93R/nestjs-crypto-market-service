#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Coins Endpoints"

# Test getting all coins
make_request "Get All Coins" \
    "$BASE_URL/coins"

# Test updating coins
make_request "Update Coins" \
    "$BASE_URL/coins/update" \
    "POST" 