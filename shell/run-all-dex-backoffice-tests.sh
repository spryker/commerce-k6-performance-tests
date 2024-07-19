#!/bin/bash

source shell/functions.sh

# Record the start time
start_timer

# Create arrays for file lists
filesDirectory1=($(find "tests/dex/tests/backoffice" -name '*.js' -type f | sort))

# Merge the arrays
files=("${filesDirectory1[@]}")

run_k6_tests "$files"

# Record the end time
stop_timer
