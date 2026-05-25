import { useState, useEffect } from 'react';
import { DataSource, StatsResult, ColumnStats } from '../../types';
import { dataApi } from '../../utils/api';
import { formatNumber } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { TrendingUp, Hash, Type, AlertCircle } from 'lucide-react';

interface StatsReportProps {
  source: DataSource;
  sheetName: string;
}

function NumericCard({ col, s }: { col: string; s: ColumnStats & { type: 'numeric' } }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate max-w-[160px]">{col}</h4>
          <Badge color="blue">Numeric</Badge>
        </div>
        <TrendingUp size={18} className="text-blue-400 shrink-0 mt-0.5" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['Count', s.count.toLocaleString()],
          ['Missing', s.nullCount > 0 ? <span className="text-red-500">{s.nullCount}</span> : '0'],
          ['Min', formatNumber(s.min!)],
          ['Max', formatNumber(s.max!)],
          ['Mean', formatNumber(s.mean!)],
          ['Median', formatNumber(s.median!)],
          ['Std Dev', formatNumber(s.stdDev!)],
          ['Sum', formatNumber(s.sum!)],
        ].map(([label, val]) => (
          <div key={label as string} className="flex flex-col">
            <span className="text-slate-400 dark:text-slate-500">{label}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatCard({ col, s }: { col: string; s: ColumnStats & { type: 'categorical' } }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white text-sm truncate max-w-[160px]">{col}</h4>
          <Badge color="purple">Categorical</Badge>
        </div>
        <Type size={18} className="text-purple-400 shrink-0 mt-0.5" />
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        {[
          ['Count', s.count.toLocaleString()],
          ['Missing', s.nullCount > 0 ? <span className="text-red-500">{s.nullCount}</span> : '0'],
          ['Unique', s.uniqueCount!.toLocaleString()],
        ].map(([label, val]) => (
          <div key={label as string} className="flex flex-col">
            <span className="text-slate-400 dark:text-slate-500">{label}</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{val}</span>
          </div>
        ))}
      </div>
      {s.topValues && s.topValues.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-1.5">Top values</p>
          <div className="space-y-1">
            {s.topValues.slice(0, 4).map(({ value, count }) => (
              <div key={value} className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-400 h-full rounded-full"
                    style={{ width: `${Math.min(100, (count / s.count) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[80px]" title={value}>{value}</span>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StatsReport({ source, sheetName }: StatsReportProps) {
  const [stats, setStats] = useState<StatsResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    dataApi.getStats(source.id, sheetName)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [source.id, sheetName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-slate-400">
        <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) return null;

  const numericCols = stats.columns.filter((c) => stats.stats[c]?.type === 'numeric');
  const catCols = stats.columns.filter((c) => stats.stats[c]?.type === 'categorical');
  const missingCols = stats.columns.filter((c) => (stats.stats[c]?.nullCount || 0) > 0);

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Rows', value: stats.rowCount.toLocaleString(), icon: <Hash size={20} className="text-brand-500" />, color: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Columns', value: stats.columns.length, icon: <Hash size={20} className="text-green-500" />, color: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Numeric Cols', value: numericCols.length, icon: <TrendingUp size={20} className="text-blue-500" />, color: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Missing Values', value: missingCols.length > 0 ? missingCols.length + ' cols' : 'None', icon: <AlertCircle size={20} className="text-yellow-500" />, color: 'bg-yellow-50 dark:bg-yellow-900/20' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className={`${color} rounded-xl p-4 flex items-center gap-3 border border-slate-200/50 dark:border-slate-700/50`}>
            <div>{icon}</div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Column cards */}
      {numericCols.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
            Numeric Columns ({numericCols.length})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {numericCols.map((col) => (
              <NumericCard key={col} col={col} s={stats.stats[col] as any} />
            ))}
          </div>
        </div>
      )}

      {catCols.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
            Categorical Columns ({catCols.length})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catCols.map((col) => (
              <CatCard key={col} col={col} s={stats.stats[col] as any} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
