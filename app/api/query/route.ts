import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLClient } from '@/lib/postgres';
import { MongoDBClient } from '@/lib/mongodb';
import { ApiResponse, QueryResult } from '@/types';

// Clientes globales para mantener conexiones activas
const postgresClients = new Map<string, PostgreSQLClient>();
const mongoClients = new Map<string, MongoDBClient>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connectionId, query, connectionConfig } = body;

    if (!connectionId || !query) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'connectionId y query son requeridos'
      }, { status: 400 });
    }

    let client;
    let result: QueryResult;

    if (connectionConfig.type === 'postgresql') {
      // Obtener o crear cliente PostgreSQL
      if (!postgresClients.has(connectionId)) {
        const postgresClient = new PostgreSQLClient();
        const connectResult = await postgresClient.connect({
          host: connectionConfig.host,
          port: connectionConfig.port,
          username: connectionConfig.username,
          password: connectionConfig.password,
          database: connectionConfig.database
        });

        if (!connectResult.success) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: connectResult.message
          }, { status: 400 });
        }

        postgresClients.set(connectionId, postgresClient);
      }

      client = postgresClients.get(connectionId)!;
      result = await client.executeQuery(query);
    } else if (connectionConfig.type === 'mongodb') {
      // Obtener o crear cliente MongoDB
      if (!mongoClients.has(connectionId)) {
        const mongoClient = new MongoDBClient();
        const connectResult = await mongoClient.connect({
          host: connectionConfig.host,
          port: connectionConfig.port,
          username: connectionConfig.username,
          password: connectionConfig.password,
          database: connectionConfig.database
        });

        if (!connectResult.success) {
          return NextResponse.json<ApiResponse>({
            success: false,
            error: connectResult.message
          }, { status: 400 });
        }

        mongoClients.set(connectionId, mongoClient);
      }

      client = mongoClients.get(connectionId)!;
      result = await client.executeQuery(query);
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Tipo de base de datos no soportado'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse<QueryResult>>({
      success: result.success,
      data: result,
      message: result.success ? 'Consulta ejecutada exitosamente' : result.error
    });

  } catch (error) {
    console.error('Error en API de consulta:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Endpoint para desconectar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    const type = searchParams.get('type');

    if (!connectionId || !type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'connectionId y type son requeridos'
      }, { status: 400 });
    }

    if (type === 'postgresql' && postgresClients.has(connectionId)) {
      const client = postgresClients.get(connectionId)!;
      await client.disconnect();
      postgresClients.delete(connectionId);
    } else if (type === 'mongodb' && mongoClients.has(connectionId)) {
      const client = mongoClients.get(connectionId)!;
      await client.disconnect();
      mongoClients.delete(connectionId);
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Conexión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error al desconectar:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error al desconectar'
    }, { status: 500 });
  }
}
