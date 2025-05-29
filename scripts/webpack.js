#!/usr/bin/env node

/**
 * Dynamic build script for K6 performance tests
 * Usage examples:
 * - npm run webpack:build (builds all tests)
 * - npm run webpack:build --tags=smoke,checkout (builds only tests that have BOTH smoke AND checkout tags)
 * - npm run webpack:build --tags=load (builds all tests with load tag)
 * - npm run webpack:build --test-type=smoke (overrides SPRYKER_TEST_TYPE from .env with "smoke")
 * - npm run webpack:build --repository-id=b2b (overrides SPRYKER_REPOSITORY_ID from .env with "b2b")
 * - npm run webpack:build --tags=cart --test-type=smoke --repository-id=b2b (combines all parameters)
 */

const { execSync } = require('child_process');

const npmConfigTags = process.env.npm_config_tags;
let tags = [];

if (npmConfigTags) {
  tags = npmConfigTags.split(',');
  console.log(`Tags detected from npm config: ${tags.join(', ')}`);
}

const testType = process.env.npm_config_test_type;
if (testType) {
  console.log(`Test type detected from npm config: ${testType}`);
  process.env.SPRYKER_TEST_TYPE = testType;
}

const repositoryId = process.env.npm_config_repository_id;
if (repositoryId) {
  console.log(`Repository ID detected from npm config: ${repositoryId}`);
  process.env.SPRYKER_REPOSITORY_ID = repositoryId;
}

let webpackCommand = 'webpack';

if (tags.length > 0) {
  webpackCommand += ` --env entryTags=${tags.join(',')}`;
}

if (testType) {
  webpackCommand += ` --env testType=${testType}`;
}

if (repositoryId) {
  webpackCommand += ` --env repositoryId=${repositoryId}`;
}

console.log(`Executing: ${webpackCommand}`);

try {
  execSync(webpackCommand, { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
