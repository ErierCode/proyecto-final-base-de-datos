import mongoose, { Connection } from 'mongoose';
import { DatabaseSchema, TableColumn, DatabaseTable } from '@/types';

export class MongoDBClient {
  private connection: Connection | null = null;

  async connect(connectionConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }) {
    try {
      // Cerrar conexión anterior si existe
      if (this.connection) {
        await this.connection.close();
      }

      // Construir URI con o sin autenticación
      let uri;
      if (connectionConfig.username && connectionConfig.password) {
        uri = `mongodb://${connectionConfig.username}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`;
      } else {
        uri = `mongodb://${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`;
      }
      
      this.connection = await mongoose.createConnection(uri);
      // Verificar que la conexión esté lista
      await this.connection.asPromise();
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
    let testConnection = null;
    try {
      // Construir URI con o sin autenticación
      let uri;
      if (connectionConfig.username && connectionConfig.password) {
        uri = `mongodb://${connectionConfig.username}:${connectionConfig.password}@${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`;
      } else {
        uri = `mongodb://${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`;
      }
      
      testConnection = await mongoose.createConnection(uri);
      await testConnection.asPromise();
      await testConnection.close();
      
      return { success: true, message: 'Conexión exitosa' };
    } catch (error) {
      // Asegurar que la conexión de prueba se cierre
      if (testConnection) {
        try {
          await testConnection.close();
        } catch (closeError) {
          // Ignorar errores al cerrar
        }
      }
      return { 
        success: false, 
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      };
    }
  }

  async getSchemas(): Promise<DatabaseSchema[]> {
    if (!this.connection) {
      throw new Error('No hay conexión activa');
    }

    try {
      const db = this.connection.db;
      if (!db) {
        throw new Error('Base de datos no disponible');
      }
      
      const collections = await db.listCollections().toArray();
      
      const tables: DatabaseTable[] = [];

      for (const collection of collections) {
        const collectionName = collection.name;
        
        // Obtener una muestra de documentos para inferir la estructura
        const sampleDocs = await db.collection(collectionName).find({}).limit(5).toArray();
        
        // Inferir columnas de los documentos de muestra
        const columns: TableColumn[] = [];
        const fieldTypes = new Map<string, string>();

        sampleDocs.forEach(doc => {
          this.inferFieldTypes(doc, fieldTypes);
        });

        fieldTypes.forEach((type, fieldName) => {
          columns.push({
            name: fieldName,
            type: type,
            nullable: true, // En MongoDB todos los campos son opcionales
            primaryKey: fieldName === '_id',
            defaultValue: fieldName === '_id' ? 'ObjectId()' : undefined
          });
        });

        // Obtener conteo de documentos
        const documentCount = await db.collection(collectionName).countDocuments();

        tables.push({
          name: collectionName,
          type: 'table',
          columns,
          rowCount: documentCount
        });
      }

      return [{
        name: 'default',
        tables
      }];
    } catch (error) {
      throw new Error(`Error al obtener esquemas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  private inferFieldTypes(obj: any, fieldTypes: Map<string, string>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      
      if (value === null) {
        fieldTypes.set(fieldName, 'null');
      } else if (Array.isArray(value)) {
        fieldTypes.set(fieldName, 'array');
        if (value.length > 0) {
          this.inferFieldTypes(value[0], fieldTypes, `${fieldName}[0]`);
        }
      } else if (typeof value === 'object' && value.constructor === Object) {
        fieldTypes.set(fieldName, 'object');
        this.inferFieldTypes(value, fieldTypes, fieldName);
      } else {
        fieldTypes.set(fieldName, typeof value);
      }
    }
  }

  async executeQuery(query: string): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    if (!this.connection) {
      throw new Error('No hay conexión activa');
    }

    try {
      const startTime = Date.now();
      const db = this.connection.db;
      let result: any[] = [];
      let rowCount = 0;

      // 1. Verificar si es un comando directo de MongoDB (db.*)
      if (query.trim().startsWith('db.')) {
        return await this.executeDirectCommand(query, db);
      }

      // 2. Verificar si es un comando SQL para MongoDB (DataGrip style)
      if (this.isSQLQuery(query)) {
        return await this.executeSQLQuery(query, db);
      }

      // 3. Verificar si es un comando JSON estructurado (DataGrip style)
      if (this.isJSONCommand(query)) {
        return await this.executeJSONCommand(query, db);
      }

      // 4. Parsear la consulta JSON (formato original)
      let parsedQuery;
      try {
        parsedQuery = JSON.parse(query);
      } catch (parseError) {
        return {
          success: false,
          error: 'Formato de consulta no reconocido. Use comandos db.*, SQL, o JSON estructurado'
        };
      }

      if (parsedQuery.collection && parsedQuery.operation) {
        const collection = db.collection(parsedQuery.collection);
        
        switch (parsedQuery.operation) {
          case 'find':
            result = await collection.find(parsedQuery.filter || {}).limit(parsedQuery.limit || 100).toArray();
            rowCount = result.length;
            break;
          case 'aggregate':
            result = await collection.aggregate(parsedQuery.pipeline || []).toArray();
            rowCount = result.length;
            break;
          case 'count':
            const count = await collection.countDocuments(parsedQuery.filter || {});
            result = [{ count }];
            rowCount = 1;
            break;
          case 'insertOne':
            const insertResult = await collection.insertOne(parsedQuery.document);
            result = [{ insertedId: insertResult.insertedId }];
            rowCount = 1;
            break;
          case 'insertMany':
            const insertManyResult = await collection.insertMany(parsedQuery.documents);
            result = [{ insertedIds: insertManyResult.insertedIds, insertedCount: insertManyResult.insertedCount }];
            rowCount = 1;
            break;
          case 'updateOne':
            const updateResult = await collection.updateOne(parsedQuery.filter, parsedQuery.update);
            result = [{ modifiedCount: updateResult.modifiedCount, matchedCount: updateResult.matchedCount }];
            rowCount = 1;
            break;
          case 'updateMany':
            const updateManyResult = await collection.updateMany(parsedQuery.filter, parsedQuery.update);
            result = [{ modifiedCount: updateManyResult.modifiedCount, matchedCount: updateManyResult.matchedCount }];
            rowCount = 1;
            break;
          case 'deleteOne':
            const deleteResult = await collection.deleteOne(parsedQuery.filter);
            result = [{ deletedCount: deleteResult.deletedCount }];
            rowCount = 1;
            break;
          case 'deleteMany':
            const deleteManyResult = await collection.deleteMany(parsedQuery.filter);
            result = [{ deletedCount: deleteManyResult.deletedCount }];
            rowCount = 1;
            break;
          default:
            return {
              success: false,
              error: `Operación no soportada: ${parsedQuery.operation}`
            };
        }
      } else {
        return {
          success: false,
          error: 'La consulta debe incluir "collection" y "operation" o ser un comando directo'
        };
      }

      return {
        success: true,
        data: result,
        columns: result.length > 0 ? Object.keys(result[0]) : [],
        rowCount
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private async executeDirectCommand(command: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Limpiar el comando
      const cleanCommand = command.trim();
      
      // Comandos soportados
      if (cleanCommand.startsWith('db.createCollection(')) {
        const collectionName = this.extractCollectionName(cleanCommand);
        if (collectionName) {
          // Verificar si la colección ya existe
          const collections = await db.listCollections({ name: collectionName }).toArray();
          if (collections.length > 0) {
            return {
              success: true,
              data: [{ message: `La colección '${collectionName}' ya existe` }],
              columns: ['message'],
              rowCount: 1
            };
          }
          
          // Crear la colección insertando un documento vacío y luego eliminándolo
          await db.collection(collectionName).insertOne({});
          await db.collection(collectionName).deleteMany({});
          
          return {
            success: true,
            data: [{ message: `Colección '${collectionName}' creada exitosamente` }],
            columns: ['message'],
            rowCount: 1
          };
        }
      }
      
      if (cleanCommand.startsWith('db.dropCollection(')) {
        const collectionName = this.extractCollectionName(cleanCommand);
        if (collectionName) {
          // Verificar si la colección existe
          const collections = await db.listCollections({ name: collectionName }).toArray();
          if (collections.length === 0) {
            return {
              success: true,
              data: [{ message: `La colección '${collectionName}' no existe` }],
              columns: ['message'],
              rowCount: 1
            };
          }
          
          await db.collection(collectionName).drop();
          return {
            success: true,
            data: [{ message: `Colección '${collectionName}' eliminada exitosamente` }],
            columns: ['message'],
            rowCount: 1
          };
        }
      }
      
      if (cleanCommand.startsWith('db.getCollectionNames()')) {
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map((col: any) => col.name);
        return {
          success: true,
          data: collectionNames.map((name: string) => ({ name })),
          columns: ['name'],
          rowCount: collectionNames.length
        };
      }
      
      if (cleanCommand.startsWith('db.stats()')) {
        const stats = await db.stats();
        return {
          success: true,
          data: [stats],
          columns: Object.keys(stats),
          rowCount: 1
        };
      }
      
      if (cleanCommand.startsWith('db.runCommand(')) {
        const commandObj = this.extractCommandObject(cleanCommand);
        if (commandObj) {
          const result = await db.runCommand(commandObj);
          return {
            success: true,
            data: [result],
            columns: Object.keys(result),
            rowCount: 1
          };
        }
      }
      
      // Comandos de colección específica
      const collectionMatch = cleanCommand.match(/db\.(\w+)\./);
      if (collectionMatch) {
        const collectionName = collectionMatch[1];
        const collection = db.collection(collectionName);
        
        if (cleanCommand.includes('.find()')) {
          const result = await collection.find({}).limit(100).toArray();
          return {
            success: true,
            data: result,
            columns: result.length > 0 ? Object.keys(result[0]) : [],
            rowCount: result.length
          };
        }
        
        if (cleanCommand.includes('.count()')) {
          const count = await collection.countDocuments();
          return {
            success: true,
            data: [{ count }],
            columns: ['count'],
            rowCount: 1
          };
        }
        
        if (cleanCommand.includes('.drop()')) {
          await collection.drop();
          return {
            success: true,
            data: [{ message: `Colección '${collectionName}' eliminada exitosamente` }],
            columns: ['message'],
            rowCount: 1
          };
        }
        
        // Manejar insertOne
        if (cleanCommand.includes('.insertOne(')) {
          const document = this.extractDocumentFromInsertOne(cleanCommand);
          if (document) {
            const result = await collection.insertOne(document);
            return {
              success: true,
              data: [{ 
                insertedId: result.insertedId,
                acknowledged: result.acknowledged 
              }],
              columns: ['insertedId', 'acknowledged'],
              rowCount: 1
            };
          } else {
            return {
              success: false,
              error: 'No se pudo parsear el documento para insertOne'
            };
          }
        }
        
        // Manejar insertMany
        if (cleanCommand.includes('.insertMany(')) {
          const documents = this.extractDocumentsFromInsertMany(cleanCommand);
          if (documents) {
            const result = await collection.insertMany(documents);
            return {
              success: true,
              data: [{ 
                insertedIds: result.insertedIds,
                insertedCount: result.insertedCount,
                acknowledged: result.acknowledged 
              }],
              columns: ['insertedIds', 'insertedCount', 'acknowledged'],
              rowCount: 1
            };
          }
        }
      }
      
      return {
        success: false,
        error: `Comando no soportado: ${cleanCommand}`
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando comando directo'
      };
    }
  }

  private extractCollectionName(command: string): string | null {
    // Handle both createCollection and dropCollection
    const createMatch = command.match(/db\.createCollection\(['"]([^'"]+)['"]\)/);
    const dropMatch = command.match(/db\.dropCollection\(['"]([^'"]+)['"]\)/);
    return createMatch ? createMatch[1] : (dropMatch ? dropMatch[1] : null);
  }

  private extractCommandObject(command: string): any | null {
    try {
      const match = command.match(/db\.runCommand\((.+)\)/);
      if (match) {
        return JSON.parse(match[1]);
      }
    } catch (error) {
      // Intentar parsear como objeto JavaScript simple
      const match = command.match(/db\.runCommand\(\{([^}]+)\}\)/);
      if (match) {
        const objStr = '{' + match[1] + '}';
        return JSON.parse(objStr);
      }
    }
    return null;
  }

  private extractDocumentFromInsertOne(command: string): any | null {
    try {
      // Buscar el patrón db.collection.insertOne({...})
      const match = command.match(/\.insertOne\(\s*(\{[\s\S]*?\})\s*\)/);
      if (match) {
        let jsonStr = match[1];
        
        // Reemplazar comillas simples con dobles para JSON válido
        jsonStr = jsonStr.replace(/'/g, '"');
        
        // Manejar nombres de campos sin comillas
        jsonStr = jsonStr.replace(/(\w+):/g, '"$1":');
        
        return JSON.parse(jsonStr);
      }
    } catch (error) {
      console.error('Error parsing insertOne document:', error);
      console.error('Command:', command);
      console.error('Match result:', match);
    }
    return null;
  }

  private extractDocumentsFromInsertMany(command: string): any[] | null {
    try {
      // Buscar el patrón db.collection.insertMany([{...}, {...}])
      const match = command.match(/\.insertMany\(\s*(\[[\s\S]*?\])\s*\)/);
      if (match) {
        // Reemplazar comillas simples con dobles para JSON válido
        const jsonStr = match[1].replace(/'/g, '"');
        return JSON.parse(jsonStr);
      }
    } catch (error) {
      console.error('Error parsing insertMany documents:', error);
    }
    return null;
  }

  // Detectar si es una consulta SQL (DataGrip style)
  private isSQLQuery(query: string): boolean {
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'FROM', 'WHERE', 'JOIN', 'GROUP BY', 'ORDER BY', 'LIMIT'];
    const upperQuery = query.trim().toUpperCase();
    return sqlKeywords.some(keyword => upperQuery.startsWith(keyword));
  }

  // Detectar si es un comando JSON estructurado (DataGrip style)
  private isJSONCommand(query: string): boolean {
    try {
      const parsed = JSON.parse(query);
      return parsed.operation && parsed.collection && typeof parsed === 'object';
    } catch {
      return false;
    }
  }

  // Ejecutar consultas SQL para MongoDB (DataGrip style)
  private async executeSQLQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      const upperQuery = query.trim().toUpperCase();
      
      // SELECT queries
      if (upperQuery.startsWith('SELECT')) {
        return await this.executeSelectQuery(query, db);
      }
      
      // INSERT queries
      if (upperQuery.startsWith('INSERT')) {
        return await this.executeInsertQuery(query, db);
      }
      
      // UPDATE queries
      if (upperQuery.startsWith('UPDATE')) {
        return await this.executeUpdateQuery(query, db);
      }
      
      // DELETE queries
      if (upperQuery.startsWith('DELETE')) {
        return await this.executeDeleteQuery(query, db);
      }
      
      // CREATE TABLE queries
      if (upperQuery.startsWith('CREATE TABLE')) {
        return await this.executeCreateTableQuery(query, db);
      }
      
      return {
        success: false,
        error: 'Tipo de consulta SQL no soportado'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando consulta SQL'
      };
    }
  }

  // Ejecutar comandos JSON estructurados (DataGrip style)
  private async executeJSONCommand(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      const command = JSON.parse(query);
      const collection = db.collection(command.collection);
      
      switch (command.operation) {
        case 'find':
          const findResult = await collection.find(command.filter || {}).limit(command.limit || 100).toArray();
          return {
            success: true,
            data: findResult,
            columns: findResult.length > 0 ? Object.keys(findResult[0]) : [],
            rowCount: findResult.length
          };
          
        case 'insertOne':
          const insertResult = await collection.insertOne(command.document);
          return {
            success: true,
            data: [{ insertedId: insertResult.insertedId, acknowledged: insertResult.acknowledged }],
            columns: ['insertedId', 'acknowledged'],
            rowCount: 1
          };
          
        case 'insertMany':
          const insertManyResult = await collection.insertMany(command.documents);
          return {
            success: true,
            data: [{ 
              insertedIds: insertManyResult.insertedIds, 
              insertedCount: insertManyResult.insertedCount,
              acknowledged: insertManyResult.acknowledged 
            }],
            columns: ['insertedIds', 'insertedCount', 'acknowledged'],
            rowCount: 1
          };
          
        case 'updateOne':
          const updateResult = await collection.updateOne(command.filter, command.update);
          return {
            success: true,
            data: [{ 
              modifiedCount: updateResult.modifiedCount, 
              matchedCount: updateResult.matchedCount,
              acknowledged: updateResult.acknowledged 
            }],
            columns: ['modifiedCount', 'matchedCount', 'acknowledged'],
            rowCount: 1
          };
          
        case 'deleteOne':
          const deleteResult = await collection.deleteOne(command.filter);
          return {
            success: true,
            data: [{ 
              deletedCount: deleteResult.deletedCount,
              acknowledged: deleteResult.acknowledged 
            }],
            columns: ['deletedCount', 'acknowledged'],
            rowCount: 1
          };
          
        default:
          return {
            success: false,
            error: `Operación JSON no soportada: ${command.operation}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando comando JSON'
      };
    }
  }

  // Ejecutar consultas SELECT (SQL to MongoDB)
  private async executeSelectQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Parsear SELECT básico: SELECT * FROM collection WHERE condition LIMIT n
      const selectMatch = query.match(/SELECT\s+\*\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+LIMIT\s+(\d+))?/i);
      
      if (!selectMatch) {
        return {
          success: false,
          error: 'Formato SELECT no reconocido. Use: SELECT * FROM collection [WHERE condition] [LIMIT n]'
        };
      }
      
      const collectionName = selectMatch[1];
      const whereClause = selectMatch[2];
      const limit = selectMatch[3] ? parseInt(selectMatch[3]) : 100;
      
      const collection = db.collection(collectionName);
      
      // Construir filtro desde WHERE clause (básico)
      let filter = {};
      if (whereClause) {
        filter = this.parseWhereClause(whereClause);
      }
      
      const result = await collection.find(filter).limit(limit).toArray();
      
      return {
        success: true,
        data: result,
        columns: result.length > 0 ? Object.keys(result[0]) : [],
        rowCount: result.length
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando SELECT'
      };
    }
  }

  // Ejecutar consultas INSERT (SQL to MongoDB)
  private async executeInsertQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Parsear INSERT básico: INSERT INTO collection VALUES (field1, field2, ...)
      const insertMatch = query.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s*\((.+)\)/i);
      
      if (!insertMatch) {
        return {
          success: false,
          error: 'Formato INSERT no reconocido. Use: INSERT INTO collection VALUES (field1, field2, ...)'
        };
      }
      
      const collectionName = insertMatch[1];
      const valuesStr = insertMatch[2];
      
      // Parsear valores (básico)
      const values = this.parseInsertValues(valuesStr);
      
      const collection = db.collection(collectionName);
      const result = await collection.insertOne(values);
      
      return {
        success: true,
        data: [{ insertedId: result.insertedId, acknowledged: result.acknowledged }],
        columns: ['insertedId', 'acknowledged'],
        rowCount: 1
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando INSERT'
      };
    }
  }

  // Ejecutar consultas UPDATE (SQL to MongoDB)
  private async executeUpdateQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Parsear UPDATE básico: UPDATE collection SET field=value WHERE condition
      const updateMatch = query.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?/i);
      
      if (!updateMatch) {
        return {
          success: false,
          error: 'Formato UPDATE no reconocido. Use: UPDATE collection SET field=value [WHERE condition]'
        };
      }
      
      const collectionName = updateMatch[1];
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      
      const collection = db.collection(collectionName);
      
      // Construir filtro y actualización
      const filter = whereClause ? this.parseWhereClause(whereClause) : {};
      const update = this.parseSetClause(setClause);
      
      const result = await collection.updateMany(filter, { $set: update });
      
      return {
        success: true,
        data: [{ 
          modifiedCount: result.modifiedCount, 
          matchedCount: result.matchedCount,
          acknowledged: result.acknowledged 
        }],
        columns: ['modifiedCount', 'matchedCount', 'acknowledged'],
        rowCount: 1
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando UPDATE'
      };
    }
  }

  // Ejecutar consultas DELETE (SQL to MongoDB)
  private async executeDeleteQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Parsear DELETE básico: DELETE FROM collection WHERE condition
      const deleteMatch = query.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?/i);
      
      if (!deleteMatch) {
        return {
          success: false,
          error: 'Formato DELETE no reconocido. Use: DELETE FROM collection [WHERE condition]'
        };
      }
      
      const collectionName = deleteMatch[1];
      const whereClause = deleteMatch[2];
      
      const collection = db.collection(collectionName);
      
      // Construir filtro
      const filter = whereClause ? this.parseWhereClause(whereClause) : {};
      
      const result = await collection.deleteMany(filter);
      
      return {
        success: true,
        data: [{ deletedCount: result.deletedCount, acknowledged: result.acknowledged }],
        columns: ['deletedCount', 'acknowledged'],
        rowCount: 1
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando DELETE'
      };
    }
  }

  // Parsear cláusula WHERE (mejorado)
  private parseWhereClause(whereClause: string): any {
    // Implementación mejorada para WHERE clauses
    // Ejemplo: "edad > 20" -> { edad: { $gt: 20 } }
    const conditions = whereClause.split(' AND ');
    const filter: any = {};
    
    conditions.forEach(condition => {
      condition = condition.trim();
      
      // Manejar operadores de comparación
      const gtMatch = condition.match(/(\w+)\s*>\s*(.+)/);
      const ltMatch = condition.match(/(\w+)\s*<\s*(.+)/);
      const gteMatch = condition.match(/(\w+)\s*>=\s*(.+)/);
      const lteMatch = condition.match(/(\w+)\s*<=\s*(.+)/);
      const eqMatch = condition.match(/(\w+)\s*=\s*(.+)/);
      const neMatch = condition.match(/(\w+)\s*!=\s*(.+)/);
      
      if (gtMatch) {
        const field = gtMatch[1].trim();
        let value = gtMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = { $gt: value };
      } else if (ltMatch) {
        const field = ltMatch[1].trim();
        let value = ltMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = { $lt: value };
      } else if (gteMatch) {
        const field = gteMatch[1].trim();
        let value = gteMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = { $gte: value };
      } else if (lteMatch) {
        const field = lteMatch[1].trim();
        let value = lteMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = { $lte: value };
      } else if (neMatch) {
        const field = neMatch[1].trim();
        let value = neMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = { $ne: value };
      } else if (eqMatch) {
        const field = eqMatch[1].trim();
        let value = eqMatch[2].trim();
        value = this.parseValue(value);
        filter[field] = value;
      }
    });
    
    return filter;
  }

  // Parsear valor individual
  private parseValue(value: string): any {
    // Remover comillas
    if ((value.startsWith("'") && value.endsWith("'")) || 
        (value.startsWith('"') && value.endsWith('"'))) {
      value = value.slice(1, -1);
    }
    
    // Intentar convertir a número
    if (!isNaN(Number(value))) {
      return Number(value);
    } else if (value === 'true' || value === 'false') {
      return value === 'true';
    } else {
      return value;
    }
  }

  // Parsear cláusula SET (básico)
  private parseSetClause(setClause: string): any {
    const updates: any = {};
    const assignments = setClause.split(',');
    
    assignments.forEach(assignment => {
      const match = assignment.match(/(\w+)\s*=\s*(.+)/);
      if (match) {
        const field = match[1].trim();
        let value = match[2].trim();
        
        // Remover comillas
        if ((value.startsWith("'") && value.endsWith("'")) || 
            (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        
        // Intentar convertir a número
        if (!isNaN(Number(value))) {
          updates[field] = Number(value);
        } else if (value === 'true' || value === 'false') {
          updates[field] = value === 'true';
        } else {
          updates[field] = value;
        }
      }
    });
    
    return updates;
  }

  // Parsear valores de INSERT (básico)
  private parseInsertValues(valuesStr: string): any {
    // Implementación básica para valores de INSERT
    // Ejemplo: "('Juan', 25, 'juan@email.com')" -> { nombre: 'Juan', edad: 25, email: 'juan@email.com' }
    const values = valuesStr.split(',').map(v => v.trim());
    const document: any = {};
    
    // Mapeo mejorado de campos para usuarios
    const fieldNames = ['nombre', 'edad', 'email', 'activo', 'ciudad', 'pais'];
    
    values.forEach((value, index) => {
      if (index < fieldNames.length) {
        let cleanValue = value;
        
        // Remover paréntesis y comillas
        cleanValue = cleanValue.replace(/[()'"]/g, '');
        
        // Solo agregar si el valor no está vacío
        if (cleanValue && cleanValue !== 'null' && cleanValue !== 'undefined') {
          // Intentar convertir a número
          if (!isNaN(Number(cleanValue))) {
            document[fieldNames[index]] = Number(cleanValue);
          } else if (cleanValue === 'true' || cleanValue === 'false') {
            document[fieldNames[index]] = cleanValue === 'true';
          } else {
            document[fieldNames[index]] = cleanValue;
          }
        }
      }
    });
    
    return document;
  }

  // Ejecutar consultas CREATE TABLE (SQL to MongoDB)
  private async executeCreateTableQuery(query: string, db: any): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string; rowCount?: number }> {
    try {
      // Parsear CREATE TABLE básico: CREATE TABLE collection_name
      const createMatch = query.match(/CREATE\s+TABLE\s+(\w+)/i);
      
      if (!createMatch) {
        return {
          success: false,
          error: 'Formato CREATE TABLE no reconocido. Use: CREATE TABLE collection_name'
        };
      }
      
      const collectionName = createMatch[1];
      
      // Verificar si la colección ya existe
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        return {
          success: true,
          data: [{ message: `La colección '${collectionName}' ya existe` }],
          columns: ['message'],
          rowCount: 1
        };
      }
      
      // Crear la colección insertando un documento vacío y luego eliminándolo
      await db.collection(collectionName).insertOne({});
      await db.collection(collectionName).deleteMany({});
      
      return {
        success: true,
        data: [{ message: `Colección '${collectionName}' creada exitosamente` }],
        columns: ['message'],
        rowCount: 1
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error ejecutando CREATE TABLE'
      };
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
    }
  }
}
