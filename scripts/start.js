#!/usr/bin/env node

/**
 * Script to run K6 tests in Docker with the ability to override environment variables
 * Usage examples:
 * - npm run start (runs all tests with .env settings)
 * - npm run start --test-type=smoke (overrides SPRYKER_TEST_TYPE to "smoke")
 * - npm run start --repository-id=b2b (overrides SPRYKER_REPOSITORY_ID to "b2b")
 * - npm run start --test-type=smoke --repository-id=b2b (combines both parameters)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Extract environment variable overrides from npm_config environment variables
const testType = process.env.npm_config_test_type;
const repositoryId = process.env.npm_config_repository_id;

if (testType) {
  console.log(`Test type detected from npm config: ${testType}`);
}

if (repositoryId) {
  console.log(`Repository ID detected from npm config: ${repositoryId}`);
}

// Prepare environment variables to pass to Docker
const envVars = [];

// Add test type override if provided
if (testType) {
  envVars.push(`SPRYKER_TEST_TYPE=${testType}`);
}

// Add repository ID override if provided
if (repositoryId) {
  envVars.push(`SPRYKER_REPOSITORY_ID=${repositoryId}`);
}

// Find all test files in the dist directory
try {
  // Check if dist directory exists
  if (!fs.existsSync(path.join(process.cwd(), 'dist'))) {
    console.error('Error: dist directory not found. Make sure to run "npm run build" first.');
    process.exit(1);
  }

  // Get all test files
  const testFiles = findTestFiles(path.join(process.cwd(), 'dist'));

  if (testFiles.length === 0) {
    console.error('No test files found in dist directory. Make sure to run "npm run build" first.');
    process.exit(1);
  }

  // Run each test file in Docker
  testFiles.forEach(testFile => {
    const envString = envVars.length > 0 ? `-e ${envVars.join(' -e ')} ` : '';
    // Determine the Docker Compose file based on the repository ID
    const composeFile = determineComposeFile(repositoryId);
    const dockerCommand = `docker-compose -f ${composeFile} run --rm ${envString}k6 run /${path.relative(process.cwd(), testFile)}`;

    console.log(`Executing: ${dockerCommand}`);

    try {
      execSync(dockerCommand, { stdio: 'inherit' });
    } catch (error) {
      console.error(`Error running test ${testFile}:`, error.message);
    }
  });

  console.log('All tests completed');
} catch (error) {
  console.error('Error running tests:', error.message);
  process.exit(1);
}

/**
 * Find all test files in a directory recursively
 * @param {string} dir - Directory to search
 * @returns {string[]} - Array of test file paths
 */
function findTestFiles(dir) {
  let results = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(findTestFiles(fullPath));
    } else if (entry.name.endsWith('.test.js')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Determine which Docker Compose file to use based on repository ID
 * @param {string} repoId - Repository ID (from command line or .env)
 * @returns {string} - Docker Compose file path
 */
function determineComposeFile(repoId) {
  // If no repository ID is provided via command line, check the environment variable
  if (!repoId) {
    repoId = process.env.SPRYKER_REPOSITORY_ID;
  }

  // Map repository ID to the appropriate Docker Compose file
  switch (repoId) {
    case 'b2b':
      return 'docker-compose.b2b.yml';
    case 'b2b-mp':
      return 'docker-compose.b2b-mp.yml';
    case 'suite':
    default:
      return 'docker-compose.suite.yml';
  }
}
