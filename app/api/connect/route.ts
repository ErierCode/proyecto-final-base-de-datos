import { NextRequest, NextResponse } from 'next/server';
import { PostgreSQLClient } from '@/lib/postgres';
import { MongoDBClient } from '@/lib/mongodb';
import { ApiResponse, ConnectionTestResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, host, port, username, password, database } = body;

    // Validar campos requeridos según el tipo de base de datos
    if (!type || !host || !port || !database) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Host, puerto y base de datos son requeridos'
      }, { status: 400 });
    }

    // Para PostgreSQL, usuario y contraseña son obligatorios
    if (type === 'postgresql' && (!username || !password)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Usuario y contraseña son requeridos para PostgreSQL'
      }, { status: 400 });
    }

    let client;
    let result: ConnectionTestResponse;

    if (type === 'postgresql') {
      client = new PostgreSQLClient();
      result = await client.testConnection({
        host,
        port: parseInt(port),
        username,
        password,
        database
      });
    } else if (type === 'mongodb') {
      client = new MongoDBClient();
      result = await client.testConnection({
        host,
        port: parseInt(port),
        username,
        password,
        database
      });
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Tipo de base de datos no soportado'
      }, { status: 400 });
    }

    if (result.success) {
      // Si la conexión es exitosa, obtener esquemas
      try {
        if (type === 'postgresql') {
          const postgresClient = new PostgreSQLClient();
          await postgresClient.connect({ host, port: parseInt(port), username, password, database });
          const schemas = await postgresClient.getSchemas();
          await postgresClient.disconnect();
          result.schemas = schemas;
        } else if (type === 'mongodb') {
          const mongoClient = new MongoDBClient();
          await mongoClient.connect({ host, port: parseInt(port), username, password, database });
          const schemas = await mongoClient.getSchemas();
          await mongoClient.disconnect();
          result.schemas = schemas;
        }
      } catch (schemaError) {
        console.warn('Error al obtener esquemas:', schemaError);
        // No fallar la conexión si no se pueden obtener los esquemas
        result.schemas = []; // Establecer esquemas vacíos en caso de error
      }
    }

    return NextResponse.json<ApiResponse<ConnectionTestResponse>>({
      success: result.success,
      data: result,
      message: result.message
    });

  } catch (error) {
    console.error('Error en API de conexión:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
