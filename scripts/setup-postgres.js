// Script específico para configurar PostgreSQL
const { Pool } = require('pg');

console.log('🐘 Configurando PostgreSQL...\n');

// Configuraciones a probar
const configs = [
  {
    name: 'Configuración por defecto (postgres/postgres)',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
  {
    name: 'Configuración sin contraseña',
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres'
  },
  {
    name: 'Configuración con usuario del sistema',
    host: 'localhost',
    port: 5432,
    user: process.env.USER || 'postgres',
    password: '',
    database: 'postgres'
  }
];

async function testConfig(config) {
  let pool = null;
  let client = null;
  
  try {
    console.log(`🔍 Probando: ${config.name}`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Usuario: ${config.user}`);
    console.log(`   Base de datos: ${config.database}`);
    
    pool = new Pool({
      ...config,
      ssl: false,
      connectionTimeoutMillis: 5000
    });
    
    client = await pool.connect();
    console.log('✅ Conexión exitosa');
    
    // Crear usuario y base de datos
    try {
      await client.query("CREATE USER root2 WITH PASSWORD 'hola'");
      console.log('✅ Usuario root2 creado');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Usuario root2 ya existe');
      } else {
        throw error;
      }
    }
    
    try {
      await client.query('CREATE DATABASE prueba5 OWNER root2');
      console.log('✅ Base de datos prueba5 creada');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('⚠️ Base de datos prueba5 ya existe');
      } else {
        throw error;
      }
    }
    
    await client.query('GRANT ALL PRIVILEGES ON DATABASE prueba5 TO root2');
    console.log('✅ Permisos otorgados');
    
    // Probar conexión con el nuevo usuario
    const testPool = new Pool({
      host: config.host,
      port: config.port,
      user: 'root2',
      password: 'hola',
      database: 'prueba5',
      ssl: false
    });
    
    const testClient = await testPool.connect();
    console.log('✅ Conexión con usuario root2 exitosa');
    
    // Crear tablas de ejemplo
    await testClient.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        edad INTEGER,
        activo BOOLEAN DEFAULT true,
        rol VARCHAR(50) DEFAULT 'usuario',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla usuarios creada');
    
    await testClient.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(200) NOT NULL,
        categoria VARCHAR(100),
        precio DECIMAL(10,2),
        stock INTEGER DEFAULT 0,
        activo BOOLEAN DEFAULT true,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla productos creada');
    
    // Insertar datos de ejemplo
    const usuariosData = [
      ['Juan Pérez', 'juan@ejemplo.com', 28, true, 'admin'],
      ['María García', 'maria@ejemplo.com', 32, true, 'usuario'],
      ['Carlos López', 'carlos@ejemplo.com', 25, false, 'usuario']
    ];
    
    for (const [nombre, email, edad, activo, rol] of usuariosData) {
      await testClient.query(`
        INSERT INTO usuarios (nombre, email, edad, activo, rol) 
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
      `, [nombre, email, edad, activo, rol]);
    }
    console.log('✅ Datos de usuarios insertados');
    
    const productosData = [
      ['Laptop Gaming', 'electrónicos', 1299.99, 15],
      ['Smartphone', 'electrónicos', 699.99, 25],
      ['Libro de Programación', 'libros', 49.99, 50]
    ];
    
    for (const [nombre, categoria, precio, stock] of productosData) {
      await testClient.query(`
        INSERT INTO productos (nombre, categoria, precio, stock) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
      `, [nombre, categoria, precio, stock]);
    }
    console.log('✅ Datos de productos insertados');
    
    await testClient.release();
    await testPool.end();
    
    console.log('\n🎉 ¡PostgreSQL configurado exitosamente!');
    console.log('\n📝 Datos de conexión:');
    console.log('   Host: localhost:5432');
    console.log('   Usuario: root2');
    console.log('   Contraseña: hola');
    console.log('   Base de datos: prueba5');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  } finally {
    try {
      if (client) client.release();
      if (pool) await pool.end();
    } catch (e) {}
  }
}

async function main() {
  for (const config of configs) {
    console.log('\n' + '='.repeat(50));
    const success = await testConfig(config);
    if (success) {
      console.log('\n✅ ¡Configuración completada exitosamente!');
      return;
    }
    console.log('\n');
  }
  
  console.log('\n❌ No se pudo configurar PostgreSQL con ninguna configuración');
  console.log('\n💡 Posibles soluciones:');
  console.log('1. Instalar PostgreSQL: https://www.postgresql.org/download/');
  console.log('2. Iniciar el servicio: net start postgresql (Windows)');
  console.log('3. Configurar usuario postgres con contraseña');
  console.log('4. Verificar que PostgreSQL esté ejecutándose en puerto 5432');
}

main().catch(console.error);
