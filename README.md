# Spryker Performance Testing Framework

This project contains performance tests for the Spryker Commerce applications using K6.

## Prerequisites

- Node.js & NPM
- Docker & Docker Compose

## Setup

1. Clone the repository:

   ```sh
   git clone <repository-url>
   cd commerce-k6-performance-tests
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file based on the provided `.env.local.example`:

   ```sh
   cp .env.local.example .env
   ```

4. Update the `.env` file with the required environment variables.

## Scripts

### Build

- Build all tests:

  ```sh
  npm run webpack:build
  ```

- Build specific test patterns:
  ```sh
  npm run webpack:build --tags=cart-reorder
  npm run webpack:build --tags=cart,load
  ...
  ```

### Docker

- Start Docker services:

  ```sh
  npm run docker:up
  ```

- Stop Docker services:

  ```sh
  npm run docker:down
  ```

- Run tests in Docker:
  ```sh
  npm run docker:run
  ```

### Linting and Formatting

- Check code formatting:

  ```sh
  npm run prettier:check
  ```

- Fix code formatting:

  ```sh
  npm run prettier:write
  ```

- Lint code:
  ```sh
  npm run lint
  ```

## Running Tests

1. Build the tests:

   ```sh
   npm run webpack:build
   ```

2. Start Docker services:

   ```sh
   npm run docker:up
   ```

3. Run the tests:

   ```sh
   npm run docker:run
   ```

4. Stop Docker services:
   ```sh
   npm run docker:down
   ```

## Configuration

### Environment Variables

- `K6_HOSTENV`: Environment for K6 (default: `local`)
- `K6_NO_THRESHOLDS`: Disable thresholds (default: `true`)
- `SPRYKER_REPOSITORY_ID`: Repository ID (default: `suite`)
- `SPRYKER_TEST_TYPE`: Test type (default: `smoke`)

## Project Structure

- `src/tests`: Contains test files
- `src/utils`: Utility functions
- `src/resources`: API resource files
- `src/pages`: Page objects
- `src/fixtures`: Test data fixtures
- `dist`: Compiled test files

## Using Grafana

Grafana is used to visualize the performance test results.

1. Start the Docker services:

   ```sh
   npm run docker:up
   ```

2. Open Grafana in your browser:

   ```
   http://localhost:3000
   ```

3. Navigate to the dashboards to view the performance metrics.

## License

This project is licensed under the MIT License.
