#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Constants
const CSV_FOLDER = path.join(__dirname, '../output/csv');
const DEFAULT_METRICS = [
  'http_reqs', 'http_req_duration', 'http_req_blocked', 'http_req_connecting',
  'http_req_tls_handshaking', 'http_req_sending', 'http_req_waiting',
  'http_req_receiving', 'http_req_failed', 'checks', 'data_received',
  'data_sent', 'iteration_duration', 'iterations', 'vus', 'vus_max',
  'group_duration'
];

// Metrics to always include, even if they're in DEFAULT_METRICS
const INCLUDE_METRICS = ['errors'];

// Function to check if a metric is a custom metric
function isCustomMetric(metricName) {
  // Skip the 'errors' metric itself but keep the errors column for other metrics
  if (metricName === 'errors') {
    return false;
  }

  // Include other metrics that match our custom pattern
  return !DEFAULT_METRICS.includes(metricName);
}

// Function to process a single CSV file
function processCSVFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });

  // Group metrics by name and tag
  const metricsMap = new Map();
  const errorsCountMap = new Map(); // Track error counts per metric

  // First, identify all custom metrics we need to track
  records.forEach(record => {
    const { metric_name } = record;

    // Skip 'errors' metric itself for now
    if (metric_name === 'errors') {
      return;
    }

    // Add custom metrics to our tracking
    if (!DEFAULT_METRICS.includes(metric_name)) {
      if (!metricsMap.has(metric_name)) {
        metricsMap.set(metric_name, []);
        errorsCountMap.set(metric_name, 0);
      }
    }
  });

  // Now process all records
  records.forEach(record => {
    const { metric_name, metric_value, group } = record;

    // Handle the errors metric specially
    if (metric_name === 'errors') {
      // Find the associated custom metric for this group
      for (const [customMetric, _] of metricsMap.entries()) {
        // Match by group if available
        if (group && record.group === group) {
          errorsCountMap.set(customMetric, errorsCountMap.get(customMetric) + parseFloat(metric_value));
          break;
        }
      }
      return;
    }

    // Process custom metrics
    if (metricsMap.has(metric_name)) {
      metricsMap.get(metric_name).push(parseFloat(metric_value));
    }
  });

  // Calculate statistics for each metric
  const metricsStats = [];

  for (const [metric, values] of metricsMap.entries()) {
    // Skip empty metrics
    if (values.length === 0) continue;

    // Sort values for percentile calculations
    values.sort((a, b) => a - b);

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = values[0];
    const max = values[values.length - 1];
    const med = values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

    // Calculate percentiles
    const p90Index = Math.ceil(values.length * 0.9) - 1;
    const p95Index = Math.ceil(values.length * 0.95) - 1;

    const p90 = values[p90Index];
    const p95 = values[p95Index];

    // Get error count for this metric
    const errorCount = errorsCountMap.get(metric) || 0;

    metricsStats.push({
      metric,
      avg: Math.floor(avg),
      min: Math.floor(min),
      med: Math.floor(med),
      max: Math.floor(max),
      p90: Math.floor(p90),
      p95: Math.floor(p95),
      errors: Math.floor(errorCount)
    });
  }

  return metricsStats;
}

// Main function
function main() {
  try {
    // Check if the CSV folder exists
    if (!fs.existsSync(CSV_FOLDER)) {
      console.error(`Error: CSV folder does not exist: ${CSV_FOLDER}`);
      process.exit(1);
    }

    // Get all CSV files
    const csvFiles = fs.readdirSync(CSV_FOLDER)
      .filter(file => file.endsWith('.csv'))
      .map(file => path.join(CSV_FOLDER, file));

    if (csvFiles.length === 0) {
      console.error(`Error: No CSV files found in ${CSV_FOLDER}`);
      process.exit(1);
    }

    // Process all CSV files and combine results
    let allMetricsStats = [];

    csvFiles.forEach(csvFile => {
      console.log(`Processing file: ${path.basename(csvFile)}`);
      const metricsStats = processCSVFile(csvFile);
      console.log(`Found ${metricsStats.length} custom metrics in this file`);
      allMetricsStats = [...allMetricsStats, ...metricsStats];
    });

    console.log(`Total custom metrics found: ${allMetricsStats.length}`);

    // Sort metrics by name
    allMetricsStats.sort((a, b) => a.metric.localeCompare(b.metric));

    // Generate the CSV output
    const header = 'metric,avg,min,med,max,p(90),p(95),errors';
    const rows = allMetricsStats.map(stat =>
      `${stat.metric},${stat.avg},${stat.min},${stat.med},${stat.max},${stat.p90},${stat.p95},${stat.errors}`
    );

    const csvContent = [header, ...rows].join('\n');

    // Output file path
    const outputFilePath = path.join(__dirname, '../output/metrics_table.csv');

    // Save to file
    fs.writeFileSync(outputFilePath, csvContent);
    console.log(`\nCSV file saved to: ${outputFilePath}`);

    // Also print to console
    console.log('\n' + csvContent);

    console.log('\nThe table above can be copied and pasted directly into Google Sheets.');
    console.log('Alternatively, you can import the saved CSV file into Google Sheets.');

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
