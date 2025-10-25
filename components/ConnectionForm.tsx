'use client';

import { useState } from 'react';
import { Database, Server, User, Lock, Database as DbIcon, CheckCircle, XCircle } from 'lucide-react';
import { DatabaseConnection } from '@/types';
import { useAppStore } from '@/lib/store';

interface ConnectionFormProps {
  onConnectionSuccess?: (connection: DatabaseConnection) => void;
}

export default function ConnectionForm({ onConnectionSuccess }: ConnectionFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'postgresql' as 'postgresql' | 'mongodb',
    host: 'localhost',
    port: '5432',
    username: '',
    password: '',
    database: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const { addConnection, setActiveConnection } = useAppStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value,
      };
      
      // Cambiar puerto por defecto según el tipo de base de datos
      if (name === 'type') {
        newData.port = value === 'mongodb' ? '27017' : '5432';
        // Para MongoDB, limpiar credenciales si están vacías (conexión sin autenticación)
        if (value === 'mongodb' && (!newData.username || !newData.password)) {
          newData.username = '';
          newData.password = '';
        }
      }
      
      return newData;
    });
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.data?.message || result.error || 'Error desconocido'
      });

      if (result.success && result.data?.schemas) {
        // Guardar esquemas en el store si la conexión es exitosa
        // Esto se manejará en el componente padre
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Error de conexión'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConnection = async () => {
    if (!testResult?.success) {
      return;
    }

    const connection: DatabaseConnection = {
      id: Date.now().toString(),
      name: formData.name || `${formData.type} - ${formData.host}`,
      type: formData.type,
      host: formData.host,
      port: parseInt(formData.port),
      username: formData.username,
      password: formData.password,
      database: formData.database,
      isConnected: true,
      lastConnected: new Date()
    };

    addConnection(connection);
    setActiveConnection(connection);
    onConnectionSuccess?.(connection);

    // Reset form
    setFormData({
      name: '',
      type: 'postgresql',
      host: 'localhost',
      port: '5432',
      username: '',
      password: '',
      database: ''
    });
    setTestResult(null);
  };

  return (
    <div className="bg-dark-panel rounded-lg p-6 border border-dark-border">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-5 h-5 text-accent-blue" />
        <h2 className="text-xl font-semibold text-dark-text">Nueva Conexión</h2>
      </div>

      <div className="space-y-4">
        {/* Nombre de la conexión */}
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Nombre de la conexión
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Mi Base de Datos"
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>

        {/* Tipo de base de datos */}
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            Tipo de base de datos
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="mongodb">MongoDB</option>
          </select>
        </div>

        {/* Notas informativas */}
        {formData.type === 'mongodb' && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Conexión MongoDB</p>
                <p>• <strong>Sin autenticación:</strong> Deja usuario y contraseña vacíos</p>
                <p>• <strong>Con autenticación:</strong> Proporciona las credenciales</p>
                <p>• <strong>Base de datos:</strong> Nombre de la base de datos (obligatorio)</p>
              </div>
            </div>
          </div>
        )}

        {formData.type === 'postgresql' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-md p-3 mb-4">
            <div className="flex items-start gap-2">
              <Database className="w-4 h-4 text-green-400 mt-0.5" />
              <div className="text-sm text-green-300">
                <p className="font-medium mb-1">Conexión PostgreSQL</p>
                <p>• <strong>Usuario y contraseña:</strong> Obligatorios</p>
                <p>• <strong>Base de datos:</strong> Nombre de la base de datos (obligatorio)</p>
                <p>• <strong>Puerto:</strong> 5432 (por defecto)</p>
              </div>
            </div>
          </div>
        )}

        {/* Host y Puerto */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              <Server className="w-4 h-4 inline mr-1" />
              Host
            </label>
            <input
              type="text"
              name="host"
              value={formData.host}
              onChange={handleInputChange}
              placeholder="localhost"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              Puerto
            </label>
            <input
              type="number"
              name="port"
              value={formData.port}
              onChange={handleInputChange}
              placeholder={formData.type === 'postgresql' ? '5432' : '27017'}
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Usuario y Contraseña */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="usuario"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
        </div>

        {/* Base de datos */}
        <div>
          <label className="block text-sm font-medium text-dark-text-secondary mb-2">
            <DbIcon className="w-4 h-4 inline mr-1" />
            Base de datos
          </label>
          <input
            type="text"
            name="database"
            value={formData.database}
            onChange={handleInputChange}
            placeholder="nombre_base_datos"
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded-md text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
          />
        </div>

        {/* Resultado de la prueba */}
        {testResult && (
          <div className={`p-3 rounded-md flex items-center gap-2 ${
            testResult.success 
              ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
              : 'bg-red-900/20 border border-red-500/30 text-red-400'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{testResult.message}</span>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={handleTestConnection}
            disabled={isLoading || !formData.host || !formData.database || (formData.type === 'postgresql' && !formData.username)}
            className="flex-1 px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Probando...' : 'Probar Conexión'}
          </button>
          
          {testResult?.success && (
            <button
              onClick={handleSaveConnection}
              className="flex-1 px-4 py-2 bg-accent-green text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Guardar Conexión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
