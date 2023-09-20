#!/bin/bash

# Generate a timestamp
timestamp=$(date +%Y%m%d_%H%M%S)
reportFile='k6_result_'$timestamp'.json';
outputFolder='results/'$(date +%Y/%m/%d);
outputFolder2='../../../'$outputFolder;

# Check if the folder exists
if [ ! -d "$outputFolder2" ]; then
  # If it doesn't exist, create it and its parent directories recursively
  mkdir -p "$outputFolder2"
  echo "Folder '$outputFolder2' created."
else
  echo "Folder '$outputFolder2' already exists."
fi

# Remember the list of .js files in the current directory and their paths
files=$(find "$(pwd)/tests" -name '*.js' -type f)

# Change to the desired directory
cd ../../../

# Run k6 on the remembered files
for file in $files
do
  # Get the path of the current file relative to the original directory
  relativePath=${file#$(pwd)/}

  # Construct the docker command
  command="docker-compose run --rm -i \
          -v $(pwd):/scripts \
          -u $(id -u):$(id -g) \
          k6 run $relativePath \
          --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
          --out json='/scripts/$outputFolder/$reportFile'"

  echo "Running command: $command"

  # Run k6 on the current file using its original path
  eval "$command"
done
