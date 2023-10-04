#!/bin/bash

source shell/functions.sh

# Generate the output file
reportFile=$(create_report_file)
outputFolder=$(create_report_folder)
reportFile="$outputFolder/$reportFile"

$(create_folder_if_not_existant "$outputFolder")

# Create arrays for file lists
filesDirectory1=($(find "tests/b2b/$app/tests" -name '*-test.js' -type f))

# Merge the arrays
files=("${filesDirectory1[@]}" "${filesDirectory2[@]}")

# Iterate over the merged array
for file in "${files[@]}"
do
  # Get the path of the current file relative to the original directory
  testFile=${file#$(pwd)/}

  # Construct the docker command
  command=$(build_k6_docker_command "$testFile" "$reportFile")

  echo "Running command: '$command'"

  # Run k6 on the current file using its original path
  eval "$command"
done
