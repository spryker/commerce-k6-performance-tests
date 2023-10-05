#!/bin/bash

source shell/functions.sh

# Create arrays for file lists
filesDirectory1=($(find "tests/b2b-mp/sapi/tests" -name '*.js' -type f))
filesDirectory2=($(find "tests/b2b-mp/storefront/tests" -name '*.js' -type f))

# Merge the arrays
files=("${filesDirectory1[@]}" "${filesDirectory2[@]}")

run_k6_tests "$files"
