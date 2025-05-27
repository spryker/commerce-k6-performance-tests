#!/usr/bin/env node

/**
 * Dynamic build script for K6 performance tests
 * Usage examples:
 * - npm run build (builds all tests)
 * - npm run build --tags=smoke,checkout (builds only tests that have BOTH smoke AND checkout tags)
 * - npm run build --tags=load (builds all tests with load tag)
 */

const { execSync } = require('child_process');

// Extract tags from npm_config environment variables
const npmConfigTags = process.env.npm_config_tags;
let tags = [];

if (npmConfigTags) {
  tags = npmConfigTags.split(',');
  console.log(`Tags detected from npm config: ${tags.join(', ')}`);
}

// Build the webpack command
let webpackCommand = 'webpack';

// Default to all test files
webpackCommand += ' --env entryPattern=./src/tests/**/*.test.js';

// Add tags filtering if provided
if (tags.length > 0) {
  webpackCommand += ` --env entryTags=${tags.join(',')}`;
}

console.log(`Executing: ${webpackCommand}`);

try {
  // Execute the webpack command
  execSync(webpackCommand, { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
