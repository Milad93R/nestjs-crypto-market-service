#!/bin/bash

# Import common functions
source "$(dirname "$0")/common.sh"

echo "Testing fetch-all candles endpoint..."

# Test fetch-all candles
response=$(make_request "Fetch all candles" \
    "$BASE_URL/candles/fetch-all" \
    "POST" | grep -A 999 "Response:" | tail -n +2)

# Check if the response contains the expected structure
if echo "$response" | jq -e '.message' > /dev/null && \
   echo "$response" | jq -e '.details.processed' > /dev/null && \
   echo "$response" | jq -e '.details.errors' > /dev/null && \
   echo "$response" | jq -e '.details.details' > /dev/null; then
    echo "✅ Response structure is correct"
else
    echo "❌ Response structure is incorrect"
    echo "Response: $response"
    exit 1
fi

# Check if any pairs were processed
processed=$(echo "$response" | jq '.details.processed')
if [ "$processed" -gt 0 ]; then
    echo "✅ Successfully processed $processed pairs"
else
    echo "❌ No pairs were processed"
    echo "Response: $response"
    exit 1
fi

# Check error count and details
errors=$(echo "$response" | jq '.details.errors')
echo "Found $errors errors"
if [ "$errors" -gt 0 ]; then
    echo "Error details:"
    echo "$response" | jq '.details.details[] | select(.status == "error")'
fi

echo "Testing fetch-recent candles endpoint..."

# Test fetch-recent candles
response=$(make_request "Fetch recent candles" \
    "$BASE_URL/candles/fetch-recent" \
    "POST" | grep -A 999 "Response:" | tail -n +2)

# Check if the response contains the expected structure
if echo "$response" | jq -e '.message' > /dev/null && \
   echo "$response" | jq -e '.details.processed' > /dev/null && \
   echo "$response" | jq -e '.details.errors' > /dev/null && \
   echo "$response" | jq -e '.details.details' > /dev/null; then
    echo "✅ Response structure is correct"
else
    echo "❌ Response structure is incorrect"
    echo "Response: $response"
    exit 1
fi

# Check if any pairs were processed
processed=$(echo "$response" | jq '.details.processed')
if [ "$processed" -gt 0 ]; then
    echo "✅ Successfully processed $processed pairs"
else
    echo "❌ No pairs were processed"
    echo "Response: $response"
    exit 1
fi

# Check error count and details
errors=$(echo "$response" | jq '.details.errors')
echo "Found $errors errors"
if [ "$errors" -gt 0 ]; then
    echo "Error details:"
    echo "$response" | jq '.details.details[] | select(.status == "error")'
fi

echo "Testing get candles by exchange and timeframe endpoint..."

# Test get candles by exchange and timeframe
response=$(make_request "Get candles by exchange and timeframe" \
    "$BASE_URL/candles/exchange/binance/timeframe/1h" \
    "GET" | grep -A 999 "Response:" | tail -n +2)

# Check if the response contains the expected structure
if echo "$response" | jq -e '.exchange' > /dev/null && \
   echo "$response" | jq -e '.timeframe' > /dev/null && \
   echo "$response" | jq -e '.data' > /dev/null; then
    echo "✅ Response structure is correct"
else
    echo "❌ Response structure is incorrect"
    echo "Response: $response"
    exit 1
fi

# Check if any data is returned
data_count=$(echo "$response" | jq '.data | length')
if [ "$data_count" -gt 0 ]; then
    echo "✅ Successfully retrieved $data_count candles"
else
    echo "❌ No candles found"
    echo "Response: $response"
    exit 1
fi

echo "All tests completed!" 