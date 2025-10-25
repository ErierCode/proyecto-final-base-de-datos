import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Iniciando configuración automática...');
    
    // Ejecutar el script de configuración automática
    const { stdout, stderr } = await execAsync('node scripts/auto-setup.js', {
      cwd: process.cwd(),
      timeout: 30000 // 30 segundos timeout
    });
    
    console.log('✅ Configuración completada');
    console.log('Output:', stdout);
    
    if (stderr) {
      console.warn('Warnings:', stderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuración automática completada',
      output: stdout,
      warnings: stderr
    });
    
  } catch (error) {
    console.error('❌ Error en configuración automática:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error ejecutando configuración automática',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
