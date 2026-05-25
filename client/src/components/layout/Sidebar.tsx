import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, BarChart3, FileText, Settings, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sources', icon: Database, label: 'Data Sources' },
  { path: '/charts', icon: BarChart3, label: 'Charts' },
  { path: '/reports', icon: FileText, label: 'Reports' },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="w-60 h-full bg-slate-900 dark:bg-slate-950 flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <BarChart3 size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">ReportyCharty</h1>
            <p className="text-slate-400 text-xs">Analytics Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon size={16} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4">
        <Link
          to="/settings"
          className={clsx(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
              ? 'bg-brand-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          )}
        >
          <Settings size={16} />
          Settings
        </Link>
        <div className="mt-4 px-3 py-3 bg-slate-800 rounded-lg">
          <p className="text-slate-400 text-xs">Local-first • No cloud</p>
          <p className="text-slate-500 text-xs mt-0.5">Data stays on your Mac</p>
        </div>
      </div>
    </aside>
  );
}
