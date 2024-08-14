#!/bin/bash

source shell/functions.sh
load_env_file ".env"

# Record the start time
start_timer

# Create arrays for file lists
filesDirectory0=($(find "tests/dex/tests/generatePatchCandidates" -name '*.js' -type f | sort))
filesDirectory1=($(find "tests/dex/tests/get" -name '*.js' -type f | sort))
filesDirectory2=($(find "tests/dex/tests/patch" -name '*.js' -type f | sort))
filesDirectory3=($(find "tests/dex/tests/post" -name '*.js' -type f | sort ))

# Merge the arrays
files=("${filesDirectory0[@]}" "${filesDirectory3[@]}" "${filesDirectory2[@]}" "${filesDirectory1[@]}")

run_k6_tests "$files"

# Record the end time
stop_timer
