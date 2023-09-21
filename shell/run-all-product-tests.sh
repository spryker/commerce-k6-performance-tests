#!/bin/bash

source shell/functions.sh

# Generate a timestamp
timestamp=$(date +%Y%m%d_%H%M%S)
reportFile='k6_report_'$timestamp'.json';
outputFolder='results/'$(date +%Y/%m/%d);
outputFolder2=$outputFolder;

$(create_folder_if_not_existant "$outputFolder2")

# Create arrays for file lists
filesDirectory1=($(find "tests/b2b-mp/sapi/tests" -name '*.js' -type f))
filesDirectory2=($(find "tests/b2b-mp/storefront/tests" -name '*.js' -type f))

# Merge the arrays
files=("${filesDirectory1[@]}" "${filesDirectory2[@]}")

# Iterate over the merged array
for file in "${files[@]}"
do
  # Get the path of the current file relative to the original directory
  relativePath=${file#$(pwd)/}
  reportFile="'/scripts/$outputFolder/$reportFile'"

  # Construct the docker command
  command=$(build_k6_docker_command "$relativePath" "$reportFile")

  echo "Running command: '$command'"

  # Run k6 on the current file using its original path
  eval "$command"
done
