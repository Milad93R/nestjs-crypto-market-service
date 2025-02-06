#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Testing Root Endpoint"

# Test root endpoint
make_request "Get Hello World" \
    "$BASE_URL/" 