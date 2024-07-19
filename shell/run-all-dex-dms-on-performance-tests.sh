#!/bin/bash

source shell/functions.sh

# Record the start time
start_timer

# Create arrays for file lists
filesDirectory1=($(find "tests/b2b/bapi/tests/data-exchange-api/tests" -name '*.js' -name 'post.js' -type f | sort))
filesDirectory2=($(find "tests/b2b/bapi/tests/data-exchange-api/tests" -name '*.js' -type f | grep -v 'post.js' | sort -r))

# Merge the arrays
files=("setup-stores.js" "tests/dex/tests/setup-warehous-payment-shipping.js" "${filesDirectory1[@]}" "${filesDirectory2[@]}")

run_k6_tests "$files"

# Record the end time
stop_timer
