#!/bin/bash

HOOKS_DIR="$(pwd)/hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

echo "Installing Git hooks..."

for hook in "$HOOKS_DIR"/*; do
  hook_name=$(basename -s .sh "$hook")
  cp "$hook" "$GIT_HOOKS_DIR/$hook_name"
  chmod +x "$GIT_HOOKS_DIR/$hook_name"
  echo "Installed $hook_name"
done

echo "Git hooks installed."