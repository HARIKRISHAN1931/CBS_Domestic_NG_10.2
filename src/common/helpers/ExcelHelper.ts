import * as path from 'path';
import * as fs from 'fs';
import * as XLSX from 'xlsx';

export class ExcelHelper {
  static readSheet<T>(filePath: string, sheetName?: string): T[] {
    const wb   = XLSX.readFile(filePath, { cellText: true, cellDates: false });
    const name = sheetName ?? wb.SheetNames[0];
    const ws   = wb.Sheets[name];
    if (!ws) throw new Error(`Sheet "${name}" not found in ${filePath}`);
    return XLSX.utils.sheet_to_json<T>(ws, { defval: '' });
  }

  static writeSheet(filePath: string, data: Record<string, unknown>[], sheetName = 'Sheet1'): void {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filePath);
  }
}
