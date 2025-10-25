'use client';

import { useEffect, useState } from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { DatabaseConnection } from '@/types';

export default function AutoConnector() {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [configStatus, setConfigStatus] = useState<{
    postgres: 'checking' | 'success' | 'error' | 'not-available';
    mongodb: 'checking' | 'success' | 'error' | 'not-available';
  }>({
    postgres: 'checking',
    mongodb: 'checking'
  });

  const { addConnection, setActiveConnection } = useAppStore();

  useEffect(() => {
    configureConnections();
  }, []);

  const configureConnections = async () => {
    setIsConfiguring(true);

    // Configurar PostgreSQL
    await configurePostgreSQL();
    
    // Configurar MongoDB
    await configureMongoDB();

    setIsConfiguring(false);
  };

  const configurePostgreSQL = async () => {
    try {
      setConfigStatus(prev => ({ ...prev, postgres: 'checking' }));

      // Probar conexión PostgreSQL
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          username: 'root2',
          password: 'hola',
          database: 'prueba5'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Crear conexión automática
        const connection: DatabaseConnection = {
          id: 'auto-postgres',
          name: 'PostgreSQL (Auto)',
          type: 'postgresql',
          host: 'localhost',
          port: 5432,
          username: 'root2',
          password: 'hola',
          database: 'prueba5',
          isConnected: true,
          lastConnected: new Date()
        };

        addConnection(connection);
        setActiveConnection(connection);
        setConfigStatus(prev => ({ ...prev, postgres: 'success' }));
      } else {
        setConfigStatus(prev => ({ ...prev, postgres: 'error' }));
      }
    } catch (error) {
      console.error('Error configurando PostgreSQL:', error);
      setConfigStatus(prev => ({ ...prev, postgres: 'not-available' }));
    }
  };

  const configureMongoDB = async () => {
    try {
      setConfigStatus(prev => ({ ...prev, mongodb: 'checking' }));

      // Probar conexión MongoDB
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'mongodb',
          host: 'localhost',
          port: 27017,
          username: '',
          password: '',
          database: 'mini_datagrip'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Crear conexión automática
        const connection: DatabaseConnection = {
          id: 'auto-mongodb',
          name: 'MongoDB (Auto)',
          type: 'mongodb',
          host: 'localhost',
          port: 27017,
          username: '',
          password: '',
          database: 'mini_datagrip',
          isConnected: true,
          lastConnected: new Date()
        };

        addConnection(connection);
        setConfigStatus(prev => ({ ...prev, mongodb: 'success' }));
      } else {
        setConfigStatus(prev => ({ ...prev, mongodb: 'error' }));
      }
    } catch (error) {
      console.error('Error configurando MongoDB:', error);
      setConfigStatus(prev => ({ ...prev, mongodb: 'not-available' }));
    }
  };

  const runAutoSetup = async () => {
    try {
      const response = await fetch('/api/auto-setup', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Reconfigurar conexiones después del setup
        await configureConnections();
      }
    } catch (error) {
      console.error('Error ejecutando auto-setup:', error);
    }
  };

  if (isConfiguring) {
    return (
      <div className="fixed inset-0 bg-dark-bg/90 flex items-center justify-center z-50">
        <div className="bg-dark-panel rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Loader className="w-12 h-12 text-accent-blue mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold text-dark-text mb-4">
              Configurando Conexiones
            </h2>
            <p className="text-dark-text-secondary mb-6">
              Configurando automáticamente las conexiones a las bases de datos...
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-accent-blue" />
                <span className="text-dark-text">PostgreSQL</span>
                {configStatus.postgres === 'checking' && <Loader className="w-4 h-4 animate-spin" />}
                {configStatus.postgres === 'success' && <CheckCircle className="w-4 h-4 text-accent-green" />}
                {configStatus.postgres === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                {configStatus.postgres === 'not-available' && <XCircle className="w-4 h-4 text-dark-text-secondary" />}
              </div>
              
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-accent-green" />
                <span className="text-dark-text">MongoDB</span>
                {configStatus.mongodb === 'checking' && <Loader className="w-4 h-4 animate-spin" />}
                {configStatus.mongodb === 'success' && <CheckCircle className="w-4 h-4 text-accent-green" />}
                {configStatus.mongodb === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                {configStatus.mongodb === 'not-available' && <XCircle className="w-4 h-4 text-dark-text-secondary" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay conexiones exitosas, mostrar opciones
  const hasSuccessfulConnections = configStatus.postgres === 'success' || configStatus.mongodb === 'success';
  
  if (!hasSuccessfulConnections) {
    return (
      <div className="fixed inset-0 bg-dark-bg/90 flex items-center justify-center z-50">
        <div className="bg-dark-panel rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <Database className="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-dark-text mb-4">
              Configuración de Bases de Datos
            </h2>
            <p className="text-dark-text-secondary mb-6">
              No se pudieron configurar automáticamente las conexiones. 
              Necesitas instalar y configurar las bases de datos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 border border-dark-border rounded-lg">
                <h3 className="font-semibold text-dark-text mb-2">PostgreSQL</h3>
                <div className="flex items-center gap-2 mb-2">
                  {configStatus.postgres === 'success' && <CheckCircle className="w-4 h-4 text-accent-green" />}
                  {configStatus.postgres === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                  {configStatus.postgres === 'not-available' && <XCircle className="w-4 h-4 text-dark-text-secondary" />}
                  <span className="text-sm text-dark-text-secondary">
                    {configStatus.postgres === 'success' && 'Conectado'}
                    {configStatus.postgres === 'error' && 'Error de conexión'}
                    {configStatus.postgres === 'not-available' && 'No disponible'}
                  </span>
                </div>
                <p className="text-xs text-dark-text-secondary">
                  Host: localhost:5432<br/>
                  Usuario: root2<br/>
                  Base de datos: prueba5
                </p>
              </div>
              
              <div className="p-4 border border-dark-border rounded-lg">
                <h3 className="font-semibold text-dark-text mb-2">MongoDB</h3>
                <div className="flex items-center gap-2 mb-2">
                  {configStatus.mongodb === 'success' && <CheckCircle className="w-4 h-4 text-accent-green" />}
                  {configStatus.mongodb === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
                  {configStatus.mongodb === 'not-available' && <XCircle className="w-4 h-4 text-dark-text-secondary" />}
                  <span className="text-sm text-dark-text-secondary">
                    {configStatus.mongodb === 'success' && 'Conectado'}
                    {configStatus.mongodb === 'error' && 'Error de conexión'}
                    {configStatus.mongodb === 'not-available' && 'No disponible'}
                  </span>
                </div>
                <p className="text-xs text-dark-text-secondary">
                  Host: localhost:27017<br/>
                  Base de datos: mini_datagrip
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={runAutoSetup}
                className="w-full px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Ejecutar Configuración Automática
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-dark-panel text-dark-text border border-dark-border rounded-md hover:bg-dark-bg transition-colors"
              >
                Reintentar Conexiones
              </button>
            </div>
            
            <div className="mt-6 p-4 bg-dark-bg rounded-lg">
              <h4 className="font-semibold text-dark-text mb-2">Instrucciones Rápidas:</h4>
              <div className="text-sm text-dark-text-secondary space-y-1">
                <p><strong>Windows:</strong> Ejecuta <code>scripts\install-windows.bat</code></p>
                <p><strong>Linux:</strong> <code>sudo apt install postgresql mongodb-org</code></p>
                <p><strong>macOS:</strong> <code>brew install postgresql mongodb-community</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null; // No mostrar nada si hay conexiones exitosas
}
