#!/bin/bash
set -e

echo "[pre-commit] Running formatter..."
npx biome check ./src --fix

# Run tests
# echo "[Pre-commit] Running tests..."
# npm run test

# Find modified files
changed_files=$(git diff --name-only)

if [ -n "$changed_files" ]; then
  echo "[pre-commit] Re-staging formatted files..."
  echo "$changed_files" | xargs git add
fi

echo "[pre-commit] Formatted"
exit 0