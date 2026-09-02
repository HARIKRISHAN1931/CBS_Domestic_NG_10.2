'use strict';
const ExcelJS = require('exceljs');
const path = require('path');

const { listViewTCs, basicDetailsTCs } = require('./generate-customer-testcases-p1');
const { contactDetailsTCs, additionalDetailsTCs, documentDetailsTCs } = require('./generate-customer-testcases-p2');
const { makerCheckerTCs, rolesPermissionsTCs } = require('./generate-customer-testcases-p3');
const { uiBoundaryTCs_A } = require('./generate-customer-testcases-p4');
const { uiBoundaryTCs_B } = require('./generate-customer-testcases-p5');

const OUT = path.join(__dirname, '..', 'docs', 'test-cases', 'Customer_TestCases.xlsx');

// ── Colour palette ────────────────────────────────────────────────────────
const C = {
  HEADER_BG:   '1F4E79', HEADER_FG: 'FFFFFF',
  DASH_TITLE:  '2E75B6', DASH_FG:   'FFFFFF',
  HIGH:        'FF0000', MED:       'FF9900', LOW: '00B050',
  YES_BG:      'E2EFDA', NO_BG:     'FCE4D6',
  ALT_ROW:     'DEEAF1', WHITE:     'FFFFFF',
  SMOKE:       'FFF2CC', SANITY:    'E2EFDA', REGRESSION: 'DEEAF1',
  SECTION_BG:  'BDD7EE',
};

const TC_COLS = [
  'TC ID','Screen','Feature/Element','Test Scenario','Precondition',
  'Test Steps','Test Data','Expected Result','Test Type','Priority',
  'Automation Candidate','Automation Tag','Status','Remarks',
];

const AUTO_COLS = [
  'TC ID','Spec File','Page Object','Reusable Component',
  'Smoke','Sanity','Regression','Automation Status',
];

const COMP_COLS = [
  'Component Name','Screens Used','Reusable Methods','Future Reuse Candidate',
];

const EXEC_COLS = [
  'TC ID','Execution Date','Executed By','Status','Defect ID','Comments',
];

// ── Helpers ───────────────────────────────────────────────────────────────
function headerRow(ws, cols, bgHex, fgHex) {
  const row = ws.addRow(cols);
  row.eachCell(cell => {
    cell.fill   = { type:'pattern', pattern:'solid', fgColor:{ argb: bgHex } };
    cell.font   = { bold:true, color:{ argb: fgHex }, size:10 };
    cell.border = allBorder();
    cell.alignment = { vertical:'middle', horizontal:'center', wrapText:true };
  });
  row.height = 28;
}

function allBorder() {
  const s = { style:'thin', color:{ argb:'BFBFBF' } };
  return { top:s, left:s, bottom:s, right:s };
}

function dataRow(ws, values, rowIdx) {
  const row = ws.addRow(values);
  const bg  = rowIdx % 2 === 0 ? C.WHITE : C.ALT_ROW;
  row.eachCell({ includeEmpty:true }, (cell, col) => {
    cell.fill      = { type:'pattern', pattern:'solid', fgColor:{ argb: bg } };
    cell.border    = allBorder();
    cell.alignment = { vertical:'top', wrapText:true };
    cell.font      = { size:9 };
    // Priority colour
    if (col === 10) {
      if (cell.value === 'High')   cell.font = { bold:true, color:{ argb: C.HIGH }, size:9 };
      if (cell.value === 'Medium') cell.font = { bold:true, color:{ argb: C.MED  }, size:9 };
      if (cell.value === 'Low')    cell.font = { bold:true, color:{ argb: C.LOW  }, size:9 };
    }
    // Automation candidate colour
    if (col === 11) {
      cell.fill = { type:'pattern', pattern:'solid',
        fgColor:{ argb: cell.value === 'Yes' ? C.YES_BG : C.NO_BG } };
    }
    // Tag colour
    if (col === 12) {
      if (cell.value === '@smoke')      cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: C.SMOKE } };
      if (cell.value === '@sanity')     cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: C.SANITY } };
      if (cell.value === '@regression') cell.fill = { type:'pattern', pattern:'solid', fgColor:{ argb: C.REGRESSION } };
    }
  });
  row.height = 55;
}

function setColWidths(ws, widths) {
  widths.forEach((w, i) => { ws.getColumn(i+1).width = w; });
}

function freezeAndFilter(ws, row, col) {
  ws.views = [{ state:'frozen', ySplit: row, xSplit: col }];
  ws.autoFilter = { from:{ row, column:1 }, to:{ row, column: TC_COLS.length } };
}

function addTCSheet(wb, sheetName, tcs) {
  const ws = wb.addWorksheet(sheetName, { properties:{ tabColor:{ argb:'2E75B6' } } });
  setColWidths(ws, [14,18,22,38,28,42,28,42,14,10,14,14,12,22]);
  headerRow(ws, TC_COLS, C.HEADER_BG, C.HEADER_FG);
  tcs.forEach((tc, i) => dataRow(ws, tc, i));
  freezeAndFilter(ws, 1, 0);
  return ws;
}

// ── Automation mapping data ───────────────────────────────────────────────
function buildAutoMapping(allTCs) {
  const specMap = {
    'Customer List':      'customer-list.spec.ts',
    'Basic Details':      'customer-validation.spec.ts',
    'Contact Details':    'customer-validation.spec.ts',
    'Additional Details': 'customer-validation.spec.ts',
    'Document Details':   'customer-validation.spec.ts',
    'Maker-Checker':      'customer-regression.spec.ts',
    'Roles & Permissions':'customer-regression.spec.ts',
    'UI/Boundary/E2E':    'customer-regression.spec.ts',
  };
  const poMap = {
    'Customer List':      'CustomerListPage',
    'Basic Details':      'CustomerCreationPage',
    'Contact Details':    'CustomerCreationPage',
    'Additional Details': 'CustomerCreationPage',
    'Document Details':   'CustomerCreationPage',
    'Maker-Checker':      'CustomerCreationPage / CustomerListPage',
    'Roles & Permissions':'CustomerListPage',
    'UI/Boundary/E2E':    'CustomerCreationPage / CustomerListPage',
  };
  return allTCs
    .filter(tc => tc[10] === 'Yes')
    .map(tc => {
      const screen = tc[1];
      const tag    = tc[11] || '';
      return [
        tc[0],
        specMap[screen] || '—',
        poMap[screen]   || '—',
        tc[14] || '—',
        tag === '@smoke'      ? 'Yes' : 'No',
        tag === '@sanity'     ? 'Yes' : 'No',
        tag === '@regression' ? 'Yes' : 'No',
        'Pending',
      ];
    });
}

// ── Reusable components data ──────────────────────────────────────────────
const reusableComponents = [
  ['GridComponent','Customer List, All Modules','switchTab, clickRowAction, searchAndEdit, getRowCount, clickAuthorize','Yes - all screens with DataTables grid'],
  ['ToastComponent','All Screens','getSuccess, getError, assertNoError','Yes - all screens with toast notifications'],
  ['ModalComponent','All Screens','confirmSave, confirmApprove, confirmReject','Yes - all screens with confirmation modals'],
  ['CascadeHelper','Contact Details, Additional Details, Document Details','select(page, steps[])','Yes - all screens with dependent dropdowns'],
  ['DateHelper','Basic Details, Additional Details, Document Details','format, today, minusYears, plusDays, isAdult','Yes - all screens with date fields'],
  ['CustomerDataGenerator','Customer Tests','minimal, full, boundary, negative','Yes - Customer module tests'],
  ['CustomerListPage','Customer List View','switchTab, search, clearSearch, getTabCount, clickEdit, clickDelete, clickQuickView, export, goToNextPage, assertRowVisible','Yes - Customer module'],
  ['CustomerCreationPage','Customer Creation Wizard','fillBasicDetails, fillContactDetails, fillAdditionalDetails, fillDocumentDetails, save, approve','Yes - Customer module'],
  ['CustomerWorkflow','Smoke / Regression','execute (maker+checker end-to-end)','Yes - all maker-checker modules'],
  ['AuthManager','All Tests','createMakerSession, createCheckerSession','Yes - all modules'],
  ['SharedDataStore','Cross-test Data Sharing','set, get, getOrThrow','Yes - all regression suites'],
  ['ScreenRegistry','Navigation','navigate(page, screenId)','Yes - all modules'],
];

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const wb = new ExcelJS.Workbook();
  wb.creator  = 'CBS Automation Framework';
  wb.created  = new Date();
  wb.modified = new Date();

  const allTCs = [
    ...listViewTCs, ...basicDetailsTCs, ...contactDetailsTCs,
    ...additionalDetailsTCs, ...documentDetailsTCs,
    ...makerCheckerTCs, ...rolesPermissionsTCs,
    ...uiBoundaryTCs_A, ...uiBoundaryTCs_B,
  ];

  // ── SHEET 1: Dashboard ──────────────────────────────────────────────────
  const dash = wb.addWorksheet('Dashboard', { properties:{ tabColor:{ argb:'1F4E79' } } });
  dash.views = [{ showGridLines: false }];
  setColWidths(dash, [30, 20, 30, 20]);

  const addDashRow = (label, value, bgHex, bold) => {
    const r = dash.addRow([label, value]);
    r.getCell(1).fill  = { type:'pattern', pattern:'solid', fgColor:{ argb: bgHex || 'FFFFFF' } };
    r.getCell(2).fill  = { type:'pattern', pattern:'solid', fgColor:{ argb: bgHex || 'FFFFFF' } };
    r.getCell(1).font  = { bold: bold || false, size:11 };
    r.getCell(2).font  = { bold: true, size:11, color:{ argb:'1F4E79' } };
    r.getCell(1).border = allBorder();
    r.getCell(2).border = allBorder();
    r.height = 22;
  };

  const titleRow = dash.addRow(['CBS DOMESTIC NG 10.2 — CUSTOMER MODULE TEST CASES']);
  titleRow.getCell(1).font      = { bold:true, size:16, color:{ argb: C.DASH_FG } };
  titleRow.getCell(1).fill      = { type:'pattern', pattern:'solid', fgColor:{ argb: C.DASH_TITLE } };
  titleRow.getCell(1).alignment = { horizontal:'center' };
  dash.mergeCells('A1:D1');
  titleRow.height = 36;

  dash.addRow([]);

  const counts = {
    total: allTCs.length,
    positive:   allTCs.filter(t => t[8]==='Positive').length,
    negative:   allTCs.filter(t => t[8]==='Negative').length,
    validation: allTCs.filter(t => t[8]==='Validation').length,
    boundary:   allTCs.filter(t => t[8]==='Boundary').length,
    ui:         allTCs.filter(t => t[8]==='UI' || t[8]==='Accessibility').length,
    functional: allTCs.filter(t => t[8]==='Functional').length,
    navigation: allTCs.filter(t => t[8]==='Navigation').length,
    rolePerms:  allTCs.filter(t => t[8]==='Role-Permission').length,
    high:       allTCs.filter(t => t[9]==='High').length,
    medium:     allTCs.filter(t => t[9]==='Medium').length,
    low:        allTCs.filter(t => t[9]==='Low').length,
    autoYes:    allTCs.filter(t => t[10]==='Yes').length,
    autoNo:     allTCs.filter(t => t[10]==='No').length,
  };

  addDashRow('SUMMARY', '', C.SECTION_BG, true);
  addDashRow('Total Test Cases', counts.total, '', true);
  dash.addRow([]);
  addDashRow('BY TEST TYPE', '', C.SECTION_BG, true);
  addDashRow('Positive',         counts.positive,   '', false);
  addDashRow('Negative',         counts.negative,   '', false);
  addDashRow('Validation',       counts.validation, '', false);
  addDashRow('Boundary',         counts.boundary,   '', false);
  addDashRow('UI / Accessibility', counts.ui,        '', false);
  addDashRow('Functional',       counts.functional, '', false);
  addDashRow('Navigation',       counts.navigation, '', false);
  addDashRow('Role-Permission',  counts.rolePerms,  '', false);
  dash.addRow([]);
  addDashRow('BY PRIORITY', '', C.SECTION_BG, true);
  addDashRow('High',   counts.high,   '', false);
  addDashRow('Medium', counts.medium, '', false);
  addDashRow('Low',    counts.low,    '', false);
  dash.addRow([]);
  addDashRow('AUTOMATION', '', C.SECTION_BG, true);
  addDashRow('Automation Candidates (Yes)', counts.autoYes, C.YES_BG, false);
  addDashRow('Manual Only (No)',            counts.autoNo,  C.NO_BG,  false);
  dash.addRow([]);
  addDashRow('BY SHEET / SCREEN AREA', '', C.SECTION_BG, true);
  addDashRow('Sheet 2 — List View (TC-001 to TC-036)',                listViewTCs.length,        '', false);
  addDashRow('Sheet 3 — Basic Details (TC-037 to TC-065)',            basicDetailsTCs.length,    '', false);
  addDashRow('Sheet 4 — Contact Details (TC-066 to TC-088)',          contactDetailsTCs.length,  '', false);
  addDashRow('Sheet 5 — Additional Details (TC-089 to TC-107)',       additionalDetailsTCs.length,'', false);
  addDashRow('Sheet 6 — Document Details (TC-108 to TC-137)',         documentDetailsTCs.length, '', false);
  addDashRow('Sheet 7 — Maker-Checker Workflow (TC-138 to TC-160)',   makerCheckerTCs.length,    '', false);
  addDashRow('Sheet 8 — Roles & Permissions (TC-161 to TC-167)',      rolesPermissionsTCs.length,'', false);
  addDashRow('Sheet 9 — UI/Boundary/E2E (TC-168 to TC-300)',          uiBoundaryTCs_A.length + uiBoundaryTCs_B.length, '', false);
  dash.addRow([]);
  addDashRow('SPEC FILES', '', C.SECTION_BG, true);
  addDashRow('customer-list.spec.ts',       'List View tests',           '', false);
  addDashRow('customer-create.spec.ts',     'Smoke create workflow',     '', false);
  addDashRow('customer-validation.spec.ts', 'Sanity / validation tests', '', false);
  addDashRow('customer-regression.spec.ts', 'Full regression suite',     '', false);
  dash.addRow([]);
  addDashRow('PAGE OBJECTS', '', C.SECTION_BG, true);
  addDashRow('CustomerListPage.ts',       'List view interactions',  '', false);
  addDashRow('CustomerCreationPage.ts',   'Creation wizard (4 pages)','', false);
  addDashRow('CustomerModificationPage.ts','Edit existing customer', '', false);
  dash.addRow([]);
  addDashRow('WORKBOOK PATH', 'docs/test-cases/Customer_TestCases.xlsx', '', false);
  addDashRow('Last Updated', new Date().toLocaleDateString(), '', false);
  addDashRow('Module', 'Customer', '', false);
  addDashRow('Bank', 'BCCB', '', false);
  addDashRow('Environment', 'QA', '', false);
  addDashRow('Base URL', 'http://172.21.0.39:7999', '', false);

  // ── SHEETS 2-9: Test Cases ──────────────────────────────────────────────
  addTCSheet(wb, 'List View',           listViewTCs);
  addTCSheet(wb, 'Basic Details',       basicDetailsTCs);
  addTCSheet(wb, 'Contact Details',     contactDetailsTCs);
  addTCSheet(wb, 'Additional Details',  additionalDetailsTCs);
  addTCSheet(wb, 'Document Details',    documentDetailsTCs);
  addTCSheet(wb, 'Maker-Checker',       makerCheckerTCs);
  addTCSheet(wb, 'Roles & Permissions', rolesPermissionsTCs);
  addTCSheet(wb, 'UI-Boundary-E2E',     [...uiBoundaryTCs_A, ...uiBoundaryTCs_B]);

  // ── SHEET 10: Automation Mapping ────────────────────────────────────────
  const autoWs = wb.addWorksheet('Automation Mapping', { properties:{ tabColor:{ argb:'375623' } } });
  setColWidths(autoWs, [14,30,32,24,10,10,12,16]);
  headerRow(autoWs, AUTO_COLS, '375623', 'FFFFFF');
  buildAutoMapping(allTCs).forEach((row, i) => {
    const r = autoWs.addRow(row);
    const bg = i % 2 === 0 ? C.WHITE : C.YES_BG;
    r.eachCell({ includeEmpty:true }, cell => {
      cell.fill   = { type:'pattern', pattern:'solid', fgColor:{ argb: bg } };
      cell.border = allBorder();
      cell.font   = { size:9 };
      cell.alignment = { vertical:'top', wrapText:true };
    });
    r.height = 20;
  });
  autoWs.views = [{ state:'frozen', ySplit:1 }];
  autoWs.autoFilter = { from:{ row:1, column:1 }, to:{ row:1, column: AUTO_COLS.length } };

  // ── SHEET 11: Reusable Components ───────────────────────────────────────
  const compWs = wb.addWorksheet('Reusable Components', { properties:{ tabColor:{ argb:'7030A0' } } });
  setColWidths(compWs, [28,36,60,28]);
  headerRow(compWs, COMP_COLS, '7030A0', 'FFFFFF');
  reusableComponents.forEach((row, i) => {
    const r = compWs.addRow(row);
    const bg = i % 2 === 0 ? C.WHITE : 'EAD1DC';
    r.eachCell({ includeEmpty:true }, cell => {
      cell.fill   = { type:'pattern', pattern:'solid', fgColor:{ argb: bg } };
      cell.border = allBorder();
      cell.font   = { size:9 };
      cell.alignment = { vertical:'top', wrapText:true };
    });
    r.height = 40;
  });

  // ── SHEET 12: Execution Tracker ─────────────────────────────────────────
  const execWs = wb.addWorksheet('Execution Tracker', { properties:{ tabColor:{ argb:'C55A11' } } });
  setColWidths(execWs, [14,16,20,14,14,30]);
  headerRow(execWs, EXEC_COLS, 'C55A11', 'FFFFFF');
  allTCs.forEach((tc, i) => {
    const r = execWs.addRow([tc[0], '', '', 'Not Run', '', '']);
    const bg = i % 2 === 0 ? C.WHITE : 'FCE4D6';
    r.eachCell({ includeEmpty:true }, cell => {
      cell.fill   = { type:'pattern', pattern:'solid', fgColor:{ argb: bg } };
      cell.border = allBorder();
      cell.font   = { size:9 };
      cell.alignment = { vertical:'middle' };
    });
    r.height = 18;
  });
  execWs.views = [{ state:'frozen', ySplit:1 }];

  // ── Save ────────────────────────────────────────────────────────────────
  await wb.xlsx.writeFile(OUT);
  console.log('');
  console.log('='.repeat(60));
  console.log('  Customer_TestCases.xlsx CREATED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log('  Path   : ' + OUT);
  console.log('  Sheets : 12');
  console.log('  Total TCs : ' + allTCs.length);
  console.log('');
  console.log('  Worksheet         TC Range          Count');
  console.log('  ─────────────────────────────────────────');
  console.log('  Dashboard         —                 —');
  console.log('  List View         TC-001 to TC-036  ' + listViewTCs.length);
  console.log('  Basic Details     TC-037 to TC-065  ' + basicDetailsTCs.length);
  console.log('  Contact Details   TC-066 to TC-088  ' + contactDetailsTCs.length);
  console.log('  Additional Details TC-089 to TC-107 ' + additionalDetailsTCs.length);
  console.log('  Document Details  TC-108 to TC-137  ' + documentDetailsTCs.length);
  console.log('  Maker-Checker     TC-138 to TC-160  ' + makerCheckerTCs.length);
  console.log('  Roles & Perms     TC-161 to TC-167  ' + rolesPermissionsTCs.length);
  console.log('  UI-Boundary-E2E   TC-168 to TC-300  ' + (uiBoundaryTCs_A.length + uiBoundaryTCs_B.length));
  console.log('  Automation Mapping —                ' + allTCs.filter(t=>t[10]==='Yes').length + ' auto TCs');
  console.log('  Reusable Components —               ' + reusableComponents.length + ' components');
  console.log('  Execution Tracker  —                ' + allTCs.length + ' rows');
  console.log('='.repeat(60));
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
