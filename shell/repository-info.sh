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

# Navigate to the specified directory
cd "$directory" || exit 1

# Get the absolute path of the current directory
current_dir=$(pwd)

# Get the commit ID
commitId=$(git rev-parse HEAD)

# Get the current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

# Get the repository
repository=$(git remote get-url origin)

# Get tag
tags=$(git tag --points-at $commitId)

# Construct JSON output
json="{ \"appName\": \"B2B-MP\", \"commitId\": \"$commitId\", \"branch\": \"$branch\", \"repository\": \"$repository\", \"tags\": \"$tags\" }"

echo "$json"
