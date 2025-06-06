#!/usr/bin/env node

/**
 * Docker utilities for K6 tests
 *
 * This script provides functionality for:
 * 1. Determining which docker-compose file to use based on repository ID
 * 2. Running K6 tests in Docker with the ability to override environment variables
 *
 * Usage examples:
 * - npm run docker:up (starts docker containers using repository ID)
 * - npm run docker:up --repository-id=b2b (overrides SPRYKER_REPOSITORY_ID to "b2b")
 *
 * - npm run docker:down (stops docker containers)
 * - npm run docker:down --repository-id=b2b (overrides SPRYKER_REPOSITORY_ID to "b2b")
 *
 * - npm run docker:run (runs all tests with .env settings)
 * - npm run docker:run --test-type=smoke (overrides SPRYKER_TEST_TYPE to "smoke")
 * - npm run docker:run --repository-id=b2b (overrides SPRYKER_REPOSITORY_ID to "b2b")
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// =============================================
// Docker Compose File Handling
// =============================================

/**
 * Parse command line arguments to get repository-id
 * @returns {string|null} - Repository ID from command line or null
 */
function parseRepositoryIdArg() {
  // First priority: Check npm_config variables (these are set when using --flag directly with npm run)
  if (process.env.npm_config_repository_id) {
    return process.env.npm_config_repository_id;
  }

  // Second priority: Check for npm_package_config if repository-id was specified in package.json config
  if (process.env.npm_package_config_repository_id) {
    return process.env.npm_package_config_repository_id;
  }

  // Third priority: Check command line args (needed when script is called directly)
  const args = process.argv.slice(2);
  let repositoryId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--repository-id=')) {
      repositoryId = args[i].split('=')[1];
      break;
    }
  }

  return repositoryId;
}

/**
 * Get docker-compose file based on repository ID
 * @returns {string} - Docker Compose file name
 */
function getDockerComposeFile() {
  // New logic: check K6_HOSTENV and SPRYKER_REPOSITORY_ID
  const k6HostEnv = process.env.K6_HOSTENV;
  const repositoryId = parseRepositoryIdArg();
  const envRepositoryId = process.env.REPOSITORY_ID || process.env.SPRYKER_REPOSITORY_ID || 'suite';
  const selectedId = repositoryId || envRepositoryId;

  // Compose possible filenames
  let dockerComposeFile = null;
  if (k6HostEnv) {
    // Try most specific: docker-compose.<K6_HOSTENV>.<REPO_ID>.yml
    const candidate = `docker-compose.${k6HostEnv}.${selectedId}.yml`;
    const candidatePath = path.resolve(process.cwd(), candidate);
    if (fs.existsSync(candidatePath)) {
      dockerComposeFile = candidate;
      console.log(`Using docker compose file: ${candidate}`);
    }
  }
  // Fallback: docker-compose.<REPO_ID>.yml
  if (!dockerComposeFile) {
    const fallback = `docker-compose.${selectedId}.yml`;
    const fallbackPath = path.resolve(process.cwd(), fallback);
    if (fs.existsSync(fallbackPath)) {
      dockerComposeFile = fallback;
      console.log(`Using docker compose file: ${fallback} (from repository)`);
    }
  }
  // If still not found, error
  if (!dockerComposeFile) {
    console.error(`Error: Docker compose file not found for K6_HOSTENV='${k6HostEnv}', REPOSITORY_ID='${selectedId}'.`);
    process.exit(1);
  }
  return dockerComposeFile;
}

/**
 * Execute docker-compose up command
 */
function dockerComposeUp() {
  const dockerComposeFile = getDockerComposeFile();
  const k6HostEnv = process.env.K6_HOSTENV;

  // For staging environment, only start k6 (no influxdb/grafana)
  // For other environments (like local), start all services
  const command = k6HostEnv === 'staging'
    ? `docker-compose -f ${dockerComposeFile} up -d k6`
    : `docker-compose -f ${dockerComposeFile} up -d influxdb grafana`;

  console.log(`Executing: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('Docker containers started successfully');
  } catch (error) {
    console.error('Error starting Docker containers:', error.message);
    process.exit(1);
  }
}

/**
 * Execute docker-compose down command
 */
function dockerComposeDown() {
  const dockerComposeFile = getDockerComposeFile();
  const command = `docker-compose -f ${dockerComposeFile} down -v --remove-orphans`;

  console.log(`Executing: ${command}`);

  try {
    execSync(command, { stdio: 'inherit' });
    console.log('Docker containers stopped successfully');
  } catch (error) {
    console.error('Error stopping Docker containers:', error.message);
    process.exit(1);
  }
}

// =============================================
// Test Runner Functionality
// =============================================

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
 * Run K6 tests using Docker
 */
function runTests() {
  // Extract environment variable overrides from npm_config environment variables
  const testType = process.env.npm_config_test_type;

  if (testType) {
    console.log(`Test type detected from npm config: ${testType}`);
  }

  // Prepare environment variables to pass to Docker
  const envVars = [];

  // Add test type override if provided
  if (testType) {
    envVars.push(`SPRYKER_TEST_TYPE=${testType}`);
  }

  // Get repository ID and add it as an environment variable if provided
  const repositoryId = parseRepositoryIdArg();
  if (repositoryId) {
    envVars.push(`SPRYKER_REPOSITORY_ID=${repositoryId}`);
  }

  // Create output directory for CSV files if it doesn't exist
  const outputDir = path.join(process.cwd(), 'output', 'csv');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory for CSV files: ${outputDir}`);
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
      const dockerComposeFile = getDockerComposeFile();

      // Generate timestamp and test name for unique CSV filename
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const testName = path.basename(testFile, '.test.js');
      const csvFilename = `${testName}_${timestamp}.csv`;
      const csvOutputPath = path.join('output', 'csv', csvFilename);

      // Mount the output directory for CSV files
      const volumeMount = `-v ${path.join(process.cwd(), 'output')}:/output`;

      // Add output options
      const k6HostEnv = process.env.K6_HOSTENV;
      const useCSV = process.env.K6_CSV_OUTPUT === 'true' || process.env.K6_CSV_OUTPUT === '1';

      // Base command
      let dockerCommand = '';
      if (useCSV) {
        dockerCommand = `docker-compose -f ${dockerComposeFile} run --rm ${volumeMount} ${envString}k6 run /${path.relative(process.cwd(), testFile)}`;
      } else {
        dockerCommand = `docker-compose -f ${dockerComposeFile} run --rm k6 run /${path.relative(process.cwd(), testFile)}`;
      }

      // Output flags
      let outputFlags = [];

      // Add existing outputs
      if (k6HostEnv === 'staging' && process.env.K6_OUT) {
        outputFlags.push(process.env.K6_OUT);
      }

      // Add CSV output
      if (useCSV) {
        outputFlags.push(`csv=/output/csv/${csvFilename}`);
        console.log(`CSV output will be saved to: ${csvOutputPath}`);
      }

      // Add output flags to command
      if (outputFlags.length > 0) {
        dockerCommand += ` --out ${outputFlags.join(',')}`;
      }

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
}

// =============================================
// Command Line Interface
// =============================================

// Process command-line arguments to determine which function to run
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'up':
      dockerComposeUp();
      break;
    case 'down':
      dockerComposeDown();
      break;
    case 'run':
      runTests();
      break;
    default:
      console.log(`
Docker Utilities for K6 Tests

Usage:
  node docker.js up           - Start Docker containers
  node docker.js down         - Stop Docker containers
  node docker.js run          - Run all tests

Options:
  --repository-id=<id>  - Specify repository ID (suite, b2b, or b2b-mp)
  --test-type=<type>    - Specify test type (for 'run' command)
      `);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
} else {
  // Export functions for use in other scripts
  module.exports = {
    getDockerComposeFile,
    dockerComposeUp,
    dockerComposeDown,
    runTests
  };
}
