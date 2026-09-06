// Regenerates manual-test-cases-export.csv and the XYZ-Bank-Test-Cases.xlsx submission file
// from the markdown tables under manual-test-cases/. Run with: npm run export:test-cases
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const DIR = path.join(__dirname, '..', 'manual-test-cases');
const COLUMNS = [
  'Test Case ID',
  'Test Description',
  'Preconditions',
  'Test Steps',
  'Expected Result',
  'Actual Result',
  'Priority',
  'Automation Feasibility',
];

function stripMarkdown(text) {
  return text
    .replace(/<br>/g, '\n')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function parseModuleFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const titleLine = lines.find(l => l.startsWith('# '));
  const module = titleLine ? titleLine.replace(/^#\s*/, '').trim() : path.basename(filePath);

  const rows = [];
  for (const line of lines) {
    if (!line.startsWith('| TC-')) continue;
    const cells = line
      .slice(1, -1) // drop leading/trailing pipe
      .split('|')
      .map(cell => stripMarkdown(cell));
    if (cells.length !== COLUMNS.length) {
      throw new Error(`${filePath}: expected ${COLUMNS.length} columns, got ${cells.length}: ${line}`);
    }
    rows.push({ module, cells });
  }
  return rows;
}

function csvEscape(value) {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function main() {
  const files = fs
    .readdirSync(DIR)
    .filter(f => /^\d{2}-.*\.md$/.test(f))
    .sort();

  const allRows = files.flatMap(f => parseModuleFile(path.join(DIR, f)));

  // --- CSV export ---
  const csvHeader = ['Module', ...COLUMNS].join(',');
  const csvLines = allRows.map(({ module, cells }) =>
    [csvEscape(module), ...cells.map(csvEscape)].join(',')
  );
  const csvPath = path.join(DIR, 'manual-test-cases-export.csv');
  fs.writeFileSync(csvPath, '﻿' + [csvHeader, ...csvLines].join('\n') + '\n', 'utf8');
  console.log(`Wrote ${allRows.length} rows to ${csvPath}`);

  // --- XLSX export ---
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'XYZ Bank QA test suite';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Test Cases', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  sheet.columns = [
    { header: 'Module', key: 'module', width: 42 },
    { header: 'Test Case ID', key: 'id', width: 14 },
    { header: 'Test Description', key: 'description', width: 40 },
    { header: 'Preconditions', key: 'preconditions', width: 32 },
    { header: 'Test Steps', key: 'steps', width: 45 },
    { header: 'Expected Result', key: 'expected', width: 45 },
    { header: 'Actual Result', key: 'actual', width: 35 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Automation Feasibility', key: 'automation', width: 45 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  sheet.autoFilter = { from: 'A1', to: 'I1' };

  for (const { module, cells } of allRows) {
    const row = sheet.addRow({
      module,
      id: cells[0],
      description: cells[1],
      preconditions: cells[2],
      steps: cells[3],
      expected: cells[4],
      actual: cells[5],
      priority: cells[6],
      automation: cells[7],
    });
    row.alignment = { vertical: 'top', wrapText: true };

    const priority = cells[6];
    const priorityCell = row.getCell('priority');
    if (priority === 'High') priorityCell.font = { color: { argb: 'FFB91C1C' }, bold: true };
    else if (priority === 'Medium') priorityCell.font = { color: { argb: 'FF92400E' } };
    else if (priority === 'Low') priorityCell.font = { color: { argb: 'FF374151' } };

    const actual = cells[5];
    const actualCell = row.getCell('actual');
    if (actual.startsWith('Fail')) actualCell.font = { color: { argb: 'FFB91C1C' } };
    else if (actual.startsWith('Pass')) actualCell.font = { color: { argb: 'FF15803D' } };
  }

  const xlsxPath = path.join(DIR, 'XYZ-Bank-Test-Cases.xlsx');
  workbook.xlsx.writeFile(xlsxPath).then(() => {
    console.log(`Wrote ${allRows.length} rows to ${xlsxPath}`);
  });
}

main();
