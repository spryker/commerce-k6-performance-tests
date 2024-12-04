#!/bin/bash

source shell/functions.sh

# Check if the folder name is provided as a parameter
if [ $# -eq 1 ]; then
    # Use the argument as the "test_folder" variable
    test_folder="$1"
else
    # Prompt the user for input and store it in the "test_folder" variable
    echo -n "Enter the path to the test folder (e.g., /tests/b2b/sapi/tests): "
    read test_folder
fi

# Check if the specified folder exists
if [ ! -d "$test_folder" ]; then
    echo "Error: The specified folder '$test_folder' does not exist."
    exit 1
fi

# Reuse run-a-single-test.sh to run all tests in the specified folder
files=($(find "$test_folder" -name '*.js' -type f))
for file in "${files[@]}"; do
    bash shell/run-a-single-test.sh "$file"
done
