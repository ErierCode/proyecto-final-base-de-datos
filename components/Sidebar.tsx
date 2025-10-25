'use client';

import { useState } from 'react';
import { 
  Database, 
  ChevronRight, 
  ChevronDown, 
  Table, 
  Eye, 
  Server, 
  Plus,
  Settings,
  History,
  Trash2
} from 'lucide-react';
import { DatabaseSchema, DatabaseTable, DatabaseConnection } from '@/types';
import { useAppStore } from '@/lib/store';

interface SidebarProps {
  schemas: DatabaseSchema[];
  activeConnection: DatabaseConnection | null;
  onTableSelect?: (table: DatabaseTable) => void;
  onNewConnection?: () => void;
}

export default function Sidebar({ 
  schemas, 
  activeConnection, 
  onTableSelect,
  onNewConnection 
}: SidebarProps) {
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  
  const { connections, deleteConnection } = useAppStore();

  const toggleSchema = (schemaName: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(schemaName)) {
      newExpanded.delete(schemaName);
    } else {
      newExpanded.add(schemaName);
    }
    setExpandedSchemas(newExpanded);
  };

  const toggleTable = (tableKey: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableKey)) {
      newExpanded.delete(tableKey);
    } else {
      newExpanded.add(tableKey);
    }
    setExpandedTables(newExpanded);
  };

  const handleTableClick = (table: DatabaseTable) => {
    onTableSelect?.(table);
  };

  const handleDeleteConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    const connectionName = connection?.name || 'esta conexión';
    
    if (confirm(`⚠️ ¿Estás seguro de que quieres eliminar "${connectionName}"?\n\nEsta acción no se puede deshacer y se perderán todas las configuraciones de esta conexión.`)) {
      deleteConnection(connectionId);
      // Mostrar mensaje de éxito
      if (typeof window !== 'undefined') {
        // Usar toast si está disponible, sino alert
        if (window.confirm()) {
          alert(`✅ Conexión "${connectionName}" eliminada exitosamente.`);
        }
      }
    }
  };

  const loadSchemasForConnection = async (connection: DatabaseConnection) => {
    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: connection.type,
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          database: connection.database
        }),
      });

      const result = await response.json();
      if (result.success && result.data?.schemas) {
        const { setSchemas } = useAppStore.getState();
        setSchemas(result.data.schemas);
      }
    } catch (error) {
      console.error('Error al obtener esquemas:', error);
    }
  };

  return (
    <div className="w-80 bg-dark-sidebar border-r border-dark-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-text">Explorador</h2>
          <button
            onClick={onNewConnection}
            className="p-1 hover:bg-dark-panel rounded-md transition-colors"
            title="Nueva conexión"
          >
            <Plus className="w-4 h-4 text-dark-text-secondary" />
          </button>
        </div>

        {/* Conexiones guardadas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-dark-text-secondary">Conexiones</h3>
          {connections.length === 0 ? (
            <div className="text-center py-4">
              <Database className="w-8 h-8 text-dark-text-secondary mx-auto mb-2" />
              <p className="text-sm text-dark-text-secondary mb-3">
                No hay conexiones guardadas
              </p>
              <button
                onClick={onNewConnection}
                className="px-3 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                Crear Primera Conexión
              </button>
            </div>
          ) : (
            connections.map((connection) => (
              <div
                key={connection.id}
                className={`p-2 rounded-md cursor-pointer transition-colors group ${
                  activeConnection?.id === connection.id
                    ? 'bg-accent-blue/20 border border-accent-blue/30'
                    : 'hover:bg-dark-panel'
                }`}
                onClick={async () => {
                  const { setActiveConnection, setSchemas } = useAppStore.getState();
                  setActiveConnection(connection.id);
                  // Limpiar esquemas anteriores
                  setSchemas([]);
                  // Recargar esquemas para la nueva conexión
                  await loadSchemasForConnection(connection);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-accent-blue" />
                    <span className="text-sm text-dark-text truncate">
                      {connection.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                    title="Eliminar conexión"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Server className="w-3 h-3 text-dark-text-secondary" />
                  <span className="text-xs text-dark-text-secondary">
                    {connection.host}:{connection.port}
                  </span>
                  <span className="text-xs text-dark-text-secondary">
                    ({connection.type})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Esquemas */}
      <div className="flex-1 overflow-y-auto">
        {activeConnection ? (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-accent-green" />
              <span className="text-sm font-medium text-dark-text">
                {activeConnection.database}
              </span>
            </div>

            {schemas.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-8 h-8 text-dark-text-secondary mx-auto mb-2" />
                <p className="text-sm text-dark-text-secondary">
                  No hay esquemas disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {schemas.map((schema) => (
                  <div key={schema.name}>
                    {/* Esquema */}
                    <div
                      className="flex items-center gap-2 p-2 hover:bg-dark-panel rounded-md cursor-pointer"
                      onClick={() => toggleSchema(schema.name)}
                    >
                      {expandedSchemas.has(schema.name) ? (
                        <ChevronDown className="w-4 h-4 text-dark-text-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-dark-text-secondary" />
                      )}
                      <Database className="w-4 h-4 text-accent-blue" />
                      <span className="text-sm text-dark-text">{schema.name}</span>
                      <span className="text-xs text-dark-text-secondary ml-auto">
                        {schema.tables.length}
                      </span>
                    </div>

                    {/* Tablas del esquema */}
                    {expandedSchemas.has(schema.name) && (
                      <div className="ml-6 space-y-1">
                        {schema.tables.map((table) => (
                          <div key={`${schema.name}.${table.name}`}>
                            {/* Tabla */}
                            <div
                              className="flex items-center gap-2 p-2 hover:bg-dark-panel rounded-md cursor-pointer"
                              onClick={() => toggleTable(`${schema.name}.${table.name}`)}
                            >
                              {expandedTables.has(`${schema.name}.${table.name}`) ? (
                                <ChevronDown className="w-4 h-4 text-dark-text-secondary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-dark-text-secondary" />
                              )}
                              {table.type === 'table' ? (
                                <Table className="w-4 h-4 text-accent-green" />
                              ) : (
                                <Eye className="w-4 h-4 text-accent-orange" />
                              )}
                              <span className="text-sm text-dark-text">{table.name}</span>
                              {table.rowCount !== undefined && (
                                <span className="text-xs text-dark-text-secondary ml-auto">
                                  {table.rowCount.toLocaleString()}
                                </span>
                              )}
                            </div>

                            {/* Columnas de la tabla */}
                            {expandedTables.has(`${schema.name}.${table.name}`) && (
                              <div className="ml-6 space-y-1">
                                {table.columns.map((column) => (
                                  <div
                                    key={column.name}
                                    className="flex items-center gap-2 p-1 hover:bg-dark-panel rounded cursor-pointer"
                                    onClick={() => handleTableClick(table)}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${
                                      column.primaryKey 
                                        ? 'bg-yellow-400' 
                                        : column.nullable 
                                        ? 'bg-dark-text-secondary' 
                                        : 'bg-accent-blue'
                                    }`} />
                                    <span className="text-xs text-dark-text-secondary">
                                      {column.name}
                                    </span>
                                    <span className="text-xs text-dark-text-secondary ml-auto">
                                      {column.type}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center">
            <Database className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
            <p className="text-sm text-dark-text-secondary mb-4">
              Selecciona una conexión para explorar la base de datos
            </p>
            <button
              onClick={onNewConnection}
              className="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Nueva Conexión
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
          <Settings className="w-4 h-4" />
          <span>Mini DataGrip</span>
        </div>
      </div>
    </div>
  );
}
