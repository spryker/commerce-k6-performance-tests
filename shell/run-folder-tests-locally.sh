#!/bin/bash

source shell/functions.sh

if [ $# -eq 1 ]; then
    test_folder="$1"
else
    echo -n "Enter the path to the test folder (e.g., /tests/b2b/sapi/tests): "
    read test_folder
fi

if [ ! -d "$test_folder" ]; then
    echo "Error: The specified folder '$test_folder' does not exist."
    exit 1
fi

files=($(find "$test_folder" -name '*.js' -type f))
for file in "${files[@]}"; do
    bash shell/run-a-single-test-locally.sh "/$file"
done
