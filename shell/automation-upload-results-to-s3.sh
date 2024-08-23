#!/bin/bash

#Use this script to upload the test results to an S3 bucket when the script is being run in the same AWS account as the S3 bucket.
# and AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are already set in the environment.

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

check_env_var "TESTS_ARTIFACTS_BUCKET"

aws s3 cp $directory s3://$TESTS_ARTIFACTS_BUCKET/k6-test-results/ --recursive
