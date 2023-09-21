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

# Check if the directory is a git repository
if [ ! -d ".git" ]; then
    echo "Error: The specified directory is not a Git repository."
    exit 1
fi

# Get the current commit ID
commit=$(git rev-parse HEAD)

# Get the current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

# Get the remote repository name
remote=$(git config --get remote.origin.url)

# Check if the current commit ID matches a tag and get the tag name if there is a match
tag=$(git describe --tags --exact-match $commit 2>/dev/null)

# Set environment variables
export GIT_HASH="$commit"
export GIT_BRANCH="$branch"
export GIT_REPOSITORY="$remote"
export GIT_TAG="$tag"

echo 'Commit:     ' "$commit"
echo 'Branch:     ' "$branch"
echo 'Repository: ' "$remote"
echo 'Tag:        ' "$tag"

# Construct JSON output
json="{\"commit\": \"$commit\", \"branch\": \"$branch\", \"repository\": \"$remote\", \"tag\": \"$tag\"}"

echo 'JSON:       ' "$json"
