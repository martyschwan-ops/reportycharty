import { useState, useEffect, useCallback } from 'react';
import { DataSource } from '../types';
import { datasourcesApi } from '../utils/api';
import toast from 'react-hot-toast';

export function useDataSources() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await datasourcesApi.list();
      setSources(data);
      setError(null);
    } catch {
      setError('Failed to load data sources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const upload = useCallback(async (file: File, name?: string): Promise<DataSource | null> => {
    try {
      const ds = await datasourcesApi.upload(file, name);
      setSources((prev) => [ds, ...prev]);
      toast.success(`"${ds.name}" uploaded successfully`);
      return ds;
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
      return null;
    }
  }, []);

  const rename = useCallback(async (id: string, name: string): Promise<boolean> => {
    try {
      const updated = await datasourcesApi.rename(id, name);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Renamed successfully');
      return true;
    } catch {
      toast.error('Rename failed');
      return false;
    }
  }, []);

  const refresh = useCallback(async (id: string, file: File): Promise<boolean> => {
    try {
      const updated = await datasourcesApi.refresh(id, file);
      setSources((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success('Data refreshed successfully');
      return true;
    } catch {
      toast.error('Refresh failed');
      return false;
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await datasourcesApi.delete(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      toast.success('Data source deleted');
      return true;
    } catch {
      toast.error('Delete failed');
      return false;
    }
  }, []);

  return { sources, loading, error, reload: load, upload, rename, refresh, remove };
}
