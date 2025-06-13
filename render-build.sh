#!/usr/bin/env bash
set -e

echo "📦 Forcing NPM usage instead of Bun..."
export BUN_INSTALL=0
export DISABLE_BUN=1
export SKIP_BUN=1
export USE_NPM=1
export PACKAGE_MANAGER=npm

echo "🛠️ Installing dependencies with npm..."
npm install --verbose

echo "📦 Compiling TypeScript..."
npx tsc 