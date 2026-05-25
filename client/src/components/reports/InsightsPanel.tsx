import { useState, useEffect } from 'react';
import { DataSource } from '../../types';
import { insightsApi } from '../../utils/api';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface InsightsPanelProps {
  source: DataSource;
  sheetName: string;
}

function parseMarkdown(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

export function InsightsPanel({ source, sheetName }: InsightsPanelProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await insightsApi.get(source.id, sheetName);
      setInsights(data.insights);
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoaded(false);
    setInsights([]);
  }, [source.id, sheetName]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Lightbulb size={16} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI-Powered Insights</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automated analysis of your data</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={load}
          loading={loading}
        >
          <RefreshCw size={14} />
          {loaded ? 'Refresh' : 'Analyze Data'}
        </Button>
      </div>

      {!loaded && !loading && (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-12 text-center">
          <Lightbulb size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">Click "Analyze Data" to generate insights</p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            We'll detect trends, outliers, data quality issues, and more
          </p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-32 gap-3 text-slate-400">
          <div className="animate-spin w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
          <span className="text-sm">Analyzing your data...</span>
        </div>
      )}

      {loaded && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="flex gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl animate-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-6 h-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">{i + 1}</span>
              </div>
              <p
                className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(insight) }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
