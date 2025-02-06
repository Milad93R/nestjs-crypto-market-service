#!/bin/bash

source "$(dirname "$0")/common.sh"

print_header "Running All API Tests"

# Make all test scripts executable
chmod +x "$(dirname "$0")"/*.sh

# Run each test file
"$(dirname "$0")/test_root.sh"
"$(dirname "$0")/test_coins.sh"
"$(dirname "$0")/test_realtime_candles.sh"
"$(dirname "$0")/test_db_candles.sh"
"$(dirname "$0")/test_coin_exchanges.sh"
"$(dirname "$0")/test_timeframes.sh"
"$(dirname "$0")/test_exchanges.sh"

echo -e "\n${GREEN}All test suites completed!${NC}\n" 