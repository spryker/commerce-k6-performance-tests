#!/bin/bash

# Accept variables with default values if not provided
DATA_EXCHANGE_ENV="${DATA_EXCHANGE_ENV:-PTL}"
BASIC_AUTH_USERNAME="${BASIC_AUTH_USERNAME:-cloud}"
BASIC_AUTH_PASSWORD="${BASIC_AUTH_PASSWORD:-cloud}"
DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE:-100}"
DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE:-100}"
DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE="${DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE:-100}"
DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST="${DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST:-50000}"
DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH="${DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH:-50000}"
DATA_EXCHANGE_CONCRETE_MAX_AMOUNT="${DATA_EXCHANGE_CONCRETE_MAX_AMOUNT:-1}"
DATA_EXCHANGE_DEBUG="${DATA_EXCHANGE_DEBUG:-0}"

STORE="${STORE:-DE}"
# Record the start time
N=1

# ACTIVE SET
scenarios=("PaymentSetup" "ProductCreate")
testPaths=("tests/dex/tests/setup-warehous-payment-shipping.js" "tests/b2b/bapi/tests/data-exchange-api/tests/post.js")

# Environment variables for Docker commands
commonEnvVars=(
  "-e OTEL_INSTRUMENTATION=\"$OTEL_INSTRUMENTATION\""
  "-e STORE=\"$STORE\""
  "-e DATA_EXCHANGE_ENV=\"$DATA_EXCHANGE_ENV\""
  "-e DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE=\"$DATA_EXCHANGE_PAYLOAD_CHUNK_SIZE\""
  "-e DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE=\"$DATA_EXCHANGE_PAYLOAD_PATCH_CHUNK_SIZE\""
  "-e DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE=\"$DATA_EXCHANGE_PAYLOAD_PUT_CHUNK_SIZE\""
  "-e DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST=\"$DATA_EXCHANGE_TARGET_CATALOG_SIZE_POST\""
  "-e DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH=\"$DATA_EXCHANGE_TARGET_CATALOG_SIZE_PUT_PATCH\""
  "-e DATA_EXCHANGE_CONCRETE_MAX_AMOUNT=\"$DATA_EXCHANGE_CONCRETE_MAX_AMOUNT\""
  "-e DATA_EXCHANGE_DEBUG=\"$DATA_EXCHANGE_DEBUG\""
  "-e BASIC_AUTH_USERNAME=\"$BASIC_AUTH_USERNAME\""
  "-e BASIC_AUTH_PASSWORD=\"$BASIC_AUTH_PASSWORD\""
)

for ((i=1; i<=N; i++))
do
  for idx in "${!scenarios[@]}"; do
    scenario="${scenarios[$idx]}"
    testPath="${testPaths[$idx]}"

    # Command to run k6 test
    k6_command="docker-compose -f docker-compose.local.yml run --rm --build ${commonEnvVars[@]} k6 run -e SUMMARY_SCENARIO_NAME=\"$scenario\" \"$testPath\""

    # Print and run k6 test command
    echo "Running k6 test command:"
    echo "$k6_command"
    eval "$k6_command"
  done

  # Pause before the next iteration
  sleep 60
done
