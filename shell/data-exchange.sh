#!/bin/bash
export SHLVL=1

# Accept variables with default values if not provided

DATA_EXCHANGE_ENV="${DATA_EXCHANGE_ENV:-PTL}"
BASIC_AUTH_USERNAME="${BASIC_AUTH_USERNAME:-cloud}"
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-cloud}"
DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE:-100}"
DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE:-100}"
DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE:-100}"
DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST="${DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST:-500000}"
DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH="${DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH:-50000}"
DATA_EXCHANGE_CONCRETE_MAX_AMOUNT="${DATA_EXCHANGE_CONCRETE_MAX_AMOUNT:-1}"
DATA_EXCHANGE_DEBUG="${DATA_EXCHANGE_DEBUG:-0}"
DATA_EXCHANGE_THREADS_POST="${DATA_EXCHANGE_THREADS_POST:-12}"

STORE="${STORE:-DE}"

#only for report - does not affect instrumentation behavior
OTEL_TRACES_SAMPLER_ARG="${OTEL_TRACES_SAMPLER_ARG:-0.3}"
OTEL_BSP_MIN_SPAN_DURATION_THRESHOLD="${OTEL_BSP_MIN_SPAN_DURATION_THRESHOLD:-5}"
OTEL_BSP_MIN_CRITICAL_SPAN_DURATION_THRESHOLD="${OTEL_BSP_MIN_CRITICAL_SPAN_DURATION_THRESHOLD:-0}"

N=1

# ACTIVE SET
#testPaths=("tests/dex/tests/setup-warehous-payment-shipping.js" "tests/b2b/bapi/tests/data-exchange-api/tests/post.js" "tests/b2b/bapi/tests/data-exchange-api/tests/generatePatchCandidates.js" "tests/b2b/bapi/tests/data-exchange-api/tests/patchStock.js" "tests/b2b/bapi/tests/data-exchange-api/tests/patchPrices.js")

# Environment variables for Docker commands
commonEnvVars=(
  -e "OTEL_INSTRUMENTATION=$OTEL_INSTRUMENTATION"
  -e "STORE=$STORE"
  -e "DATA_EXCHANGE_ENV=$DATA_EXCHANGE_ENV"
  -e "DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE=$DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE"
  -e "DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE=$DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE"
  -e "DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE=$DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE"
  -e "DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST=$DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST"
  -e "DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH=$DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH"
  -e "DATA_EXCHANGE_THREADS_POST=$DATA_EXCHANGE_THREADS_POST"
  -e "DATA_EXCHANGE_CONCRETE_MAX_AMOUNT=$DATA_EXCHANGE_CONCRETE_MAX_AMOUNT"
  -e "DATA_EXCHANGE_DEBUG=$DATA_EXCHANGE_DEBUG"
  -e "BASIC_AUTH_USERNAME=$BASIC_AUTH_USERNAME"
  -e "BASIC_AUTH_PASSWORD=$BASIC_AUTH_PASSWORD"
)

# start time for rebit mq processing calculation
START_TIME=$(date +%s)

# Array to collect all index_command values per iteration
index_commands=()

scenarios=("PaymentSetup" "ProductCreate")
testPaths=("tests/dex/tests/setup-warehous-payment-shipping.js" "tests/b2b/bapi/tests/data-exchange-api/tests/post.js")
. ./shell/test-executor.sh

# validate rabbit MQ status
#. ./shell/rabbit_check.sh

# Print all collected commands after the script finishes
echo
echo "========================================"
echo "Collected index_command entries (in order):"
echo "========================================"
printf '%s\n' "${index_commands[@]}"

