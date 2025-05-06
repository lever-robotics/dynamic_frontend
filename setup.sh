#!/bin/bash

echo "Setting up project..."

# Install Git hooks
./scripts/install_hooks.sh

# Install dependencies
echo "Installing dependencies..."
npm install

# (Optional) Install other dependencies, setup env, etc
