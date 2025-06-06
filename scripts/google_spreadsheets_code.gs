function updateMasterTab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName("Master");
  const sheets = ss.getSheets();
  const masterIndex = sheets.findIndex(s => s.getName() === "Master");

  if (masterIndex === -1 || masterIndex + 2 >= sheets.length) {
    SpreadsheetApp.getUi().alert("Master tab must be followed by at least two date-named tabs.");
    return;
  }

  const current = sheets[masterIndex + 1];
  const previous = sheets[masterIndex + 2];

  const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
  if (!dateRegex.test(current.getName()) || !dateRegex.test(previous.getName())) {
    SpreadsheetApp.getUi().alert("Tabs after Master must be named in DD.MM.YYYY format.");
    return;
  }

  const currentName = current.getName();
  const previousName = previous.getName();

  const currentData = current.getDataRange().getValues();
  const prevData = previous.getDataRange().getValues();
  const masterData = masterSheet.getDataRange().getValues();
  const header = masterData[0];

  // Update dynamic headers
  header[5] = `Current Avg (${currentName})`;
  header[6] = `Current Med (${currentName})`;
  header[7] = `Current Errors (${currentName})`;
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

    const currentRow = currentData.find(r => r[metricColIndex.metric] === metricName);
    const prevRow = prevData.find(r => r[metricColIndex.metric] === metricName);

    let currAvg = '', currMed = '', currErr = '';
    let prevAvg = '', prevMed = '', prevErr = '';
    let deltaAvg = '', deltaMed = '', deltaErr = '';

    if (currentRow) {
      currAvg = parseFloat(currentRow[metricColIndex.avg]) || 0;
      currMed = parseFloat(currentRow[metricColIndex.med]) || 0;
      currErr = parseFloat(currentRow[metricColIndex.errors]) || 0;
    }

    if (prevRow) {
      prevAvg = parseFloat(prevRow[metricColIndex.avg]) || 0;
      prevMed = parseFloat(prevRow[metricColIndex.med]) || 0;
      prevErr = parseFloat(prevRow[metricColIndex.errors]) || 0;
    }

    // Only calculate deltas if both sets exist
    if (currentRow && prevRow) {
      deltaAvg = formatDelta(currAvg - prevAvg);
      deltaMed = formatDelta(currMed - prevMed);
      deltaErr = formatDelta(currErr - prevErr);
    }

    row[5] = currentRow ? currAvg : '';
    row[6] = currentRow ? currMed : '';
    row[7] = currentRow ? currErr : '';
    row[8] = prevRow ? prevAvg : '';
    row[9] = prevRow ? prevMed : '';
    row[10] = prevRow ? prevErr : '';
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
      .whenFormulaSatisfied('=ISNUMBER(L2) * (L2 > 0.1 * F2)')
      .setBackground("#f4cccc")
      .setRanges([deltaAvgRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(L2) * (L2 < -0.1 * F2)')
      .setBackground("#d9ead3")
      .setRanges([deltaAvgRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(M2) * (M2 > 0.1 * G2)')
      .setBackground("#f4cccc")
      .setRanges([deltaMedRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(M2) * (M2 < -0.1 * G2)')
      .setBackground("#d9ead3")
      .setRanges([deltaMedRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(N2) * (N2 > 0)')
      .setBackground("#f4cccc")
      .setRanges([deltaErrRange])
      .build(),

    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=ISNUMBER(N2) * (N2 < 0)')
      .setBackground("#d9ead3")
      .setRanges([deltaErrRange])
      .build()
  );

  sheet.setConditionalFormatRules(rules);
}
