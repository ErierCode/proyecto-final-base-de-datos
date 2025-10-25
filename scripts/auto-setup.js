// Script para configurar automáticamente las bases de datos
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

console.log('🚀 Mini DataGrip - Configuración Automática');
console.log('==========================================\n');

// Configuración de conexiones
const POSTGRES_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'postgres',
  ssl: false
};

const MONGO_CONFIG = {
  uri: 'mongodb://localhost:27017',
  database: 'mini_datagrip'
};

// Función para configurar PostgreSQL
async function setupPostgreSQL() {
  console.log('🐘 Configurando PostgreSQL...');
  
  let pool = null;
  let client = null;
  
  try {
    // Conectar como superusuario
    pool = new Pool(POSTGRES_CONFIG);
    client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Crear usuario si no existe
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
    
    // Crear base de datos si no existe
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
    
    // Dar permisos
    await client.query('GRANT ALL PRIVILEGES ON DATABASE prueba5 TO root2');
    console.log('✅ Permisos otorgados');
    
    // Conectar a la nueva base de datos
    const testPool = new Pool({
      ...POSTGRES_CONFIG,
      user: 'root2',
      password: 'hola',
      database: 'prueba5'
    });
    
    const testClient = await testPool.connect();
    
    // Crear tabla de usuarios
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
    
    // Crear tabla de productos
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
    
    return true;
  } catch (error) {
    console.error('❌ Error configurando PostgreSQL:', error.message);
    return false;
  } finally {
    try {
      if (client) client.release();
      if (pool) await pool.end();
    } catch (e) {}
  }
}

// Función para configurar MongoDB
async function setupMongoDB() {
  console.log('\n🍃 Configurando MongoDB...');
  
  let client = null;
  
  try {
    client = new MongoClient(MONGO_CONFIG.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(MONGO_CONFIG.database);
    
    // Crear colección de usuarios
    const usuariosCollection = db.collection('usuarios');
    const usuariosData = [
      {
        nombre: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        edad: 28,
        activo: true,
        rol: 'admin',
        fecha_registro: new Date(),
        direccion: {
          calle: 'Av. Principal 123',
          ciudad: 'Madrid',
          codigo_postal: '28001'
        },
        hobbies: ['programación', 'música', 'deportes']
      },
      {
        nombre: 'María García',
        email: 'maria@ejemplo.com',
        edad: 32,
        activo: true,
        rol: 'usuario',
        fecha_registro: new Date(),
        direccion: {
          calle: 'Calle Secundaria 456',
          ciudad: 'Barcelona',
          codigo_postal: '08001'
        },
        hobbies: ['lectura', 'cocina']
      },
      {
        nombre: 'Carlos López',
        email: 'carlos@ejemplo.com',
        edad: 25,
        activo: false,
        rol: 'usuario',
        fecha_registro: new Date(),
        direccion: {
          calle: 'Plaza Mayor 789',
          ciudad: 'Valencia',
          codigo_postal: '46001'
        },
        hobbies: ['fotografía', 'viajes']
      }
    ];
    
    await usuariosCollection.insertMany(usuariosData);
    console.log('✅ Colección usuarios creada con datos');
    
    // Crear colección de productos
    const productosCollection = db.collection('productos');
    const productosData = [
      {
        nombre: 'Laptop Gaming',
        categoria: 'electrónicos',
        precio: 1299.99,
        stock: 15,
        activo: true,
        especificaciones: {
          marca: 'TechBrand',
          modelo: 'Gaming Pro X1',
          procesador: 'Intel i7',
          ram: '16GB',
          almacenamiento: '512GB SSD'
        },
        tags: ['gaming', 'laptop', 'alto rendimiento'],
        fecha_creacion: new Date()
      },
      {
        nombre: 'Smartphone',
        categoria: 'electrónicos',
        precio: 699.99,
        stock: 25,
        activo: true,
        especificaciones: {
          marca: 'PhoneCorp',
          modelo: 'Smart X2',
          pantalla: '6.1 pulgadas',
          camara: '48MP',
          bateria: '4000mAh'
        },
        tags: ['smartphone', 'móvil', 'tecnología'],
        fecha_creacion: new Date()
      }
    ];
    
    await productosCollection.insertMany(productosData);
    console.log('✅ Colección productos creada con datos');
    
    // Crear índices
    await usuariosCollection.createIndex({ email: 1 }, { unique: true });
    await productosCollection.createIndex({ categoria: 1 });
    console.log('✅ Índices creados');
    
    return true;
  } catch (error) {
    console.error('❌ Error configurando MongoDB:', error.message);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Función para crear archivo de configuración
function createConfigFile() {
  const config = {
    postgres: {
      host: 'localhost',
      port: 5432,
      user: 'root2',
      password: 'hola',
      database: 'prueba5'
    },
    mongodb: {
      host: 'localhost',
      port: 27017,
      user: '',
      password: '',
      database: 'mini_datagrip'
    }
  };
  
  const configPath = path.join(__dirname, '..', 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Archivo de configuración creado');
}

// Función principal
async function main() {
  console.log('🔧 Iniciando configuración automática...\n');
  
  const postgresOk = await setupPostgreSQL();
  const mongoOk = await setupMongoDB();
  
  if (postgresOk || mongoOk) {
    createConfigFile();
    
    console.log('\n🎉 ¡Configuración completada!');
    console.log('\n📝 Conexiones configuradas:');
    
    if (postgresOk) {
      console.log('\n🐘 PostgreSQL:');
      console.log('   Host: localhost:5432');
      console.log('   Usuario: root2');
      console.log('   Contraseña: hola');
      console.log('   Base de datos: prueba5');
    }
    
    if (mongoOk) {
      console.log('\n🍃 MongoDB:');
      console.log('   Host: localhost:27017');
      console.log('   Base de datos: mini_datagrip');
    }
    
    console.log('\n🚀 Ejecuta: npm run dev');
    console.log('🌐 Abre: http://localhost:3000');
  } else {
    console.log('\n❌ No se pudo configurar ninguna base de datos');
    console.log('💡 Asegúrate de que PostgreSQL y/o MongoDB estén ejecutándose');
  }
}

main().catch(console.error);
