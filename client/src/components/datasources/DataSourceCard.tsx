import { useState, useRef } from 'react';
import { FileSpreadsheet, MoreVertical, Pencil, Trash2, RefreshCw, Eye, Layers } from 'lucide-react';
import { DataSource } from '../../types';
import { formatBytes, formatDateTime } from '../../utils/format';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

interface DataSourceCardProps {
  source: DataSource;
  onSelect: (source: DataSource) => void;
  onRename: (source: DataSource) => void;
  onDelete: (source: DataSource) => void;
  onRefresh: (source: DataSource) => void;
  selected?: boolean;
}

export function DataSourceCard({
  source,
  onSelect,
  onRename,
  onDelete,
  onRefresh,
  selected,
}: DataSourceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={clsx(
        'group relative bg-white dark:bg-slate-800 rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md',
        selected
          ? 'border-brand-500 ring-2 ring-brand-200 dark:ring-brand-800'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      )}
      onClick={() => onSelect(source)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
            <FileSpreadsheet size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate max-w-[160px]">
              {source.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
              {source.filename}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-8 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {[
                { icon: Eye, label: 'Open', action: () => { onSelect(source); setMenuOpen(false); } },
                { icon: Pencil, label: 'Rename', action: () => { onRename(source); setMenuOpen(false); } },
                { icon: RefreshCw, label: 'Refresh', action: () => { onRefresh(source); setMenuOpen(false); } },
                { icon: Trash2, label: 'Delete', action: () => { onDelete(source); setMenuOpen(false); }, danger: true },
              ].map(({ icon: Icon, label, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  className={clsx(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg',
                    danger
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  )}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge color="blue">
          <Layers size={10} className="mr-1" />
          {source.sheets.length} sheet{source.sheets.length !== 1 ? 's' : ''}
        </Badge>
        <Badge color="gray">{formatBytes(source.size)}</Badge>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        Updated {formatDateTime(source.updated_at)}
      </p>
    </div>
  );
}
