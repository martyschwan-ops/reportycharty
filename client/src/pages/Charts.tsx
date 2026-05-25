import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Trash2, Edit2, Clock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useDataSources } from '../hooks/useDataSources';
import { chartsApi } from '../utils/api';
import { SavedChart } from '../types';
import { formatDateTime } from '../utils/format';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';

export function Charts() {
  const navigate = useNavigate();
  const { sources } = useDataSources();
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sources.length === 0) return;
    setLoading(true);
    Promise.all(sources.map((s) => chartsApi.list(s.id)))
      .then((results) => setCharts(results.flat()))
      .finally(() => setLoading(false));
  }, [sources]);

  const deleteChart = async (chart: SavedChart) => {
    await chartsApi.delete(chart.id);
    setCharts((prev) => prev.filter((c) => c.id !== chart.id));
    toast.success('Chart deleted');
  };

  const getSourceName = (id: string) => sources.find((s) => s.id === id)?.name || 'Unknown';

  return (
    <>
      <Header
        title="Saved Charts"
        subtitle={`${charts.length} saved configuration${charts.length !== 1 ? 's' : ''}`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <div className="animate-spin w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : charts.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">No saved charts yet</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
              Open a data source and use the Chart Builder to create and save charts
            </p>
            <Button onClick={() => navigate('/sources')}>
              <Plus size={14} />
              Go to Data Sources
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {charts.map((chart) => (
              <div
                key={chart.id}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                      <BarChart3 size={18} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">{chart.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{getSourceName(chart.datasource_id)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/sources/${chart.datasource_id}`)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                      title="Open in editor"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteChart(chart)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <Badge color="blue">{chart.config.chartType}</Badge>
                  <Badge color="gray">{chart.config.sheetName}</Badge>
                  {chart.config.yColumns.length > 0 && (
                    <Badge color="green">{chart.config.yColumns.length} metric{chart.config.yColumns.length !== 1 ? 's' : ''}</Badge>
                  )}
                </div>

                <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Clock size={11} />
                  {formatDateTime(chart.updated_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
