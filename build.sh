#!/bin/bash
set -e

echo "==> Forcing npm usage, disabling Bun"
export BUN_INSTALL=0
export DISABLE_BUN=1
export SKIP_BUN=1
export USE_NPM=1
export PACKAGE_MANAGER=npm

echo "==> Node.js version:"
node --version

echo "==> npm version:"
npm --version

echo "==> Installing dependencies with npm..."
npm install --verbose

echo "==> Building project..."
npm run build:production

echo "==> Build completed successfully!" 