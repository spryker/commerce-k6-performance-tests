#!/bin/bash

source shell/functions.sh

# Check if an argument was provided to the script
if [ $# -eq 1 ]; then
    # Use the argument as the "file" variable
    file="$1"
else
    # Prompt the user for input and store it in the "file" variable
    echo -n "Enter the path to the test file (e.g., /tests/b2b/sapi/tests/cart/B2B-SAPI4-carts.js): "
    read file
fi

# Generate the output file
reportFile=$(basename "$file" .js)
outputFolder=$(create_report_folder)
reportFile="$outputFolder/K6_result_report_${reportFile}_$(date +%Y%m%d_%H%M%S).json"
testRunId=$(generate_uuid)

$(create_folder_if_not_existant "$outputFolder")

# Get the path of the current file relative to the original directory
testFile=${file#$(pwd)/}

# Construct the docker command
if ! command=$(build_k6_docker_command "$testFile" "$reportFile" "$testRunId"); then
    exit 1;
fi

echo "Running command: '$command'"

# Record the start time
start_timer

# Run k6 on the current file using its original path
eval "$command"

# Record the end time
stop_timer
