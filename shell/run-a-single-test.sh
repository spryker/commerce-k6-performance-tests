#!/bin/bash

source shell/functions.sh

# Initialize default values
local_mode=false

# Parse command-line arguments
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --local)
            local_mode=true
            shift
            ;;
        *)
            file="$1"
            shift
            ;;
    esac
done

# Prompt the user for input if no file argument was provided
if [ -z "$file" ]; then
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

# Check if --local flag is set
if $local_mode; then
    if ! command=$(build_k6_local_command "$testFile" "$reportFile" "$testRunId"); then
        exit 1
    fi

    echo "Running command in local mode: '$command'"
else
    # Construct the docker command
    if ! command=$(build_k6_docker_command "$testFile" "$reportFile" "$testRunId"); then
        exit 1;
    fi

    echo "Running command: '$command'"
fi

# Record the start time
start_timer

# Run k6 on the current file using its original path
eval "$command"

# Record the end time
stop_timer
