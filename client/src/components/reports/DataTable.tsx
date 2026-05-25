import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { DataSource } from '../../types';
import { dataApi } from '../../utils/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface DataTableProps {
  source: DataSource;
  sheetName: string;
}

export function DataTable({ source, sheetName }: DataTableProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortCol, setSortCol] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [searchCol, setSearchCol] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, pageSize };
      if (sortCol) { params.sort = sortCol; params.dir = sortDir; }
      if (search && searchCol) params[searchCol] = search;
      const result = await dataApi.getPage(source.id, sheetName, params);
      setRows(result.rows);
      setColumns(result.columns);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }, [source.id, sheetName, page, pageSize, sortCol, sortDir, search, searchCol]);

  useEffect(() => { setPage(1); }, [sheetName, search, searchCol]);
  useEffect(() => { load(); }, [load]);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const exportCsv = () => {
    window.open(dataApi.exportCsv(source.id, sheetName), '_blank');
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Select
            value={searchCol}
            onChange={(e) => setSearchCol(e.target.value)}
            className="w-40 shrink-0"
          >
            <option value="">All columns</option>
            {columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input
            icon={<Search size={14} />}
            placeholder="Filter rows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="w-24">
            {[25, 50, 100, 250].map((n) => <option key={n} value={n}>{n} rows</option>)}
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 min-h-0 overflow-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50 dark:bg-slate-900">
                {columns.map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap select-none"
                  >
                    <span className="flex items-center gap-1">
                      {col}
                      {sortCol === col ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronUp size={12} className="opacity-0 group-hover:opacity-30" />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  {columns.map((col) => {
                    const val = row[col];
                    const isNum = typeof val === 'number' || (val != null && !isNaN(parseFloat(String(val))) && isFinite(Number(val)));
                    return (
                      <td
                        key={col}
                        className={`px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-[240px] truncate ${isNum ? 'text-right font-mono text-xs' : ''}`}
                        title={String(val ?? '')}
                      >
                        {val == null || val === '' ? (
                          <span className="text-slate-300 dark:text-slate-600 italic text-xs">—</span>
                        ) : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                    No rows match the filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 shrink-0">
        <span>
          {total > 0 && `Showing ${((page - 1) * pageSize) + 1}–${Math.min(page * pageSize, total)} of ${total.toLocaleString()} rows`}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="xs" onClick={() => setPage(1)} disabled={page === 1}>
            <ChevronsLeft size={14} />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
            <ChevronLeft size={14} />
          </Button>
          <span className="px-3">Page {page} / {totalPages || 1}</span>
          <Button variant="ghost" size="xs" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}>
            <ChevronRight size={14} />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>
            <ChevronsRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
