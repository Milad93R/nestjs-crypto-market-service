#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Coin Exchanges Endpoint"

# Test successful case
make_request "Add new coin exchange mapping" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732",
        "marketType": "spot",
        "isActive": true,
        "status": 1
    }'

# Test error cases
print_header "Testing Error Cases"

# Test missing required fields
make_request "Test missing coinId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732"
    }'

make_request "Test missing exchangeId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732"
    }'

make_request "Test missing timeframeId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb"
    }'

# Test invalid IDs
make_request "Test invalid coinId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "invalid-id",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732"
    }'

make_request "Test invalid exchangeId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "invalid-id",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732"
    }'

make_request "Test invalid timeframeId" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "invalid-id"
    }'

# Test invalid market type
make_request "Test invalid marketType" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732",
        "marketType": "invalid"
    }'

# Test update existing mapping
make_request "Update existing mapping" \
    "$BASE_URL/coin-exchanges" \
    "POST" \
    '{
        "coinId": "2fdc52ed-13b3-4acf-9c7e-310ed81fc856",
        "exchangeId": "e32f210a-c40f-4654-b052-ad47a68ae6fb",
        "timeframeId": "7103526c-997c-4191-993d-e803773c2732",
        "marketType": "spot",
        "isActive": false,
        "status": 2
    }' 