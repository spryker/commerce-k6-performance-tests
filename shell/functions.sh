#!/bin/bash

# Source the .env file to load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

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

check_env_vars() {
    local required_vars=(
        "K6_HOSTENV"
    )

    if [ "$K6_HOSTENV" = "testing" ]; then
        required_vars+=(
            "SLACK_NOTIFICATION_TOKEN"
            "SLACK_NOTIFICATION_CHANNEL"
            "GIT_REPO"
            "GIT_BRANCH"
            "GIT_HASH"
            "BASIC_AUTH_USERNAME"
            "BASIC_AUTH_PASSWORD"
        )
    fi

    local unset_vars=()

    for var_name in "${required_vars[@]}"; do
        if [ -z "${!var_name}" ]; then
            unset_vars+=("$var_name")
        fi
    done

    if [ ${#unset_vars[@]} -gt 0 ]; then
        echo -e "\e[31m--------------------------------------------------------------------------------\e[0m" >&2
        echo -e "\e[31mThe following required environment variables are not set:\e[0m" >&2
        printf '%s\n' "${unset_vars[@]}" >&2
        echo -e "\e[31m--------------------------------------------------------------------------------\e[0m" >&2
        exit 1
    fi

    check_k6_host_env
}

check_k6_host_env() {
    if [ "$K6_HOSTENV" = "testing" ] || [ "$K6_HOSTENV" = "local" ]; then
        return
    fi

    echo -e "\e[31m--------------------------------------------------------------------------------\e[0m" >&2
    echo -e "\e[31m K6_HOSTENV value must be testing or local" >&2
    printf '%s\n' "${unset_vars[@]}" >&2
    echo -e "\e[31m--------------------------------------------------------------------------------\e[0m" >&2
    exit 1
}

# Builds the command to run the K6 docker container with all required arguments.
# 
# Notice that we inject test run id and test runner host via env vars to the docker container
# and that we don't use the --tag argument of K6. The reason for that is that K6 has a bug and
# you can't pass tags and define them internally. If you start using --tag here, then the 
# custom tags WON'T WORK!
build_k6_docker_command() {
    local relativePath="$1"
    local reportFile="$2"
    local testRunId="$3"

    if [ -z "$testRunId" ]; then
        testRunId=$(generate_uuid)  # Call generate_uuid to get a UUID
            echo >&2
            echo -e "\e[33m--------------------------------------------------------------------------------\e[0m" >&2
            echo -e "\e[33mYou did not specify the test run id.\e[0m" >&2
            echo -e "\e[33mA UUId will be generated and used.\e[0m" >&2
            echo -e "\e[33m--------------------------------------------------------------------------------\e[0m" >&2
            return 1;
    fi

    if docker compose version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker compose"
    # Check if 'docker-compose' is available
    elif docker-compose --version >/dev/null 2>&1; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "Neither 'docker compose' nor 'docker-compose' is available. Please install one of them."
        exit 1
    fi

    command="$DOCKER_COMPOSE run --rm \
            -v $(pwd):/scripts \
            -u $(id -u):$(id -g) \
            -e 'SPRYKER_TEST_RUN_ID=$testRunId' \
            -e 'SPRYKER_TEST_RUNNER_HOSTNAME=$(hostname)' \
            -e 'SPRYKER_TEST_PATH=$relativePath' \
            -e 'K6_BROWSER_ENABLED=true' \
            k6 run $relativePath \
            --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
            --out json='$reportFile'"

    echo "$command"
}

k6_run() {
    local relativePath="$1"
    local testRunId=$(generate_uuid)

    command="docker-compose -f docker-compose.$ENV_REPOSITORY_ID.$K6_HOSTENV.yml run --rm \
            -v $(pwd):/scripts \
            -u $(id -u):$(id -g) \
            -e 'SPRYKER_TEST_RUN_ID=$testRunId' \
            -e 'SPRYKER_TEST_RUNNER_HOSTNAME=$(hostname)' \
            -e 'SPRYKER_TEST_PATH=$relativePath' \
            -e 'K6_BROWSER_ENABLED=true' \
            k6 run $relativePath"

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
    echo "results/reports/$(date +%Y/%m/%d)"
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
    check_env_vars

    files=$1;

    # Generate the output file
    reportFile=$(create_report_file)
    outputFolder=$(create_report_folder)
    finalReportFile="$outputFolder/$reportFile"
    testRunId=$(generate_uuid)

    $(create_folder_if_not_existant "$outputFolder")

    # If the folder existed and previously generated tmp files remained
    # e.g. in the case the script execution was interrupted
    $(delete_tmp_report_files "$outputFolder")

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
        if ! command=$(build_k6_docker_command "$testFile" "$reportFile" "$testRunId"); then
            return 1;
        fi
      
        echo "Running command: '$command'"

        # Run k6 on the current file using its original path
        eval "$command"

        ((i++));
    done

    merge_and_delte_files "$finalReportFile" "${reportFiles[@]}"

    send_failed_thresholds_notification "$testRunId"
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

send_failed_thresholds_notification() {
    local testRunId=$1
    local failedThresholds=$(extract_failed_thresholds "$testRunId")

    if [ -n "$failedThresholds" ] && [ "$K6_HOSTENV" = "testing" ]; then
        send_slack_notification "$failedThresholds"
    fi
}

extract_failed_thresholds() {
    local testRunId=$1

    # Directory containing the files with failed thresholds
    local DIRECTORY="results/failed-thresholds"

    local output=""

    # Check if there are any .txt files in the directory
    if compgen -G "$DIRECTORY/*.txt" > /dev/null; then
        # Iterate over each .txt file in the directory
        for file in "$DIRECTORY"/*.txt; do
            # Append the content of the file to the output
            output+=$(cat "$file")
            output+="\n\n"

            # Delete the file after processing
            rm "$file"
        done
    fi

    if [ -n "$output" ]; then
        output=":x: Some thresholds have been crossed (Test run ID: $testRunId):\n\n$output"
    fi

    echo "$output"
}

send_slack_notification() {
    local token=$SLACK_NOTIFICATION_TOKEN
    local channel=$SLACK_NOTIFICATION_CHANNEL
    local message=$1
    local slackApiUrl="https://slack.com/api/chat.postMessage"

    # Make the API request to send the message
    local response=$(curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "{\"channel\": \"$channel\", \"text\": \"$message\"}" $slackApiUrl)

    # Check if the request was successful
    if echo "$response" | grep -q '"ok":true'; then
        echo "Failed thresholds notification sent successfully!"
    else
        echo "Failed to send failed thresholds notification."
    fi
}
