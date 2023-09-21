#!/bin/bash

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

build_k6_docker_command() {
    relativePath="$1"
    reportFile="$2"

    command="docker-compose run --rm -i \
            -v $(pwd):/scripts \
            -u $(id -u):$(id -g) \
            k6 run $relativePath \
            --tag='test_run_id=$(generate_uuid)' \
            --tag='test_runner_hostname=$(hostname)' \
            --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
            --out json='$reportFile'"

    echo "$command"
}

create_folder_if_not_existant() {
    folder="$1"

    if [ ! -d "$folder" ]; then
        # If it doesn't exist, create it and its parent directories recursively
        mkdir -p "$folder"
    fi
}

create_report_folder() {
    echo "results/$(date +%Y/%m/%d)"
}

create_report_file() {
    echo "k6_report_$(date +%Y%m%d_%H%M%S).json";
}
