function updateMasterTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName("Master");
  const sheets = ss.getSheets();

  // Filter out "Master", get only date-named sheets
  const runSheets = sheets
    .filter(s => /^\d{2}\.\d{2}\.\d{4}$/.test(s.getName()))
    .sort((a, b) => {
      const aDate = new Date(a.getName().split('.').reverse().join('/'));
      const bDate = new Date(b.getName().split('.').reverse().join('/'));
      return bDate - aDate; // descending
    });

  if (runSheets.length < 2) {
    SpreadsheetApp.getUi().alert("At least two test run tabs are required to calculate deltas.");
    return;
  }

  const latest = runSheets[0];   // newest
  const previous = runSheets[1]; // second newest

  const latestName = latest.getName();
  const previousName = previous.getName();

  const latestData = latest.getDataRange().getValues();
  const prevData = previous.getDataRange().getValues();
  const masterData = masterSheet.getDataRange().getValues();
  const header = masterData[0];

  // Update dynamic headers
  header[5] = `Current Avg (${latestName})`;
  header[6] = `Current Med (${latestName})`;
  header[7] = `Current Errors (${latestName})`;
  header[8] = `Prev Avg (${previousName})`;
  header[9] = `Prev Med (${previousName})`;
  header[10] = `Prev Errors (${previousName})`;
  header[11] = 'Δ Avg';
  header[12] = 'Δ Median';
  header[13] = 'Δ Errors';

  const metricColIndex = {
    metric: 0,
    avg: 1,
    med: 3,
    errors: 7
  };

  const updatedData = [header];

  for (let i = 1; i < masterData.length; i++) {
    const row = [...masterData[i]];
    const metricName = row[4]; // Column E = Metric Name

    const latestRow = latestData.find(r => r[metricColIndex.metric] === metricName);
    const prevRow = prevData.find(r => r[metricColIndex.metric] === metricName);

    let avg = '', med = '', err = '';
    let prevAvg = '', prevMed = '', prevErr = '';
    let deltaAvg = '', deltaMed = '', deltaErr = '';

    if (latestRow) {
      avg = parseFloat(latestRow[metricColIndex.avg]) || 0;
      med = parseFloat(latestRow[metricColIndex.med]) || 0;
      err = parseFloat(latestRow[metricColIndex.errors]) || 0;
    }

    if (prevRow) {
      prevAvg = parseFloat(prevRow[metricColIndex.avg]) || 0;
      prevMed = parseFloat(prevRow[metricColIndex.med]) || 0;
      prevErr = parseFloat(prevRow[metricColIndex.errors]) || 0;
    }

    if (latestRow && prevRow) {
      deltaAvg = formatDelta(avg - prevAvg);
      deltaMed = formatDelta(med - prevMed);
      deltaErr = formatDelta(err - prevErr);
    }

    row[5] = avg !== '' ? avg : '';
    row[6] = med !== '' ? med : '';
    row[7] = err !== '' ? err : '';
    row[8] = prevAvg !== '' ? prevAvg : '';
    row[9] = prevMed !== '' ? prevMed : '';
    row[10] = prevErr !== '' ? prevErr : '';
    row[11] = deltaAvg;
    row[12] = deltaMed;
    row[13] = deltaErr;

    updatedData.push(row);
  }

  masterSheet.getRange(1, 1, updatedData.length, updatedData[0].length).setValues(updatedData);

  applyConditionalFormatting(masterSheet, updatedData.length);
}

function formatDelta(delta) {
  if (delta === 0) return '0';
  return (delta > 0 ? '+' : '') + delta.toFixed(0);
}

function applyConditionalFormatting(sheet, rowCount) {
  const rules = [];

  const deltaAvgRange = sheet.getRange(2, 12, rowCount - 1, 1);   // Δ Avg - Col L
  const deltaMedRange = sheet.getRange(2, 13, rowCount - 1, 1);  // Δ Median - Col M
  const deltaErrRange = sheet.getRange(2, 14, rowCount - 1, 1);  // Δ Errors - Col N

  rules.push(
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(L2) > 0.1 * F2')
      .setBackground("#f4cccc")
      .setRanges([deltaAvgRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(L2) < -0.1 * F2')
      .setBackground("#d9ead3")
      .setRanges([deltaAvgRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(M2) > 0.1 * G2')
      .setBackground("#f4cccc")
      .setRanges([deltaMedRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(M2) < -0.1 * G2')
      .setBackground("#d9ead3")
      .setRanges([deltaMedRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(N2) > 0')
      .setBackground("#f4cccc")
      .setRanges([deltaErrRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=VALUE(N2) < 0')
      .setBackground("#d9ead3")
      .setRanges([deltaErrRange])
      .build()
  );

  sheet.setConditionalFormatRules(rules);
}
