#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating build environment...');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'src/index.ts',
  'src/models/index.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check if node_modules exists and has required packages
const requiredPackages = [
  'typescript',
  'bullmq',
  'express',
  'sequelize',
  '@types/node'
];

requiredPackages.forEach(pkg => {
  const pkgPath = path.join('node_modules', pkg);
  if (fs.existsSync(pkgPath)) {
    console.log(`✅ ${pkg} installed`);
  } else {
    console.log(`❌ ${pkg} missing`);
    allFilesExist = false;
  }
});

// Check TypeScript version
try {
  const { execSync } = require('child_process');
  const tscVersion = execSync('npx tsc --version', { encoding: 'utf8' }).trim();
  console.log(`✅ TypeScript: ${tscVersion}`);
} catch (error) {
  console.log(`❌ TypeScript not accessible: ${error.message}`);
  allFilesExist = false;
}

if (allFilesExist) {
  console.log('🎉 Build environment validation passed!');
  process.exit(0);
} else {
  console.log('💥 Build environment validation failed!');
  process.exit(1);
} 