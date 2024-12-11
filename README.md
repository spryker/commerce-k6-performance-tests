# Spryker Performance Testing Framework

## Run locally

Enable influxdb and grafana services:
```bash
  docker-compose -f docker-compose.suite.local.yml up -d  influxdb grafana
```
Run single test:
```bash
  ./shell/run-a-single-test-locally.sh tests/suite/sapi/tests/cart-reorder/SUITE-SAPI15-cart-reorder_50.js
```

## Description

This repository contains the test scenarios and helpers that are used to perform different kinds of tests using [K6](https://k6.io/) for Sprykers products. It also provides the infrastructure to run tests against multiple products and share tests that are the same in each product.

## Test Suite Documentation

* [Executing Tests](docs/Executing-Tests.md)
* [Testing different Environments](docs/Testing-different-Environments.md)
  * [Testing Local Environments](docs/Testing-Local-Environments.md)
* [Uploading Test Result Artifacts to S3](docs/Uploading-Results-to-S3.md)
* [ESLint](docs/Eslint.md)
* [Possible Problems and Solutions](docs/Possible-Problems-and-Solutions.md)

## Official K6 Documentation

* [Official K6 documentation](https://k6.io/docs/)
* [Setting up K6](https://k6.io/docs/get-started/installation/)
