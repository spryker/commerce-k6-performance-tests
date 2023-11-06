# Executing tests

## Introduction

This repository contains a folder `shell` that contains a lot of scripts that help with running tests. The important part is that they must be executed from the project root!

```bash
shell/run-a-single-test.sh
```

## Environment variabales for the K6 Container

The following env vars **MUST** be present **in the K6 container**. Pay attention to the descriptions of them, some of them are very important! The data from those variables is used to generate reports and compare products and versions of them. You must ensure that the data is accurate when providing the result report data to our analytics system!

* **GIT_REPO** (required)- The repository we test, we use it to identify which product we test.
* **GIT_BRANCH** (required) - The branch of the repository.
* **GIT_HASH** (required) - The commit hash ID.
* **GIT_TAG** (optional)- The tag if any was present, **SHOULD** be set. Without it you won't be able to filter your test data later by a convenient Git tag.

## Environment Variables for your System

* **SPRYKER_TEST_RUN_ID** (optional): This **MUST** be a **NEW** UUID version 4 for each test run or you will end up with duplicate identifiers and you won't be able to distinguish different test runs. If not provided a UUID will be generated when running the shell scripts.
* **SPRYKER_TEST_ENVIRONMENT** - The name of the (AWS) environment used e.g. "Production 2.1". This should be an identifier that helps you to identify the environment that was used for the test.

## Running a single test

This is pretty useful for testing scenarious. By running this script it will ask you to input a test file.

```bash
./shell/run-a-single-test <path/to/the/test-file.js>
```

Or simply run it without an argument and the script will ask for an input.

```bash
shell/run-a-single-test.sh
```

## Running all Tests for a Product

Execute this command **from the root of the project!**

```bash
./shell/run-all-b2b-mp-performance-tests.sh
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
