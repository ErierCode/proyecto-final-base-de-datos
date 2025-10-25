import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, QueryHistory } from '@/types';

// Simulación de base de datos en memoria (en producción usar una BD real)
let queryHistory: QueryHistory[] = [];

export async function GET() {
  try {
    return NextResponse.json<ApiResponse<QueryHistory[]>>({
      success: true,
      data: queryHistory
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error al obtener historial'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, databaseType, connectionId, executionTime, success, resultCount } = body;

    if (!query || !databaseType || !connectionId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'query, databaseType y connectionId son requeridos'
      }, { status: 400 });
    }

    const historyEntry: QueryHistory = {
      id: Date.now().toString(),
      query,
      databaseType,
      connectionId,
      executedAt: new Date(),
      executionTime: executionTime || 0,
      success: success || false,
      resultCount: resultCount || 0
    };

    queryHistory.unshift(historyEntry);
    
    // Mantener solo los últimos 100 registros
    if (queryHistory.length > 100) {
      queryHistory = queryHistory.slice(0, 100);
    }

    return NextResponse.json<ApiResponse<QueryHistory>>({
      success: true,
      data: historyEntry,
      message: 'Consulta agregada al historial'
    });

  } catch (error) {
    console.error('Error al agregar al historial:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error al agregar al historial'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // Eliminar entrada específica
      queryHistory = queryHistory.filter(entry => entry.id !== id);
    } else {
      // Limpiar todo el historial
      queryHistory = [];
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: id ? 'Entrada eliminada del historial' : 'Historial limpiado'
    });

  } catch (error) {
    console.error('Error al eliminar del historial:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Error al eliminar del historial'
    }, { status: 500 });
  }
}
