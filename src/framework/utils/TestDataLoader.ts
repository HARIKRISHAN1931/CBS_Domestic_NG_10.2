import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

export type DataFormat = 'xlsx' | 'json' | 'csv';

export interface LoadOptions {
  sheet?:     string;   // explicit sheet name — overrides all resolution
  operation?: string;   // 'create' | 'update' | 'authorize' | 'negative'
  tag?:       string;
  delimiter?: string;
}

// Resolves sheet: explicit > operation > first sheet
function resolveSheet(wb: XLSX.WorkBook, sheet?: string, operation?: string): string {
  if (sheet) return sheet;
  if (operation && wb.SheetNames.includes(operation)) return operation;
  return wb.SheetNames[0];
}

function applyTag<T>(rows: T[], tag?: string): T[] {
  if (!tag) return rows;
  return rows.filter(r => ((r as Record<string, unknown>)['tag'] as string ?? '').includes(tag));
}

function detectFormat(filePath: string): DataFormat {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.xlsx' || ext === '.xls') return 'xlsx';
  if (ext === '.json') return 'json';
  if (ext === '.csv')  return 'csv';
  throw new Error(`Unsupported test data format: ${ext}`);
}

function loadXlsx<T>(fullPath: string, sheet?: string, operation?: string, tag?: string): T[] {
  const wb        = XLSX.readFile(fullPath, { cellText: true, cellDates: false });
  const sheetName = resolveSheet(wb, sheet, operation);
  const ws        = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet "${sheetName}" not found in ${fullPath}`);
  const range   = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })];
    headers[c] = cell ? String(cell.v ?? '') : '';
  }
  const rows: T[] = [];
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const obj: Record<string, string> = {};
    for (let c = range.s.c; c <= range.e.c; c++) {
      const key  = headers[c];
      if (!key) continue;
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      obj[key]   = cell
        ? (cell.t === 'n' ? String(cell.v ?? '') : String(cell.w ?? cell.v ?? '')).trim()
        : '';
    }
    rows.push(obj as unknown as T);
  }
  return applyTag(rows, tag);
}

function loadJson<T>(fullPath: string, tag?: string): T[] {
  const raw = JSON.parse(fs.readFileSync(fullPath, 'utf-8')) as T[];
  if (!Array.isArray(raw)) throw new Error(`Expected JSON array in: ${fullPath}`);
  return applyTag(raw, tag);
}

function loadCsv<T>(fullPath: string, delimiter = ',', tag?: string): T[] {
  const lines   = fs.readFileSync(fullPath, 'utf-8').split('\n').filter(Boolean);
  const headers = lines[0].split(delimiter).map(h => h.trim());
  const rows    = lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ''; });
    return obj as unknown as T;
  });
  return applyTag(rows, tag);
}

export const TestDataLoader = {
  load<T = Record<string, unknown>>(filePath: string, options: LoadOptions = {}): T[] {
    if (!fs.existsSync(filePath)) throw new Error(`Test data file not found: ${filePath}`);
    const format = detectFormat(filePath);
    switch (format) {
      case 'xlsx': return loadXlsx<T>(filePath, options.sheet, options.operation, options.tag);
      case 'json': return loadJson<T>(filePath, options.tag);
      case 'csv':  return loadCsv<T>(filePath, options.delimiter, options.tag);
    }
  },
};
