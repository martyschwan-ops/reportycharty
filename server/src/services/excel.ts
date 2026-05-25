import * as XLSX from 'xlsx';

export interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

export interface ParsedSheet {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
}

export function parseExcelFile(filepath: string): {
  sheets: SheetInfo[];
  workbook: XLSX.WorkBook;
} {
  const workbook = XLSX.readFile(filepath, { cellDates: true, dense: false });
  const sheets: SheetInfo[] = workbook.SheetNames.map((name) => {
    const ws = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: null,
      raw: false,
    });
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    return {
      name,
      rowCount: data.length,
      columnCount: range.e.c - range.s.c + 1,
      columns,
    };
  });
  return { sheets, workbook };
}

export function getSheetData(
  filepath: string,
  sheetName: string,
  options: {
    page?: number;
    pageSize?: number;
    filters?: Record<string, string>;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
  } = {}
): { rows: Record<string, unknown>[]; total: number; columns: string[] } {
  const workbook = XLSX.readFile(filepath, { cellDates: true });
  const ws = workbook.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet "${sheetName}" not found`);

  let rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: null,
    raw: false,
  });

  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (options.filters) {
    for (const [col, val] of Object.entries(options.filters)) {
      if (val) {
        rows = rows.filter((r) =>
          String(r[col] ?? '').toLowerCase().includes(val.toLowerCase())
        );
      }
    }
  }

  if (options.sortColumn) {
    const dir = options.sortDirection === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = a[options.sortColumn!];
      const bv = b[options.sortColumn!];
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }

  const total = rows.length;
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 100;
  const start = (page - 1) * pageSize;
  rows = rows.slice(start, start + pageSize);

  return { rows, total, columns };
}

export function getAllSheetData(
  filepath: string,
  sheetName: string
): Record<string, unknown>[] {
  const workbook = XLSX.readFile(filepath, { cellDates: true });
  const ws = workbook.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet "${sheetName}" not found`);
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: null,
    raw: false,
  });
}
