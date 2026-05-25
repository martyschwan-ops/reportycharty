export interface SheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

export interface DataSource {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  size: number;
  uploaded_at: string;
  updated_at: string;
  sheets: SheetInfo[];
}

export type ChartType =
  | 'bar'
  | 'line'
  | 'pie'
  | 'doughnut'
  | 'area'
  | 'scatter'
  | 'stackedBar'
  | 'radar'
  | 'polarArea';

export interface ChartConfig {
  chartType: ChartType;
  sheetName: string;
  xColumn: string;
  yColumns: string[];
  groupBy?: string;
  aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
  filters?: Record<string, string>;
  title?: string;
  colorScheme?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  stacked?: boolean;
}

export interface SavedChart {
  id: string;
  datasource_id: string;
  name: string;
  config: ChartConfig;
  created_at: string;
  updated_at: string;
}

export interface ColumnStats {
  type: 'numeric' | 'categorical';
  count: number;
  nullCount: number;
  // numeric
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  sum?: number;
  // categorical
  uniqueCount?: number;
  topValues?: { value: string; count: number }[];
}

export interface StatsResult {
  columns: string[];
  stats: Record<string, ColumnStats>;
  rowCount: number;
}

export type ViewMode = 'table' | 'chart' | 'report' | 'insights';
