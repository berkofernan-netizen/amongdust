#!/bin/bash

# Auto commit script for Among Us Clone development
# Usage: ./git-auto-commit.sh "commit message"

if [ $# -eq 0 ]; then
    echo "Usage: $0 \"commit message\""
    exit 1
fi

commit_message="$1"

echo "🔄 Adding all changes to git..."
git add .

echo "📝 Committing changes..."
git commit -m "$commit_message"

echo "⬆️ Pushing to remote repository..."
git push origin $(git branch --show-current)

echo "✅ Changes successfully committed and pushed to GitHub!"
git log --oneline -1