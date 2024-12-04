# Executing tests

## Introduction

This repository contains a folder `shell` that contains a lot of scripts that help with running tests. The important part is that they must be executed from the project root!

```bash
./shell/run-a-single-test.sh <path/to/the/test-file.js>
```

Or run all tests for a product.

```bash
./shell/run-all-b2b_mp-performance-tests.sh
```

## Environment variables for the k6 Container

The following env vars **MUST** be present **in the k6 container**. Pay attention to the descriptions of them, some of them are very important! The data from those variables is used to generate reports and compare products and versions of them. You must ensure that the data is accurate when providing the result report data to our analytics system!

* **GIT_REPO** (required)- The repository we test, we use it to identify which product we test.
* **GIT_BRANCH** (required) - The branch of the repository.
* **GIT_HASH** (required) - The commit hash ID.
* **GIT_TAG** (optional) - The tag if any was present, **SHOULD** be set. Without it you won't be able to filter your test data later by a convenient Git tag.

### Automatically passed to the k6 Container

* **SPRYKER_TEST_RUNNER_HOSTNAME** is automatically passed to the k6 container and built as part of the command inside `build_k6_docker_command()`. The data is also stored in the test results to provide the possibility to identify a test run that was executed on a specific system. This can be for example useful in the case data was accidentally mixed.
* **SPRYKER_TEST_PATH** is used to generate a failed threshold file to create a Slack notification.


## Environment Variables for your System

* **SPRYKER_TEST_RUN_ID** (optional): This **MUST** be a **NEW** UUID version for each test run or you will end up with duplicate identifiers and you won't be able to distinguish different test runs. If not provided a UUID will be generated when running the shell scripts.

* **K6_HOSTENV** - (**testing** and **local** values are supported) This variable is used to specify the environment for which the test is being run. The value of this variable can be used in the test script to configure different behavior for different environments.
* **SLACK_NOTIFICATION_TOKEN** (required for **testing** environment): Slack API token which is used to notify about failing thresholds.
* **SLACK_NOTIFICATION_CHANNEL** (required for **testing** environment): Slack channel which a failing thresholds notification is sent to.
* **GIT_REPO** (required for **testing** environment)- The repository we test, we use it to identify which product we test.
* **GIT_BRANCH** (required for **testing** environment) - The branch of the repository.
* **GIT_HASH** (required for **testing** environment) - The commit hash ID.
* **BASIC_AUTH_USERNAME** (required for **testing** environment) - Basic authentication username.
* **BASIC_AUTH_PASSWORD** (required for **testing** environment) - Basic authentication password.

## Running a single test

This is pretty useful for testing scenarious. By running this script it will ask you to input a test file.

```bash
./shell/run-a-single-test <path/to/the/test-file.js>
```

Or simply run it without an argument and the script will ask for an input.

```bash
./shell/run-a-single-test.sh
```

## Running all Tests for a Product

Execute this command **from the root of the project!**

```bash
./shell/run-all-b2b_mp-performance-tests.sh
```

It is important to execute it from the root! If not the paths in the scripts will break. This bash script will find all test files in all products and then execute them one after another.

There is one shell script file per product, following this pattern:

```bash
./shell/run-all-<product>-<test-type>-tests.sh
```

### Adding more applications/layer tests of a product

Each of the scripts to run tests for a product has a section like this, that find all the test files in the given folder.

The example below has just SAPI and Storefront tests, to add BAPI tests

```bash
# Create arrays for file lists
filesDirectory1=($(find "tests/b2b-mp/sapi/tests" -name '*.js' -type f))
filesDirectory2=($(find "tests/b2b-mp/storefront/tests" -name '*.js' -type f))
```

To add BAPI tests you would have to add this line

```bash
filesDirectory3=($(find "tests/b2b-mp/storefront/tests" -name '*.js' -type f))
``` 

and also add the new variable `filesDirectory3` here:

```bash
files=("${filesDirectory1[@]}" "${filesDirectory2[@]}" "${filesDirectory3[@]}")
```
