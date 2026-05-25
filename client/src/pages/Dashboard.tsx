import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, BarChart3, FileText, Clock, Upload, TrendingUp, Layers } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { UploadZone } from '../components/datasources/UploadZone';
import { useDataSources } from '../hooks/useDataSources';
import { datasourcesApi } from '../utils/api';
import { DataSource } from '../types';
import { formatBytes, formatDateTime } from '../utils/format';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const navigate = useNavigate();
  const { sources, loading, upload } = useDataSources();
  const [recent, setRecent] = useState<DataSource[]>([]);

  useEffect(() => {
    datasourcesApi.recent().then(setRecent).catch(() => {});
  }, [sources]);

  const handleUpload = async (file: File) => {
    const ds = await upload(file);
    if (ds) navigate(`/sources/${ds.id}`);
  };

  const totalRows = sources.reduce(
    (acc, s) => acc + s.sheets.reduce((a, sh) => a + sh.rowCount, 0),
    0
  );

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Your analytics overview"
        actions={
          <Button onClick={() => navigate('/sources')} size="sm" variant="primary">
            <Upload size={14} />
            Add Data Source
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Data Sources',
              value: loading ? '—' : sources.length,
              icon: <Database size={20} className="text-brand-500" />,
              bg: 'bg-brand-50 dark:bg-brand-900/20',
              sub: 'Excel files uploaded',
            },
            {
              label: 'Total Sheets',
              value: loading ? '—' : sources.reduce((a, s) => a + s.sheets.length, 0),
              icon: <Layers size={20} className="text-green-500" />,
              bg: 'bg-green-50 dark:bg-green-900/20',
              sub: 'Across all files',
            },
            {
              label: 'Total Rows',
              value: loading ? '—' : totalRows > 1000 ? `${(totalRows / 1000).toFixed(1)}K` : totalRows,
              icon: <TrendingUp size={20} className="text-purple-500" />,
              bg: 'bg-purple-50 dark:bg-purple-900/20',
              sub: 'Data points available',
            },
            {
              label: 'Storage Used',
              value: loading ? '—' : formatBytes(sources.reduce((a, s) => a + s.size, 0)),
              icon: <FileText size={20} className="text-orange-500" />,
              bg: 'bg-orange-50 dark:bg-orange-900/20',
              sub: 'Local disk usage',
            },
          ].map(({ label, value, icon, bg, sub }) => (
            <div key={label} className={`${bg} rounded-xl p-5 border border-slate-200/50 dark:border-slate-700/50`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
                {icon}
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Upload zone */}
          <div className="col-span-3">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">
              Add New Data Source
            </h3>
            <UploadZone onUpload={handleUpload} />
          </div>

          {/* Recent */}
          <div className="col-span-2">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Clock size={14} />
              Recently Viewed
            </h3>
            <div className="space-y-2">
              {recent.length === 0 && !loading && (
                <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">No recent files yet</p>
              )}
              {recent.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/sources/${s.id}`)}
                  className="w-full flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 transition-colors text-left group"
                >
                  <Database size={16} className="text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate group-hover:text-brand-600">{s.name}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(s.updated_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Data sources list */}
        {sources.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                All Data Sources
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/sources')}>
                View all →
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sources.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/sources/${s.id}`)}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-sm transition-all text-left"
                >
                  <BarChart3 size={18} className="text-brand-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-400">
                      {s.sheets.length} sheet{s.sheets.length !== 1 ? 's' : ''} • {formatBytes(s.size)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
