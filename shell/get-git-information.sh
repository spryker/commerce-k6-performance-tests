# Get the current commit ID
commit=$(git rev-parse HEAD)

# Get the current branch name
branch=$(git rev-parse --abbrev-ref HEAD)

# Get the remote repository name
remote=$(git remote get-url origin)

# Check if the current commit ID matches a tag and get the tag name if there is a match
tag=$(git tag --points-at $commit)

# Set environment variables
export GIT_HASH=$commit
export GIT_BRANCH=$branch
export GIT_REPOSITORY=$remote
export GIT_TAG=$tag

echo $commit
echo $branch
echo $remote
echo $tag
