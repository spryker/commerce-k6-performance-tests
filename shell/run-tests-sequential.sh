#!/bin/bash

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
echo "docker-compose run --rm k6 run $@ $relative_path"
  # Run k6 on the current file using its original path
  docker-compose run --rm k6 run $@ "$relative_path"
  wait
done
