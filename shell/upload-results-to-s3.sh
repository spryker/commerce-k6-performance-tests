#!/bin/bash

source shell/functions.sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

directory="$1"

if [ ! -d "$directory" ]; then
    echo "Error: The specified directory '$directory' does not exist."
    exit 1
fi

AWS_ACCESS_KEY_ID=TESTS_ARTIFACTS_KEY
AWS_SECRET_ACCESS_KEY=TESTS_ARTIFACTS_SECRET

check_env_var "TESTS_ARTIFACTS_BUCKET"
check_env_var "TESTS_ARTIFACTS_KEY"
check_env_var "TESTS_ARTIFACTS_SECRET"

aws s3 cp $directory s3://$TESTS_ARTIFACTS_BUCKET/k6-test-results/ --recursive
