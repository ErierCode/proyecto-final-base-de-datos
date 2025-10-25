'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  Play, 
  Trash2, 
  Clock, 
  Database, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Calendar
} from 'lucide-react';
import { QueryHistory } from '@/types';
import { useAppStore } from '@/lib/store';

export default function HistoryPage() {
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'postgresql' | 'mongodb'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const { activeConnection } = useAppStore();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history');
      const result = await response.json();
      
      if (result.success) {
        setHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error al eliminar del historial:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
      return;
    }

    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error al limpiar historial:', error);
    }
  };

  const executeQuery = (query: string) => {
    // Implementar lógica para ejecutar consulta desde el historial
    console.log('Ejecutar consulta:', query);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.query.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || item.databaseType === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'success' && item.success) ||
      (filterStatus === 'error' && !item.success);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="p-6 border-b border-dark-border bg-dark-panel">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-accent-blue" />
            <h1 className="text-2xl font-bold text-dark-text">Historial de Consultas</h1>
            <span className="text-sm text-dark-text-secondary">
              {history.length} consultas
            </span>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={clearAllHistory}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Todo
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-text-secondary" />
            <input
              type="text"
              placeholder="Buscar en consultas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          {/* Filtro por tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          >
            <option value="all">Todos los tipos</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>

          {/* Filtro por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="success">Exitosas</option>
            <option value="error">Con errores</option>
          </select>
        </div>
      </div>

      {/* Lista de historial */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-dark-text mb-2">
              {history.length === 0 ? 'No hay consultas en el historial' : 'No se encontraron consultas'}
            </h3>
            <p className="text-dark-text-secondary">
              {history.length === 0 
                ? 'Las consultas que ejecutes aparecerán aquí'
                : 'Intenta ajustar los filtros de búsqueda'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-dark-panel border border-dark-border rounded-lg p-4 hover:border-accent-blue/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {item.success ? (
                        <CheckCircle className="w-5 h-5 text-accent-green" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <Database className="w-4 h-4 text-accent-blue" />
                      <span className="text-sm font-medium text-dark-text">
                        {item.databaseType.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(item.executedAt)}</span>
                      <span>•</span>
                      <span>{formatDuration(item.executionTime)}</span>
                      {item.resultCount !== undefined && (
                        <>
                          <span>•</span>
                          <span>{item.resultCount} resultados</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => executeQuery(item.query)}
                      className="p-2 hover:bg-dark-bg rounded-md transition-colors"
                      title="Ejecutar consulta"
                    >
                      <Play className="w-4 h-4 text-accent-green" />
                    </button>
                    
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="p-2 hover:bg-red-500/20 rounded-md transition-colors"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-dark-bg rounded-md p-3">
                  <pre className="text-sm text-dark-text whitespace-pre-wrap font-mono">
                    {item.query}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
