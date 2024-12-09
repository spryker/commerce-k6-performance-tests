#!/bin/bash

source shell/functions.sh

if [ $# -eq 1 ]; then
    file="$1"
else
    echo -n "Enter the path to the test file (e.g., /tests/b2b/sapi/tests/cart/B2B-SAPI4-carts.js): "
    read file
fi

testFile=${file#$(pwd)/}

if ! command=$(build_k6_docker_command_local "$testFile"); then
    exit 1;
fi

eval "$command"
