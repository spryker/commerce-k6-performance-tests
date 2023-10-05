#!/bin/bash

if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory>"
    exit 1
fi

directory="$1"

if [ ! -d "$directory" ]; then
    echo "Error: The specified directory '$directory' does not exist."
    exit 1
fi

AWS_DEFAULT_REGION=TESTS_ARTIFACTS_BUCKET_REGION
AWS_ACCESS_KEY_ID=TESTS_ARTIFACTS_KEY
AWS_SECRET_ACCESS_KEY=TESTS_ARTIFACTS_SECRET

# Check if AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY are empty
if [ -z "$AWS_DEFAULT_REGION" ] || [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: One or more of the required AWS environment variables is empty."
    exit 1
fi

aws s3 cp $directory s3://$TESTS_ARTIFACTS_BUCKET/k6-test-results/ --recursive