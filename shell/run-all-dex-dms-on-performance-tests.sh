#!/bin/bash

source shell/functions.sh
load_env_file ".env"

# Record the start time
start_timer

# Create arrays for file lists
filesDirectory1=($(find "tests/b2b/bapi/tests/data-exchange-api/tests" -name '*.js' -name 'post.js' -type f | sort))
filesDirectory2=($(find "tests/b2b/bapi/tests/data-exchange-api/tests" -name '*.js' -type f | grep -v 'post.js' | grep -v 'put.js' | sort))

# Merge the arrays
#files=("tests/dex/tests/setup-stores.js" "tests/dex/tests/setup-warehous-payment-shipping.js" "${filesDirectory1[@]}" "${filesDirectory2[@]}")
files=("${filesDirectory1[@]}" "${filesDirectory2[@]}")

run_k6_tests "$files"

# Record the end time
stop_timer
