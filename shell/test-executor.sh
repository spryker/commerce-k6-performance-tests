#!/bin/bash
echo "Starting test executor script..."
set +x

for ((i=1; i<=N; i++))
do
#  startDate=$(date -u +"%Y-%m-%d %H:%M")
  for idx in "${!scenarios[@]}"; do
    startDate=$(TZ="Europe/Berlin" date +"%Y-%m-%d %H:%M")
    scenario="${scenarios[$idx]}"
    testPath="${testPaths[$idx]}"

    # Command to run k6 test --build
    k6_command="docker-compose -f docker-compose.local.yml run --rm  ${commonEnvVars[@]} k6 run -e SUMMARY_SCENARIO_NAME=\"$scenario\" \"$testPath\""

    # Print and run k6 test command
    echo "Running k6 test command:"
    echo "$k6_command"
    eval "$k6_command"
    [ ! -f final.csv ] && cp report.csv final.csv || (echo >> final.csv && tail -n +2 report.csv >> final.csv)

    # Pause before the next iteration
    sleep 60
    endDate=$(TZ="Europe/Berlin" date +"%Y-%m-%d %H:%M")
    echo "./shell/grafana-stats.sh --from \"$startDate\" --till \"$endDate\" --scenario \"$scenario\""
#    ./shell/grafana-stats.sh --from "$startDate" --till "$endDate" --scenario "$scenario"
  done
done
