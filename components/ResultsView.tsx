'use client';

import { useState } from 'react';
import { 
  Table, 
  FileText, 
  Download, 
  Copy, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { QueryResult } from '@/types';

interface ResultsViewProps {
  result: QueryResult | null;
}

export default function ResultsView({ result }: ResultsViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');
  const [showColumns, setShowColumns] = useState(true);

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <Table className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
          <p className="text-dark-text-secondary">
            Ejecuta una consulta para ver los resultados
          </p>
        </div>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="h-full flex items-center justify-center bg-dark-bg">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error en la consulta</h3>
          <p className="text-dark-text-secondary mb-4">{result.error}</p>
          {result.executionTime && (
            <p className="text-sm text-dark-text-secondary">
              Tiempo de ejecución: {result.executionTime}ms
            </p>
          )}
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadResults = () => {
    if (!result.data) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (viewMode === 'json') {
      content = JSON.stringify(result.data, null, 2);
      filename = `results_${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      // Convertir a CSV
      if (result.columns && result.data.length > 0) {
        const headers = result.columns.join(',');
        const rows = result.data.map((row: any) => 
          result.columns!.map(col => {
            const value = row[col];
            // Escapar comillas y envolver en comillas si contiene comas
            const escaped = String(value || '').replace(/"/g, '""');
            return escaped.includes(',') ? `"${escaped}"` : escaped;
          }).join(',')
        );
        content = [headers, ...rows].join('\n');
        filename = `results_${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(result.data, null, 2);
        filename = `results_${Date.now()}.json`;
        mimeType = 'application/json';
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyResults = () => {
    if (!result.data) return;
    
    const content = viewMode === 'json' 
      ? JSON.stringify(result.data, null, 2)
      : JSON.stringify(result.data, null, 2);
    
    copyToClipboard(content);
  };

  return (
    <div className="h-full flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-panel">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent-green" />
            <span className="text-lg font-semibold text-dark-text">
              Resultados
            </span>
          </div>
          
          {result.executionTime && (
            <div className="flex items-center gap-1 text-sm text-dark-text-secondary">
              <Clock className="w-4 h-4" />
              <span>{result.executionTime}ms</span>
            </div>
          )}
          
          {result.rowCount !== undefined && (
            <span className="text-sm text-dark-text-secondary">
              {result.rowCount.toLocaleString()} filas
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle de vista */}
          <div className="flex bg-dark-bg rounded-md border border-dark-border">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-accent-blue text-white'
                  : 'text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              <Table className="w-4 h-4 inline mr-1" />
              Tabla
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
                viewMode === 'json'
                  ? 'bg-accent-blue text-white'
                  : 'text-dark-text-secondary hover:text-dark-text'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              JSON
            </button>
          </div>

          {/* Botones de acción */}
          <button
            onClick={copyResults}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Copiar resultados"
          >
            <Copy className="w-4 h-4 text-dark-text-secondary" />
          </button>
          
          <button
            onClick={downloadResults}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Descargar resultados"
          >
            <Download className="w-4 h-4 text-dark-text-secondary" />
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          <div className="p-4">
            {result.data && result.data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border">
                      {result.columns?.map((column, index) => (
                        <th
                          key={index}
                          className="text-left p-3 text-sm font-medium text-dark-text-secondary bg-dark-panel"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.map((row: any, rowIndex: number) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-dark-border hover:bg-dark-panel/50 transition-colors"
                      >
                        {result.columns?.map((column, colIndex) => (
                          <td
                            key={colIndex}
                            className="p-3 text-sm text-dark-text"
                          >
                            {row[column] !== null && row[column] !== undefined
                              ? String(row[column])
                              : <span className="text-dark-text-secondary italic">null</span>
                            }
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Table className="w-8 h-8 text-dark-text-secondary mx-auto mb-2" />
                <p className="text-dark-text-secondary">No hay datos para mostrar</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <pre className="bg-dark-panel rounded-md p-4 overflow-auto text-sm text-dark-text whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="p-3 border-t border-dark-border bg-dark-panel">
        <div className="flex items-center justify-between text-sm text-dark-text-secondary">
          <div className="flex items-center gap-4">
            <span>
              {result.data?.length || 0} registros
            </span>
            {result.columns && (
              <span>
                {result.columns.length} columnas
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowColumns(!showColumns)}
              className="flex items-center gap-1 hover:text-dark-text transition-colors"
            >
              {showColumns ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span>{showColumns ? 'Ocultar' : 'Mostrar'} columnas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
