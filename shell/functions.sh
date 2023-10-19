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
    testRunId="$3"

    # Check if testRunId is empty
    if [ -z "$testRunId" ]; then
        testRunId=$(generate_uuid)  # Call generate_uuid to get a UUID
    fi

    command="docker-compose run --rm -i \
            -v $(pwd):/scripts \
            -u $(id -u):$(id -g) \
            -e 'K6_TEST_RUN_ID=$testRunId' \
            -e 'K6_TEST_RUNNER_HOSTNAME=$(hostname)' \
            -e 'K6_BROWSER_ENABLED=true' \
            k6 run $relativePath \
            --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
            --out json='$reportFile'"

    echo "$command"
}

# Helper method to create a folder if it does not exist
create_folder_if_not_existant() {
    local folder="$1"

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

# Merges files into one and deletes the input files after that.
#
# This is used to merge the report files from multiple executions of K6.
merge_and_delte_files() {
    # Check if at least two arguments are provided
    if [ $# -lt 2 ]; then
        echo "Usage: merge_files <output_file> <input_file1> <input_file2> [input_file3 ...]"
        return 1
    fi

    # Extract the first argument as the output file
    outputFile="$1"
    shift

    # Use cat to concatenate input files and append to the output file
    cat "$@" > "$outputFile"

    rm $@
}

run_k6_tests() {
    files=$1;

    # Generate the output file
    reportFile=$(create_report_file)
    outputFolder=$(create_report_folder)
    finalReportFile="$outputFolder/$reportFile"
    testRunId=$(generate_uuid)

    $(create_folder_if_not_existant "$outputFolder")

    # If the folder existed and previously generated tmp files remained
    # e.g. in the case the script execution was interrupted
    $(delete_tmp_report_files "outputFolder")

    # Iterate over the merged array
    i=1;
    reportFiles=();
    for file in "${files[@]}"
    do
        # Get the path of the current file relative to the original directory
        testFile=${file#$(pwd)/}
        reportFile="$outputFolder/tmp_report_$i"
        reportFiles+=($reportFile)

        # Construct the docker command
        command=$(build_k6_docker_command "$testFile" "$reportFile" "$testRunId")

        echo "Running command: '$command'"

        # Run k6 on the current file using its original path
        eval "$command"

        ((i++));
    done

    merge_and_delte_files "$finalReportFile" "${reportFiles[@]}"
}

check_env_var() {
    if [ -z "${!1}" ]; then
        echo "Error: ${1} environment variable is empty or not set."
        exit 1
    fi
}

# Function to start the timer
start_timer() {
    start_time=$(date +%s)
}

# Function to stop the timer and display the elapsed time
stop_timer() {
    end_time=$(date +%s)
    elapsed_time=$((end_time - start_time))
    formatted_time=$(date -u -d @"$elapsed_time" +'%H:%M:%S')

    echo "Elapsed time: $formatted_time"
}

delete_tmp_report_files() {
    local folder_path="$1"  # The folder path
    local pattern="tmp_report_[0-9]*"  # Define the file pattern

    # Check if the folder exists
    if [ ! -d "$folder_path" ]; then
        echo "Error: The specified folder '$folder_path' does not exist."
        return 1
    fi

    # Change to the target directory
    cd "$folder_path" || return 1

    # Loop through files matching the pattern and delete them
    for file in $pattern; do
        if [ -f "$file" ]; then
            rm "$file"
            echo "Deleted $file"
        fi
    done
}