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

# Check error count
errors=$(echo "$response" | jq '.details.errors')
if [ "$errors" -eq 0 ]; then
    echo "✅ No errors occurred during processing"
else
    echo "⚠️ $errors errors occurred during processing"
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

echo "All tests completed!" 