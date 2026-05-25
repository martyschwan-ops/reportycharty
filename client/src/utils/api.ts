import axios from 'axios';
import { DataSource, SavedChart, ChartConfig, StatsResult } from '../types';

const api = axios.create({ baseURL: '/api' });

export const datasourcesApi = {
  list: () => api.get<DataSource[]>('/datasources').then((r) => r.data),
  recent: () => api.get<DataSource[]>('/datasources/recent').then((r) => r.data),
  upload: (file: File, name?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    return api.post<DataSource>('/datasources/upload', form).then((r) => r.data);
  },
  rename: (id: string, name: string) =>
    api.put<DataSource>(`/datasources/${id}`, { name }).then((r) => r.data),
  refresh: (id: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<DataSource>(`/datasources/${id}/refresh`, form).then((r) => r.data);
  },
  delete: (id: string) => api.delete(`/datasources/${id}`).then((r) => r.data),
  recordView: (id: string) => api.post(`/datasources/${id}/view`).then((r) => r.data),
};

export const dataApi = {
  getPage: (
    id: string,
    sheet: string,
    params: { page?: number; pageSize?: number; sort?: string; dir?: string; [key: string]: any }
  ) =>
    api
      .get<{ rows: Record<string, unknown>[]; total: number; columns: string[] }>(
        `/data/${id}/${encodeURIComponent(sheet)}`,
        { params }
      )
      .then((r) => r.data),
  getAll: (id: string, sheet: string) =>
    api.get<{ rows: Record<string, unknown>[]; total: number }>(
      `/data/${id}/${encodeURIComponent(sheet)}/all`
    ).then((r) => r.data),
  getStats: (id: string, sheet: string) =>
    api.get<StatsResult>(`/data/${id}/${encodeURIComponent(sheet)}/stats`).then((r) => r.data),
  exportCsv: (id: string, sheet: string) =>
    `/api/data/${id}/${encodeURIComponent(sheet)}/export`,
};

export const chartsApi = {
  list: (datasourceId: string) =>
    api.get<SavedChart[]>(`/charts/${datasourceId}`).then((r) => r.data),
  save: (datasource_id: string, name: string, config: ChartConfig) =>
    api.post<SavedChart>('/charts', { datasource_id, name, config }).then((r) => r.data),
  update: (id: string, name: string, config: ChartConfig) =>
    api.put<SavedChart>(`/charts/${id}`, { name, config }).then((r) => r.data),
  delete: (id: string) => api.delete(`/charts/${id}`).then((r) => r.data),
};

export const insightsApi = {
  get: (id: string, sheet: string) =>
    api
      .get<{ insights: string[]; rowCount: number; columnCount: number }>(
        `/insights/${id}/${encodeURIComponent(sheet)}`
      )
      .then((r) => r.data),
};
