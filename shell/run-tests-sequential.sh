#!/bin/bash

# Generate a timestamp
timestamp=$(date +%Y%m%d%H%M%S)

# Remember the list of .js files in the current directory and their paths
files=$(find "$(pwd)/tests" -name '*.js' -type f)

# Get the path of the directory where the script is located
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Change to the desired directory
cd ../../../

# Run k6 on the remembered files
for file in $files
do
  # Get the path of the current file relative to the original directory
  relative_path=${file#$(pwd)/}

  # Construct the docker command
  command="docker-compose run --rm -i \
          -v $(pwd):/scripts \
          -u $(id -u):$(id -g) \
          k6 run $relative_path \
          --summary-trend-stats='avg,min,med,max,p(90),p(95),count' \
          --out json=/scripts/results/result_$timestamp.json"

  echo "Running command: $command"

  # Run k6 on the current file using its original path
  eval "$command"
done
