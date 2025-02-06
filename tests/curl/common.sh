#!/bin/bash

# Colors for output
export GREEN='\033[0;32m'
export RED='\033[0;31m'
export NC='\033[0m' # No Color
export BLUE='\033[0;34m'

# Base URL
export BASE_URL="http://localhost:3000"

# Function to print section header
print_header() {
    echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

# Function to make a curl request and check response
make_request() {
    local description=$1
    local endpoint=$2
    local method=${3:-"GET"}
    local data=$4
    
    echo -e "${GREEN}Testing: $description${NC}"
    echo "Endpoint: $endpoint"
    echo "Method: $method"
    echo "Request:"
    if [ -n "$data" ]; then
        echo "$data" | json_pp
    fi
    
    if [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -X POST "$endpoint" -H "Content-Type: application/json" -d "$data")
        else
            response=$(curl -s -X POST "$endpoint")
        fi
    else
        response=$(curl -s "$endpoint")
    fi
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