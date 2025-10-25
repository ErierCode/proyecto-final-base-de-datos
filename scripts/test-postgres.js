// Script para probar conexión PostgreSQL
const { Pool } = require('pg');

async function testPostgreSQLConnection() {
  const config = {
    host: 'localhost',
    port: 5432,
    user: 'root2',
    password: 'hola',
    database: 'prueba5',
    ssl: false,
    connectionTimeoutMillis: 10000,
  };

  console.log('🔍 Probando conexión PostgreSQL...');
  console.log('Configuración:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database
  });

  let pool = null;
  let client = null;

  try {
    pool = new Pool(config);
    console.log('✅ Pool creado exitosamente');
    
    client = await pool.connect();
    console.log('✅ Cliente conectado exitosamente');
    
    const result = await client.query('SELECT version()');
    console.log('✅ Consulta ejecutada exitosamente');
    console.log('📊 Versión de PostgreSQL:', result.rows[0].version);
    
    // Probar consulta adicional
    const tablesResult = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      LIMIT 5
    `);
    console.log('📋 Tablas encontradas:', tablesResult.rows);
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error('Tipo:', error.constructor.name);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    
    // Diagnóstico adicional
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que PostgreSQL esté ejecutándose');
      console.log('2. Comprueba que el puerto 5432 esté abierto');
      console.log('3. Ejecuta: sudo service postgresql start (Linux) o net start postgresql (Windows)');
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica que el host sea correcto');
      console.log('2. Prueba con 127.0.0.1 en lugar de localhost');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 Posibles soluciones:');
      console.log('1. Verifica usuario y contraseña');
      console.log('2. Comprueba que el usuario tenga permisos');
      console.log('3. Verifica la configuración de pg_hba.conf');
    }
    
  } finally {
    try {
      if (client) {
        client.release();
        console.log('✅ Cliente liberado');
      }
      if (pool) {
        await pool.end();
        console.log('✅ Pool cerrado');
      }
    } catch (cleanupError) {
      console.warn('⚠️ Error al limpiar recursos:', cleanupError.message);
    }
  }
}

testPostgreSQLConnection();
