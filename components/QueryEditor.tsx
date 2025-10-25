'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Play, Save, Copy, Download, RotateCcw } from 'lucide-react';
import { DatabaseConnection, QueryResult, QueryTab } from '@/types';
import { useAppStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface QueryEditorProps {
  activeConnection: DatabaseConnection | null;
  onQueryResult: (result: QueryResult) => void;
}

export default function QueryEditor({ activeConnection, onQueryResult }: QueryEditorProps) {
  const [query, setQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  
  const { 
    tabs, 
    activeTab, 
    updateTab, 
    addQueryToHistory 
  } = useAppStore();

  const currentTab = tabs.find(tab => tab.id === activeTab);

  // Sincronizar query con la pestaña activa
  useEffect(() => {
    if (currentTab) {
      setQuery(currentTab.query);
    }
  }, [currentTab?.id, currentTab?.query]);

  const handleQueryChange = (value: string | undefined) => {
    const newQuery = value || '';
    setQuery(newQuery);
    
    if (currentTab) {
      updateTab(currentTab.id, { 
        query: newQuery, 
        isDirty: newQuery !== currentTab.query 
      });
    }
  };

  const executeQuery = async () => {
    if (!activeConnection) {
      toast.error('❌ No hay conexión activa. Por favor, selecciona una conexión de base de datos.');
      return;
    }
    
    if (!query.trim()) {
      toast.error('❌ Escribe una consulta para ejecutar. El editor está vacío.');
      return;
    }

    setIsExecuting(true);
    const startTime = Date.now();
    toast.loading('Ejecutando consulta...', { id: 'query-execution' });

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: activeConnection.id,
          query: query.trim(),
          connectionConfig: {
            type: activeConnection.type,
            host: activeConnection.host,
            port: activeConnection.port,
            username: activeConnection.username,
            password: activeConnection.password,
            database: activeConnection.database
          }
        }),
      });

      const result = await response.json();
      const executionTime = Date.now() - startTime;
      setExecutionTime(executionTime);

      if (result.success) {
        const queryResult: QueryResult = {
          success: result.data.success,
          data: result.data.data,
          columns: result.data.columns,
          error: result.data.error,
          executionTime,
          rowCount: result.data.rowCount
        };

        onQueryResult(queryResult);

        // Guardar en historial
        addQueryToHistory({
          query: query.trim(),
          databaseType: activeConnection.type,
          connectionId: activeConnection.id,
          executedAt: new Date(),
          executionTime,
          success: queryResult.success,
          resultCount: queryResult.rowCount || 0
        });

        // Actualizar pestaña
        if (currentTab) {
          updateTab(currentTab.id, { 
            result: queryResult,
            isDirty: false 
          });
        }

        toast.dismiss('query-execution');
        toast.success(`✅ Consulta ejecutada exitosamente en ${executionTime}ms`);
      } else {
        const errorResult: QueryResult = {
          success: false,
          error: result.error || 'Error desconocido',
          executionTime
        };
        onQueryResult(errorResult);
        toast.dismiss('query-execution');
        toast.error(`❌ Error en la consulta: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      const errorResult: QueryResult = {
        success: false,
        error: 'Error de conexión con la base de datos',
        executionTime: Date.now() - startTime
      };
      onQueryResult(errorResult);
      toast.dismiss('query-execution');
      toast.error('❌ Error de conexión. Verifica que la base de datos esté disponible.');
    } finally {
      setIsExecuting(false);
    }
  };

  // Manejar atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        executeQuery();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [executeQuery]);

  const getLanguage = () => {
    if (!activeConnection) return 'sql';
    if (activeConnection.type === 'postgresql') return 'sql';
    
    // Para MongoDB, detectar el tipo de consulta
    const trimmedQuery = query.trim();
    
    // Si es SQL (SELECT, INSERT, UPDATE, DELETE, CREATE)
    if (trimmedQuery.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s/i)) {
      return 'sql';
    }
    
    // Si es un comando directo de MongoDB (db.*)
    if (trimmedQuery.startsWith('db.') || 
        trimmedQuery.startsWith('//') || 
        trimmedQuery.includes('db.createCollection') ||
        trimmedQuery.includes('db.getCollectionNames') ||
        trimmedQuery.includes('db.stats') ||
        trimmedQuery.includes('db.runCommand')) {
      return 'javascript'; // Comandos directos de MongoDB
    }
    
    // Si es JSON válido
    if (trimmedQuery.startsWith('{') && trimmedQuery.endsWith('}')) {
      return 'json';
    }
    
    // Por defecto, usar sql para evitar errores de validación
    return 'sql';
  };

  const getPlaceholder = () => {
    if (!activeConnection) return 'Selecciona una conexión para comenzar';
    
    if (activeConnection.type === 'postgresql') {
      return `-- Consulta SQL para PostgreSQL
SELECT * FROM tabla_ejemplo 
WHERE condicion = 'valor'
LIMIT 10;`;
    } else {
      return `// Comandos directos de MongoDB
db.createCollection("mi_coleccion")
db.getCollectionNames()
db.usuarios.find()
db.usuarios.find({ activo: true })
db.stats()

// O consultas JSON
{
  "collection": "usuarios",
  "operation": "find",
  "filter": { "activo": true },
  "limit": 10
}`;
    }
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(query);
    toast.success('📋 Consulta copiada al portapapeles');
  };

  const downloadQuery = () => {
    const blob = new Blob([query], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_${Date.now()}.${getLanguage()}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('💾 Consulta descargada exitosamente');
  };

  const resetQuery = () => {
    setQuery('');
    if (currentTab) {
      updateTab(currentTab.id, { query: '', isDirty: false });
    }
    toast.success('🧹 Editor limpiado');
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Header del editor */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-panel">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-dark-text">
            {currentTab?.name || 'Editor de consultas'}
          </h3>
          {currentTab?.isDirty && (
            <span className="text-xs text-accent-orange">● Sin guardar</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {executionTime && (
            <span className="text-sm text-dark-text-secondary">
              {executionTime}ms
            </span>
          )}
          
          <button
            onClick={copyQuery}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Copiar consulta"
          >
            <Copy className="w-4 h-4 text-dark-text-secondary" />
          </button>
          
          <button
            onClick={downloadQuery}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Descargar consulta"
          >
            <Download className="w-4 h-4 text-dark-text-secondary" />
          </button>
          
          <button
            onClick={resetQuery}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Limpiar editor"
          >
            <RotateCcw className="w-4 h-4 text-dark-text-secondary" />
          </button>
          
          <button
            onClick={executeQuery}
            disabled={!activeConnection || !query.trim() || isExecuting}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Play className="w-4 h-4" />
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage()}
          value={query}
          onChange={handleQueryChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            quickSuggestions: true,
            parameterHints: { enabled: true },
            hover: { enabled: true },
            contextmenu: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'blink',
            cursorSmoothCaretAnimation: 'on',
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            fontLigatures: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true
            }
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue"></div>
            </div>
          }
        />
      </div>

      {/* Footer con información */}
      <div className="p-3 border-t border-dark-border bg-dark-panel">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <div className="flex items-center gap-4">
            <span>
              {activeConnection 
                ? `${activeConnection.type.toUpperCase()} - ${activeConnection.database}`
                : 'Sin conexión'
              }
            </span>
            <span>
              {query.length} caracteres
            </span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-dark-bg border border-dark-border rounded text-xs">
              Ctrl+Enter
            </kbd>
            <span>para ejecutar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
