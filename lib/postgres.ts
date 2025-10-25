import { Pool, PoolClient } from 'pg';
import { DatabaseSchema, TableColumn, DatabaseTable } from '@/types';

// Pool de conexiones PostgreSQL
let pool: Pool | null = null;

export class PostgreSQLClient {
  private client: PoolClient | null = null;

  async connect(connectionConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }) {
    try {
      // Cerrar conexión anterior si existe
      if (this.client) {
        await this.client.release();
      }

      // Crear nuevo pool
      pool = new Pool({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.username,
        password: connectionConfig.password,
        database: connectionConfig.database,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      this.client = await pool.connect();
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      return { 
        success: false, 
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  async testConnection(connectionConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }) {
    let testPool: Pool | null = null;
    let client: PoolClient | null = null;
    
    try {
      testPool = new Pool({
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.username,
        password: connectionConfig.password,
        database: connectionConfig.database,
        max: 1,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
        ssl: false, // Deshabilitar SSL para conexiones locales
      });

      client = await testPool.connect();
      await client.query('SELECT 1');
      
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      console.error('Error de conexión PostgreSQL:', error);
      
      let errorMessage = 'Error desconocido';
      if (error instanceof Error) {
        if (error.message.includes('ECONNREFUSED')) {
          errorMessage = 'No se puede conectar al servidor. Verifica que PostgreSQL esté ejecutándose.';
        } else if (error.message.includes('ENOTFOUND')) {
          errorMessage = 'No se puede resolver el host. Verifica la dirección del servidor.';
        } else if (error.message.includes('authentication failed')) {
          errorMessage = 'Credenciales incorrectas. Verifica usuario y contraseña.';
        } else if (error.message.includes('database') && error.message.includes('does not exist')) {
          errorMessage = 'La base de datos no existe. Verifica el nombre de la base de datos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { 
        success: false, 
        message: `Error de conexión: ${errorMessage}` 
      };
    } finally {
      // Limpiar recursos
      try {
        if (client) {
          client.release();
        }
        if (testPool) {
          await testPool.end();
        }
      } catch (cleanupError) {
        console.warn('Error al limpiar recursos:', cleanupError);
      }
    }
  }

  async getSchemas(): Promise<DatabaseSchema[]> {
    if (!this.client) {
      throw new Error('No hay conexión activa');
    }

    try {
      // Obtener esquemas
      const schemasResult = await this.client.query(`
        SELECT schema_name 
        FROM information_schema.schemata 
        WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY schema_name
      `);

      const schemas: DatabaseSchema[] = [];

      for (const schemaRow of schemasResult.rows) {
        const schemaName = schemaRow.schema_name;
        
        // Obtener tablas del esquema
        const tablesResult = await this.client!.query(`
          SELECT 
            table_name,
            table_type,
            (SELECT COUNT(*) FROM information_schema.columns 
             WHERE table_schema = $1 AND table_name = t.table_name) as column_count
          FROM information_schema.tables t
          WHERE table_schema = $1
          ORDER BY table_name
        `, [schemaName]);

        const tables: DatabaseTable[] = [];

        for (const tableRow of tablesResult.rows) {
          // Obtener columnas de la tabla
          const columnsResult = await this.client!.query(`
            SELECT 
              c.column_name,
              c.data_type,
              c.is_nullable,
              c.column_default,
              CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary_key
            FROM information_schema.columns c
            LEFT JOIN (
              SELECT ku.column_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage ku 
                ON tc.constraint_name = ku.constraint_name
              WHERE tc.constraint_type = 'PRIMARY KEY' 
                AND tc.table_schema = $1 
                AND tc.table_name = $2
            ) pk ON c.column_name = pk.column_name
            WHERE c.table_schema = $1 AND c.table_name = $2
            ORDER BY c.ordinal_position
          `, [schemaName, tableRow.table_name]);

          const columns: TableColumn[] = columnsResult.rows.map(col => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            primaryKey: col.is_primary_key,
            defaultValue: col.column_default
          }));

          tables.push({
            name: tableRow.table_name,
            type: tableRow.table_type === 'BASE TABLE' ? 'table' : 'view',
            columns,
            rowCount: 0 // Se puede calcular con COUNT(*) si es necesario
          });
        }

        schemas.push({
          name: schemaName,
          tables
        });
      }

      return schemas;
    } catch (error) {
      throw new Error(`Error al obtener esquemas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  async executeQuery(query: string): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    if (!this.client) {
      throw new Error('No hay conexión activa');
    }

    try {
      const startTime = Date.now();
      const result = await this.client.query(query);
      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: result.rows,
        columns: result.fields?.map(field => field.name) || [],
        rowCount: result.rowCount || 0
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.release();
      this.client = null;
    }
    if (pool) {
      await pool.end();
      pool = null;
    }
  }
}
