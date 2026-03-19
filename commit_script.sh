#!/bin/bash

BRANCH="upgrade-mainnet-test"

# Get a list of untracked and modified files
FILES=$(git ls-files --others --exclude-standard --modified)

# Convert to array
FILES_ARRAY=($FILES)
TOTAL_FILES=${#FILES_ARRAY[@]}

if [ $TOTAL_FILES -eq 0 ]; then
    echo "No files to commit."
    exit 0
fi

# Make sure we're on the right branch
git checkout $BRANCH

# Iterate through files in chunks of 4 (maximum)
for (( i=0; i<$TOTAL_FILES; i+=4 )); do
    CHUNK=("${FILES_ARRAY[@]:$i:4}")
    
    # Stage the chunk
    git add "${CHUNK[@]}"
    
    # Create commit message based on the files
    COMMIT_MSG="Update: "
    for file in "${CHUNK[@]}"; do
        COMMIT_MSG+="$(basename "$file"), "
    done
    COMMIT_MSG=${COMMIT_MSG%, } # Remove trailing comma and space
    
    # Commit
    git commit -m "$COMMIT_MSG"
    
    # Push
    git push origin $BRANCH
    
    # Wait 4 minutes if there are more files
    if [ $((i + 4)) -lt $TOTAL_FILES ]; then
        echo "Waiting 4 minutes before next batch..."
        sleep 240
    fi
done

echo "Done."
EOF
chmod +x commit_script.sh
./commit_script.sh
