import { useState, useEffect, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Scatter, Radar, PolarArea } from 'react-chartjs-2';
import { DataSource, ChartConfig, ChartType } from '../../types';
import { dataApi } from '../../utils/api';
import { COLOR_SCHEMES, CHART_COLORS } from '../../utils/format';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { BarChart3, LineChart, PieChart, Layers, Save, RefreshCw } from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  { type: 'bar', label: 'Bar', icon: <BarChart3 size={14} /> },
  { type: 'stackedBar', label: 'Stacked Bar', icon: <BarChart3 size={14} /> },
  { type: 'line', label: 'Line', icon: <LineChart size={14} /> },
  { type: 'area', label: 'Area', icon: <LineChart size={14} /> },
  { type: 'pie', label: 'Pie', icon: <PieChart size={14} /> },
  { type: 'doughnut', label: 'Doughnut', icon: <PieChart size={14} /> },
  { type: 'scatter', label: 'Scatter', icon: <Layers size={14} /> },
  { type: 'radar', label: 'Radar', icon: <Layers size={14} /> },
  { type: 'polarArea', label: 'Polar Area', icon: <Layers size={14} /> },
];

interface ChartBuilderProps {
  source: DataSource;
  initialConfig?: ChartConfig;
  onSave?: (name: string, config: ChartConfig) => void;
}

function buildChartData(
  rows: Record<string, unknown>[],
  config: ChartConfig,
  dark: boolean
) {
  const colors = COLOR_SCHEMES[config.colorScheme || 'default'] || CHART_COLORS;
  const labels = rows.map((r) => String(r[config.xColumn] ?? ''));
  const isPie = config.chartType === 'pie' || config.chartType === 'doughnut' || config.chartType === 'polarArea';

  if (isPie) {
    const yCol = config.yColumns[0];
    const data = rows.map((r) => {
      const v = parseFloat(String(r[yCol] ?? 0));
      return isNaN(v) ? 0 : v;
    });
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 1,
        borderColor: dark ? '#1e293b' : '#fff',
      }],
    };
  }

  if (config.chartType === 'scatter') {
    const xCol = config.xColumn;
    const yCol = config.yColumns[0];
    return {
      datasets: [{
        label: yCol,
        data: rows.map((r) => ({
          x: parseFloat(String(r[xCol] ?? 0)),
          y: parseFloat(String(r[yCol] ?? 0)),
        })).filter((p) => !isNaN(p.x) && !isNaN(p.y)),
        backgroundColor: colors[0] + '99',
        pointRadius: 5,
      }],
    };
  }

  const datasets = config.yColumns.map((col, i) => {
    const color = colors[i % colors.length];
    const isArea = config.chartType === 'area';
    return {
      label: col,
      data: rows.map((r) => {
        const v = parseFloat(String(r[col] ?? 0));
        return isNaN(v) ? 0 : v;
      }),
      backgroundColor: isPie ? colors : isArea ? color + '33' : color + 'cc',
      borderColor: color,
      borderWidth: 2,
      fill: isArea,
      tension: isArea || config.chartType === 'line' ? 0.4 : 0,
      pointRadius: config.chartType === 'line' || isArea ? 3 : 0,
    };
  });

  return { labels, datasets };
}

export function ChartBuilder({ source, initialConfig, onSave }: ChartBuilderProps) {
  const dark = document.documentElement.classList.contains('dark');
  const firstSheet = source.sheets[0];

  const [config, setConfig] = useState<ChartConfig>(initialConfig || {
    chartType: 'bar',
    sheetName: firstSheet?.name || '',
    xColumn: firstSheet?.columns[0] || '',
    yColumns: firstSheet?.columns.slice(1, 2) || [],
    colorScheme: 'default',
    showLegend: true,
    showGrid: true,
  });

  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveName, setSaveName] = useState('My Chart');
  const [saving, setSaving] = useState(false);

  const currentSheet = source.sheets.find((s) => s.name === config.sheetName);

  const loadData = useCallback(async () => {
    if (!config.sheetName) return;
    setLoading(true);
    try {
      const result = await dataApi.getAll(source.id, config.sheetName);
      setRows(result.rows);
      setColumns(result.rows.length > 0 ? Object.keys(result.rows[0]) : []);
    } finally {
      setLoading(false);
    }
  }, [source.id, config.sheetName]);

  useEffect(() => { loadData(); }, [loadData]);

  const updateConfig = (patch: Partial<ChartConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleSheetChange = (sheetName: string) => {
    const sheet = source.sheets.find((s) => s.name === sheetName);
    updateConfig({
      sheetName,
      xColumn: sheet?.columns[0] || '',
      yColumns: sheet?.columns.slice(1, 2) || [],
    });
  };

  const chartData = rows.length > 0 && config.xColumn && config.yColumns.length > 0
    ? buildChartData(rows, config, dark)
    : null;

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: config.showLegend },
      title: config.title ? { display: true, text: config.title } : undefined,
      tooltip: { mode: 'index', intersect: false },
    },
    scales: ['bar', 'stackedBar', 'line', 'area'].includes(config.chartType) ? {
      x: { grid: { display: config.showGrid } },
      y: {
        grid: { display: config.showGrid },
        stacked: config.chartType === 'stackedBar',
      },
    } : undefined,
  };

  const renderChart = () => {
    if (!chartData) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = chartData as any;
    const opts = chartOptions;
    switch (config.chartType) {
      case 'bar':
      case 'stackedBar': return <Bar data={d} options={opts} />;
      case 'line': return <Line data={d} options={opts} />;
      case 'area': return <Line data={d} options={opts} />;
      case 'pie': return <Pie data={d} options={opts} />;
      case 'doughnut': return <Doughnut data={d} options={opts} />;
      case 'scatter': return <Scatter data={d} options={opts} />;
      case 'radar': return <Radar data={d} options={opts} />;
      case 'polarArea': return <PolarArea data={d} options={opts} />;
      default: return <Bar data={d} options={opts} />;
    }
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(saveName, config);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Controls */}
      <div className="w-72 shrink-0 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Chart Type</h3>
          <div className="grid grid-cols-3 gap-1.5">
            {CHART_TYPES.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => updateConfig({ chartType: type })}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-colors ${
                  config.chartType === type
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Data</h3>
          <Select
            label="Worksheet"
            value={config.sheetName}
            onChange={(e) => handleSheetChange(e.target.value)}
          >
            {source.sheets.map((s) => (
              <option key={s.name} value={s.name}>{s.name}</option>
            ))}
          </Select>
          <Select
            label="X Axis / Labels"
            value={config.xColumn}
            onChange={(e) => updateConfig({ xColumn: e.target.value })}
          >
            <option value="">— Select column —</option>
            {columns.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1.5">
              Y Axis / Values (multi-select)
            </label>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {columns.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:text-brand-600">
                  <input
                    type="checkbox"
                    checked={config.yColumns.includes(c)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateConfig({ yColumns: [...config.yColumns, c] });
                      } else {
                        updateConfig({ yColumns: config.yColumns.filter((y) => y !== c) });
                      }
                    }}
                    className="rounded border-slate-300 text-brand-600"
                  />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Appearance</h3>
          <Input
            label="Chart Title"
            value={config.title || ''}
            onChange={(e) => updateConfig({ title: e.target.value })}
            placeholder="Optional title"
          />
          <Select
            label="Color Scheme"
            value={config.colorScheme || 'default'}
            onChange={(e) => updateConfig({ colorScheme: e.target.value })}
          >
            {Object.keys(COLOR_SCHEMES).map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </Select>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={config.showLegend} onChange={(e) => updateConfig({ showLegend: e.target.checked })} className="rounded border-slate-300 text-brand-600" />
              Legend
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={config.showGrid} onChange={(e) => updateConfig({ showGrid: e.target.checked })} className="rounded border-slate-300 text-brand-600" />
              Grid
            </label>
          </div>
        </div>

        {onSave && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Save Chart</h3>
            <Input
              label="Chart Name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Button onClick={handleSave} loading={saving} className="w-full">
              <Save size={14} />
              Save Configuration
            </Button>
          </div>
        )}
      </div>

      {/* Chart canvas */}
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw size={28} className="animate-spin" />
              <span className="text-sm">Loading data...</span>
            </div>
          </div>
        ) : !chartData ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select X and Y columns to build your chart</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            {renderChart()}
          </div>
        )}
        {rows.length > 0 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
            Plotting {rows.length.toLocaleString()} rows from "{config.sheetName}"
          </p>
        )}
      </div>
    </div>
  );
}
