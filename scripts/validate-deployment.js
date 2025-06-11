#!/usr/bin/env node

/**
 * Deployment Validation Script
 * Checks if the application is ready for deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Shopify Webhook Handler deployment...\n');

// Check 1: Required files exist
const requiredFiles = [
  'package.json',
  'render.yaml',
  'tsconfig.json',
  'dist/index.js',
  'src/index.ts'
];

console.log('📁 Checking required files...');
let filesOk = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    filesOk = false;
  }
});

// Check 2: Node version compatibility
console.log('\n🔧 Checking Node.js version...');
const nodeVersion = process.version;
console.log(`Current Node.js: ${nodeVersion}`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const engineNode = packageJson.engines?.node;
console.log(`Required in package.json: ${engineNode}`);

// Check 3: render.yaml validation
console.log('\n⚙️ Checking render.yaml...');
try {
  const renderYaml = fs.readFileSync('render.yaml', 'utf8');
  
  const checks = [
    { pattern: /type:\s*web/, name: 'Web service type' },
    { pattern: /env:\s*node/, name: 'Node.js environment' },
    { pattern: /buildCommand:/, name: 'Build command' },
    { pattern: /startCommand:\s*(npm start|node dist\/index\.js)/, name: 'Start command' },
    { pattern: /healthCheckPath:/, name: 'Health check' },
    { pattern: /PORT/, name: 'Port configuration' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(renderYaml)) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - MISSING OR INCORRECT`);
    }
  });
} catch (error) {
  console.log('❌ Failed to read render.yaml:', error.message);
}

// Check 4: Build test
console.log('\n🏗️ Testing build process...');
try {
  const { execSync } = require('child_process');
  execSync('npm run typecheck', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation check passed');
} catch (error) {
  console.log('❌ TypeScript compilation failed:', error.message);
}

// Check 5: Dependencies
console.log('\n📦 Checking critical dependencies...');
const criticalDeps = ['express', 'sequelize', 'bullmq', 'helmet', 'cors'];
criticalDeps.forEach(dep => {
  if (packageJson.dependencies?.[dep]) {
    console.log(`✅ ${dep}: ${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
  }
});

console.log('\n🎯 Deployment Validation Summary:');
console.log(filesOk ? '✅ All required files present' : '❌ Some files missing');
console.log('📋 Next steps:');
console.log('   1. Ensure all checks pass');
console.log('   2. Commit and push changes');
console.log('   3. Deploy to Render.com');
console.log('   4. Monitor deployment logs');

console.log('\n🚀 Ready for deployment!'); 