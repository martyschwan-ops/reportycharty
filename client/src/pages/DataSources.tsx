import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { DataSourceCard } from '../components/datasources/DataSourceCard';
import { UploadZone } from '../components/datasources/UploadZone';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useDataSources } from '../hooks/useDataSources';
import { DataSource } from '../types';

export function DataSources() {
  const navigate = useNavigate();
  const { sources, loading, upload, rename, remove, refresh } = useDataSources();
  const [search, setSearch] = useState('');
  const [renameTarget, setRenameTarget] = useState<DataSource | null>(null);
  const [renameName, setRenameName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DataSource | null>(null);
  const [refreshTarget, setRefreshTarget] = useState<DataSource | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const refreshInput = useRef<HTMLInputElement>(null);

  const filtered = sources.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.filename.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpload = async (file: File) => {
    const ds = await upload(file);
    if (ds) { setShowUpload(false); navigate(`/sources/${ds.id}`); }
  };

  const handleRename = async () => {
    if (!renameTarget || !renameName.trim()) return;
    await rename(renameTarget.id, renameName.trim());
    setRenameTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  };

  const handleRefreshFile = async (file: File) => {
    if (!refreshTarget) return;
    await refresh(refreshTarget.id, file);
    setRefreshTarget(null);
  };

  return (
    <>
      <Header
        title="Data Sources"
        subtitle={`${sources.length} Excel file${sources.length !== 1 ? 's' : ''} loaded`}
        actions={
          <Button onClick={() => setShowUpload(true)} size="sm">
            <Plus size={14} />
            Add Source
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto p-6">
        {/* Search */}
        <div className="mb-6">
          <Input
            icon={<Search size={14} />}
            placeholder="Search data sources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <RefreshCw size={24} className="animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-300 dark:text-slate-600 mb-4">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="currentColor" className="mx-auto">
                <rect x="8" y="4" width="48" height="56" rx="4" opacity="0.3" />
                <rect x="16" y="16" width="32" height="3" rx="1.5" />
                <rect x="16" y="24" width="24" height="3" rx="1.5" />
                <rect x="16" y="32" width="28" height="3" rx="1.5" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">
              {search ? 'No matching data sources' : 'No data sources yet'}
            </p>
            {!search && (
              <Button onClick={() => setShowUpload(true)} variant="primary" className="mt-3">
                <Plus size={14} />
                Upload your first Excel file
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((s) => (
              <DataSourceCard
                key={s.id}
                source={s}
                onSelect={(ds) => navigate(`/sources/${ds.id}`)}
                onRename={(ds) => { setRenameTarget(ds); setRenameName(ds.name); }}
                onDelete={setDeleteTarget}
                onRefresh={setRefreshTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Add Data Source" size="lg">
        <UploadZone onUpload={handleUpload} />
      </Modal>

      {/* Rename modal */}
      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename Data Source" size="sm">
        <div className="space-y-4">
          <Input
            label="New name"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameName.trim()}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Data Source" size="sm">
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This will remove the file and all saved charts.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Refresh modal */}
      <Modal open={!!refreshTarget} onClose={() => setRefreshTarget(null)} title="Refresh Data Source" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Upload a new version of <strong>"{refreshTarget?.name}"</strong>. The existing data will be replaced.
          </p>
          <input
            ref={refreshInput}
            type="file"
            accept=".xlsx,.xls,.xlsm"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleRefreshFile(e.target.files[0])}
          />
          <Button onClick={() => refreshInput.current?.click()}>
            <RefreshCw size={14} />
            Choose New File
          </Button>
        </div>
      </Modal>
    </>
  );
}
