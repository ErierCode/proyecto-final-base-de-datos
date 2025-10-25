// Tipos para conexiones de base de datos
export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mongodb';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  isConnected: boolean;
  lastConnected?: Date;
}

// Tipos para esquemas y tablas
export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  defaultValue?: string;
}

export interface DatabaseTable {
  name: string;
  type: 'table' | 'view';
  columns: TableColumn[];
  rowCount?: number;
}

export interface DatabaseSchema {
  name: string;
  tables: DatabaseTable[];
}

// Tipos para consultas
export interface QueryResult {
  success: boolean;
  data?: any[];
  columns?: string[];
  error?: string;
  executionTime?: number;
  rowCount?: number;
}

export interface QueryHistory {
  id: string;
  query: string;
  databaseType: 'postgresql' | 'mongodb';
  connectionId: string;
  executedAt: Date;
  executionTime: number;
  success: boolean;
  resultCount?: number;
}

// Tipos para el estado global
export interface AppState {
  connections: DatabaseConnection[];
  activeConnection: DatabaseConnection | null;
  schemas: DatabaseSchema[];
  queryHistory: QueryHistory[];
  activeTab: string;
  tabs: QueryTab[];
}

export interface QueryTab {
  id: string;
  name: string;
  query: string;
  result?: QueryResult;
  isDirty: boolean;
}

// Tipos para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ConnectionTestResponse {
  success: boolean;
  message: string;
  schemas?: DatabaseSchema[];
}
