import { Header } from '../components/layout/Header';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Database, Info } from 'lucide-react';

export function Settings() {
  const { dark, toggle } = useTheme();

  return (
    <>
      <Header title="Settings" subtitle="Application preferences" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl">
        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dark ? <Moon size={18} className="text-brand-400" /> : <Sun size={18} className="text-yellow-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {dark ? 'Dark Mode' : 'Light Mode'}
                  </p>
                  <p className="text-xs text-slate-400">Toggle the color scheme</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-brand-600' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-6' : ''}`}
                />
              </button>
            </div>
          </section>

          {/* Storage */}
          <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Database size={16} />
              Storage
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Excel files location</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">server/uploads/</code>
              </div>
              <div className="flex justify-between">
                <span>Database location</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">server/data/reportycharty.db</code>
              </div>
            </div>
          </section>

          {/* About */}
          <section className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Info size={16} />
              About
            </h3>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Application</span>
                <span className="font-medium">ReportyCharty</span>
              </div>
              <div className="flex justify-between">
                <span>Version</span>
                <span className="font-mono text-xs">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Stack</span>
                <span>React + Node.js + SQLite</span>
              </div>
              <div className="flex justify-between">
                <span>Data storage</span>
                <span>100% local — no cloud</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
