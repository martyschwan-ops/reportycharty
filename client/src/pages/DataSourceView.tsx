import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Table, BarChart3, FileText, Lightbulb, Download } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { DataTable } from '../components/reports/DataTable';
import { ChartBuilder } from '../components/charts/ChartBuilder';
import { StatsReport } from '../components/reports/StatsReport';
import { InsightsPanel } from '../components/reports/InsightsPanel';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useDataSources } from '../hooks/useDataSources';
import { chartsApi, dataApi } from '../utils/api';
import { ViewMode, ChartConfig, DataSource } from '../types';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

const TABS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'table', icon: <Table size={15} />, label: 'Table' },
  { mode: 'chart', icon: <BarChart3 size={15} />, label: 'Chart Builder' },
  { mode: 'report', icon: <FileText size={15} />, label: 'Statistics' },
  { mode: 'insights', icon: <Lightbulb size={15} />, label: 'Insights' },
];

export function DataSourceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { sources } = useDataSources();
  const [source, setSource] = useState<DataSource | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [mode, setMode] = useState<ViewMode>('table');

  useEffect(() => {
    const found = sources.find((s) => s.id === id);
    if (found) {
      setSource(found);
      if (!sheetName && found.sheets.length > 0) {
        setSheetName(found.sheets[0].name);
      }
    }
  }, [id, sources, sheetName]);

  if (!source) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const currentSheet = source.sheets.find((s) => s.name === sheetName);

  const handleSaveChart = async (name: string, config: ChartConfig) => {
    try {
      await chartsApi.save(source.id, name, config);
      toast.success(`Chart "${name}" saved!`);
    } catch {
      toast.error('Failed to save chart');
    }
  };

  return (
    <>
      <Header
        title={source.name}
        subtitle={`${source.sheets.length} sheet${source.sheets.length !== 1 ? 's' : ''} • ${source.filename}`}
        actions={
          <>
            {mode === 'table' && sheetName && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(dataApi.exportCsv(source.id, sheetName), '_blank')}
              >
                <Download size={14} />
                Export CSV
              </Button>
            )}
          </>
        }
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-4 pb-0 flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => navigate('/sources')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors mr-1"
          >
            <ArrowLeft size={15} />
            Sources
          </button>

          {source.sheets.length > 1 && (
            <Select
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-48"
            >
              {source.sheets.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </Select>
          )}

          {currentSheet && (
            <div className="flex items-center gap-2">
              <Badge color="blue">{currentSheet.rowCount.toLocaleString()} rows</Badge>
              <Badge color="gray">{currentSheet.columnCount} cols</Badge>
            </div>
          )}

          <div className="flex-1" />

          {/* Tab switcher */}
          <div className="flex items-center border-b-0">
            {TABS.map(({ mode: m, icon, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  mode === m
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                )}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {mode === 'table' && sheetName && (
            <div className="h-full flex flex-col">
              <DataTable source={source} sheetName={sheetName} />
            </div>
          )}
          {mode === 'chart' && (
            <div className="h-full" style={{ minHeight: '600px' }}>
              <ChartBuilder source={source} onSave={handleSaveChart} />
            </div>
          )}
          {mode === 'report' && sheetName && (
            <StatsReport source={source} sheetName={sheetName} />
          )}
          {mode === 'insights' && sheetName && (
            <InsightsPanel source={source} sheetName={sheetName} />
          )}
        </div>
      </div>
    </>
  );
}
