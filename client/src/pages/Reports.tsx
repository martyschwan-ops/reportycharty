import { useState } from 'react';
import { FileText, BarChart3 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { StatsReport } from '../components/reports/StatsReport';
import { useDataSources } from '../hooks/useDataSources';
import { Select } from '../components/ui/Select';
import { DataSource } from '../types';

export function Reports() {
  const { sources } = useDataSources();
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedSheet, setSelectedSheet] = useState('');

  const selectedSource: DataSource | undefined = sources.find((s) => s.id === selectedSourceId);

  const handleSourceChange = (id: string) => {
    setSelectedSourceId(id);
    const s = sources.find((src) => src.id === id);
    setSelectedSheet(s?.sheets[0]?.name || '');
  };

  return (
    <>
      <Header
        title="Reports"
        subtitle="Statistical summaries and column analysis"
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={selectedSourceId}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="w-48"
            >
              <option value="">Select data source...</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            {selectedSource && selectedSource.sheets.length > 1 && (
              <Select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-40"
              >
                {selectedSource.sheets.map((sh) => (
                  <option key={sh.name} value={sh.name}>{sh.name}</option>
                ))}
              </Select>
            )}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {!selectedSource ? (
          <div className="text-center py-20">
            <div className="flex items-center justify-center gap-3 mb-4 text-slate-300 dark:text-slate-600">
              <FileText size={40} />
              <BarChart3 size={40} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">Select a data source to generate a report</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Statistical analysis of all columns including min, max, mean, and more</p>
          </div>
        ) : (
          <StatsReport source={selectedSource} sheetName={selectedSheet} />
        )}
      </div>
    </>
  );
}
