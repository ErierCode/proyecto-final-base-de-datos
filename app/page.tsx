"use client";

import { useState } from "react";
import { Database, Plus, History, Settings, X, Copy } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import QueryEditor from "@/components/QueryEditor";
import ResultsView from "@/components/ResultsView";
import ConnectionForm from "@/components/ConnectionForm";
import { useAppStore } from "@/lib/store";
import { DatabaseConnection, QueryResult, DatabaseSchema } from "@/types";
import toast from "react-hot-toast";

export default function HomePage() {
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);

  const {
    activeConnection,
    schemas,
    setSchemas,
    tabs,
    activeTab,
    setActiveTab,
    addTab,
    updateTab,
    deleteTab,
    queryHistory,
    clearQueryHistory,
  } = useAppStore();

  const handleConnectionSuccess = async (connection: DatabaseConnection) => {
    setShowConnectionForm(false);

    // Limpiar esquemas anteriores
    setSchemas([]);

    // Obtener esquemas de la nueva conexión
    try {
      const response = await fetch("/api/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: connection.type,
          host: connection.host,
          port: connection.port,
          username: connection.username,
          password: connection.password,
          database: connection.database,
        }),
      });

      const result = await response.json();
      if (result.success && result.data?.schemas) {
        setSchemas(result.data.schemas);
        toast.success("Conexión establecida y esquemas cargados");
      } else {
        toast.error(
          "Error cargando esquemas: " + (result.error || "Error desconocido")
        );
      }
    } catch (error) {
      console.error("Error al obtener esquemas:", error);
      toast.error("Error conectando a la base de datos");
    }
  };

  const handleQueryResult = (result: QueryResult) => {
    setQueryResult(result);
  };

  const handleTableSelect = (table: any) => {
    // Crear nueva pestaña con consulta de ejemplo
    const newTab = {
      id: Date.now().toString(),
      name: `SELECT * FROM ${table.name}`,
      query: `SELECT * FROM ${table.name} LIMIT 10;`,
      isDirty: false,
    };
    addTab(newTab);
  };

  const handleNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      name: "Nueva consulta",
      query: "",
      isDirty: false,
    };
    addTab(newTab);
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length <= 1) {
      // No permitir cerrar la última pestaña
      toast.error("No se puede cerrar la última pestaña");
      return;
    }

    deleteTab(tabId);
    toast.success("Pestaña cerrada");

    // Si la pestaña cerrada era la activa, cambiar a otra
    if (activeTab === tabId) {
      const remainingTabs = tabs.filter((tab) => tab.id !== tabId);
      if (remainingTabs.length > 0) {
        setActiveTab(remainingTabs[0].id);
      }
    }
  };

  const handleHistoryQuerySelect = (query: string) => {
    if (activeTab) {
      updateTab(activeTab, {
        query: query,
        isDirty: true,
      });
      setShowHistory(false);
      toast.success("Consulta cargada desde el historial");
    }
  };

  const handleClearHistory = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todo el historial?")) {
      clearQueryHistory();
      toast.success("Historial limpiado");
    }
  };

  const handleCopyQuery = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      toast.success("Consulta copiada al portapapeles");
    } catch (error) {
      toast.error("Error al copiar la consulta");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header principal */}
      <header className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-panel">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-accent-blue" />
            <h1 className="text-xl font-bold text-dark-text">Mini DataGrip</h1>
          </div>

          {activeConnection && (
            <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
              <div className="w-2 h-2 bg-accent-green rounded-full"></div>
              <span>{activeConnection.name}</span>
              <span>({activeConnection.type?.toUpperCase() || "UNKNOWN"})</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConnectionForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Conexión
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
            title="Historial de consultas"
          >
            <History className="w-4 h-4 text-dark-text-secondary" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-dark-bg rounded-md transition-colors"
          >
            <Settings className="w-4 h-4 text-dark-text-secondary" />
          </button>
        </div>
      </header>

      {/* Contenido principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          schemas={schemas}
          activeConnection={activeConnection}
          onTableSelect={handleTableSelect}
          onNewConnection={() => setShowConnectionForm(true)}
        />

        {/* Área principal */}
        <div className="flex-1 flex flex-col">
          {/* Pestañas */}
          {tabs.length > 0 && (
            <div className="flex items-center border-b border-dark-border bg-dark-panel">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-dark-border cursor-pointer transition-colors ${activeTab === tab.id
                      ? "bg-dark-bg text-dark-text border-b-2 border-accent-blue"
                      : "text-dark-text-secondary hover:text-dark-text hover:bg-dark-bg"
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="text-sm">{tab.name}</span>
                  {tab.isDirty && <span className="text-accent-orange">●</span>}
                  <button
                    onClick={(e) => handleCloseTab(tab.id)}
                    className="p-1 hover:bg-dark-border rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <button
                onClick={handleNewTab}
                className="p-2 hover:bg-dark-bg rounded-md transition-colors"
                title="Nueva pestaña"
              >
                <Plus className="w-4 h-4 text-dark-text-secondary" />
              </button>
            </div>
          )}

          {/* Editor y resultados */}
          <div className="flex-1 flex">
            {/* Editor de consultas */}
            <div className="flex-1">
              <QueryEditor
                activeConnection={activeConnection}
                onQueryResult={handleQueryResult}
              />
            </div>
            {/* Panel de resultados o ejemplos */}
            <div className="w-1/2 border-l border-dark-border">
              <ResultsView result={queryResult} />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de conexión */}
      {showConnectionForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-panel rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-dark-text">
                Nueva Conexión
              </h2>
              <button
                onClick={() => setShowConnectionForm(false)}
                className="p-2 hover:bg-dark-bg rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-dark-text-secondary" />
              </button>
            </div>

            <ConnectionForm onConnectionSuccess={handleConnectionSuccess} />
          </div>
        </div>
      )}

      {/* Modal de historial */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-panel rounded-lg w-full h-[80vh] mx-4 max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-xl font-semibold text-dark-text">
                Historial de Consultas
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearHistory}
                  className="px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-md transition-colors text-sm"
                >
                  Limpiar Todo
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-dark-bg rounded-md transition-colors"
                >
                  <X className="w-5 h-5 text-dark-text-secondary" />
                </button>
              </div>
            </div>

            <div className="h-full overflow-y-auto p-4">
              {queryHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-text mb-2">
                    Sin historial
                  </h3>
                  <p className="text-sm text-dark-text-secondary">
                    Ejecuta algunas consultas para ver el historial aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {queryHistory.map((history, index) => (
                    <div
                      key={index}
                      className="bg-dark-bg border border-dark-border rounded-lg p-4 hover:bg-dark-panel transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${history.success ? "bg-accent-green" : "bg-red-500"
                              }`}
                          />
                          <span className="text-sm font-medium text-dark-text">
                            {history.databaseType?.toUpperCase() || "UNKNOWN"}
                          </span>
                          <span className="text-xs text-dark-text-secondary">
                            {new Date(history.executedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-dark-text-secondary">
                            {history.executionTime}ms
                          </span>
                          <button
                            onClick={() =>
                              handleHistoryQuerySelect(history.query)
                            }
                            className="px-2 py-1 bg-accent-blue text-white rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            Reejecutar
                          </button>
                          <button
                            onClick={() => handleCopyQuery(history.query)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            Copiar
                          </button>
                        </div>
                      </div>

                      <div className="bg-dark-panel rounded p-3 mb-2">
                        <pre className="text-sm text-dark-text whitespace-pre-wrap overflow-x-auto">
                          {history.query}
                        </pre>
                      </div>

                      {history.resultCount !== undefined && (
                        <div className="text-xs text-dark-text-secondary">
                          {history.resultCount} resultados
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de configuración */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-panel rounded-lg w-full mx-4 max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-lg font-semibold text-dark-text">
                Configuración
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-dark-bg rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-dark-text-secondary" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">
                  Ayuda
                </label>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowManual(true);
                  }}
                  className="px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  📖 Ver Manual de Comandos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de manual */}
      {showManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-panel rounded-lg w-full h-[80vh] mx-4 max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-border">
              <h2 className="text-lg font-semibold text-dark-text">
                Manual de Comandos
              </h2>
              <button
                onClick={() => setShowManual(false)}
                className="p-2 hover:bg-dark-bg rounded-md transition-colors"
              >
                <X className="w-5 h-5 text-dark-text-secondary" />
              </button>
            </div>

            <div className="max-h-[calc(80vh-4rem)] overflow-y-auto p-4">
              <div className="space-y-6">
                {/* PostgreSQL */}
                <div>
                  <h3 className="text-xl font-semibold text-dark-text mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    PostgreSQL
                  </h3>
                  <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                    <div>
                      <h4 className="font-medium text-dark-text mb-2">
                        Consultas básicas:
                      </h4>
                      <pre className="text-sm text-dark-text-secondary bg-dark-panel p-3 rounded overflow-x-auto">
                        {`SELECT * FROM tabla WHERE condicion = 'valor';
INSERT INTO tabla (columna1, columna2) VALUES ('valor1', 'valor2');
UPDATE tabla SET columna = 'nuevo_valor' WHERE condicion = 'valor';
DELETE FROM tabla WHERE condicion = 'valor';`}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium text-dark-text mb-2">
                        Crear tablas:
                      </h4>
                      <pre className="text-sm text-dark-text-secondary bg-dark-panel p-3 rounded overflow-x-auto">
                        {`CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT NOW()
);`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* MongoDB */}
                <div>
                  <h3 className="text-xl font-semibold text-dark-text mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-green-400" />
                    MongoDB
                  </h3>

                  {/* Forma 1: Comandos directos */}
                  <div className="mb-4">
                    <h4 className="font-medium text-dark-text mb-2">
                      1. Comandos directos (db.*):
                    </h4>
                    <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                      <pre className="text-sm text-dark-text-secondary bg-dark-panel p-3 rounded overflow-x-auto">
                        {`// Crear colección
db.createCollection("usuarios")

// Insertar documentos
db.usuarios.insertOne({
  nombre: "Juan",
  edad: 25,
  email: "juan@email.com"
})

// Consultar documentos
db.usuarios.find()
db.usuarios.find({edad: {$gt: 20}})

// Actualizar documentos
db.usuarios.updateOne(
  {nombre: "Juan"}, 
  {$set: {edad: 26}}
)

// Eliminar documentos
db.usuarios.deleteOne({nombre: "Juan"})`}
                      </pre>
                    </div>
                  </div>

                  {/* Forma 2: SQL */}
                  <div className="mb-4">
                    <h4 className="font-medium text-dark-text mb-2">
                      2. Comandos SQL:
                    </h4>
                    <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                      <pre className="text-sm text-dark-text-secondary bg-dark-panel p-3 rounded overflow-x-auto">
                        {`// Crear colección
CREATE TABLE usuarios

// Insertar documentos
INSERT INTO usuarios VALUES ('Juan', 25, 'juan@email.com')

// Consultar documentos
SELECT * FROM usuarios WHERE edad > 20 LIMIT 10

// Actualizar documentos
UPDATE usuarios SET edad = 26 WHERE nombre = 'Juan'

// Eliminar documentos
DELETE FROM usuarios WHERE nombre = 'Juan'`}
                      </pre>
                    </div>
                  </div>

                  {/* Forma 3: JSON estructurado */}
                  <div>
                    <h4 className="font-medium text-dark-text mb-2">
                      3. Comandos JSON estructurado:
                    </h4>
                    <div className="bg-dark-bg rounded-lg p-4 space-y-3">
                      <pre className="text-sm text-dark-text-secondary bg-dark-panel p-3 rounded overflow-x-auto">
                        {`// Consultar documentos
{
  "collection": "usuarios",
  "operation": "find",
  "filter": {"edad": {"$gt": 20}},
  "limit": 10
}

// Insertar documento
{
  "collection": "usuarios",
  "operation": "insertOne",
  "document": {
    "nombre": "Juan",
    "edad": 25,
    "email": "juan@email.com"
  }
}

// Actualizar documento
{
  "collection": "usuarios",
  "operation": "updateOne",
  "filter": {"nombre": "Juan"},
  "update": {"edad": 26}
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
