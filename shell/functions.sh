#!/bin/bash

# Generates a UUID either by the system command or if not programmatically
generate_uuid() {
    if command -v uuidgen &>/dev/null; then
        # If uuidgen is available, use it to generate a UUID
        uuid=$(uuidgen)
    else
        # If uuidgen is not available, generate a unique value using timestamp and random number
        timestamp=$(date +%s%N)
        randnum=$((RANDOM))
        unique_value="${timestamp}_${randnum}"
        uuid="fallback_${unique_value}"
    fi

    echo "$uuid"
}

# Builds the command to run the K6 docker container with all required arguments.
# 
# Notice that we inject test run id and test runner host via env vars to the docker container
# and that we don't use the --tag argument of K6. The reason for that is that K6 has a bug and
# you can't pass tags and define them internally. If you start using --tag here, then the 
# custom tags WON'T WORK!
build_k6_docker_command() {
    relativePath="$1"
    reportFile="$2"

    command="docker-compose run --rm -i \
            -v $(pwd):/scripts \
            -u $(id -u):$(id -g) \
            -e 'K6_TEST_RUN_ID=$(generate_uuid)' \
            -e 'K6_TEST_RUNNER_HOSTNAME=$(hostname)' \
            k6 run $relativePath \
            --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
            --out json='$reportFile'"

    echo "$command"
}

# Helper method to create a folder if it does not exist
create_folder_if_not_existant() {
    folder="$1"

    if [ ! -d "$folder" ]; then
        # If it doesn't exist, create it and its parent directories recursively
        mkdir -p "$folder"
    fi
}

# Creates the report folder
create_report_folder() {
    echo "results/$(date +%Y/%m/%d)"
}

# Creates a report file
create_report_file() {
    echo "k6_report_$(date +%Y%m%d_%H%M%S).json";
}
