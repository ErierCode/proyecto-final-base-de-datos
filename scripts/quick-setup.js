// Script rápido para configurar bases de datos
const { Pool } = require('pg');
const { MongoClient } = require('mongodb');

console.log('🚀 Mini DataGrip - Configuración Rápida');
console.log('=====================================\n');

// Función para verificar PostgreSQL
async function checkPostgreSQL() {
  console.log('🔍 Verificando PostgreSQL...');
  
  const config = {
    host: 'localhost',
    port: 5432,
    user: 'postgres', // Usuario por defecto
    password: 'postgres', // Contraseña por defecto
    database: 'postgres', // Base de datos por defecto
    ssl: false,
    connectionTimeoutMillis: 5000,
  };

  let pool = null;
  let client = null;

  try {
    pool = new Pool(config);
    client = await pool.connect();
    
    console.log('✅ PostgreSQL está ejecutándose');
    
    // Crear base de datos de prueba
    await client.query('CREATE DATABASE prueba5');
    console.log('✅ Base de datos "prueba5" creada');
    
    // Crear usuario
    await client.query("CREATE USER root2 WITH PASSWORD 'hola'");
    console.log('✅ Usuario "root2" creado');
    
    // Dar permisos
    await client.query('GRANT ALL PRIVILEGES ON DATABASE prueba5 TO root2');
    console.log('✅ Permisos otorgados');
    
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ PostgreSQL no está ejecutándose');
      console.log('💡 Soluciones:');
      console.log('   Windows: net start postgresql');
      console.log('   Linux: sudo systemctl start postgresql');
      console.log('   macOS: brew services start postgresql');
    } else if (error.message.includes('already exists')) {
      console.log('⚠️ La base de datos o usuario ya existe');
      return true;
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  } finally {
    try {
      if (client) client.release();
      if (pool) await pool.end();
    } catch (e) {}
  }
}

// Función para verificar MongoDB
async function checkMongoDB() {
  console.log('\n🔍 Verificando MongoDB...');
  
  let client = null;
  
  try {
    client = new MongoClient('mongodb://localhost:27017');
    await client.connect();
    
    console.log('✅ MongoDB está ejecutándose');
    
    const db = client.db('tu_base_datos');
    
    // Crear colección de prueba
    const collection = db.collection('usuarios');
    await collection.insertOne({
      nombre: 'Usuario de Prueba',
      email: 'test@ejemplo.com',
      activo: true,
      fecha_creacion: new Date()
    });
    
    console.log('✅ Colección "usuarios" creada con datos de prueba');
    
    return true;
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ MongoDB no está ejecutándose');
      console.log('💡 Soluciones:');
      console.log('   Windows: net start MongoDB');
      console.log('   Linux: sudo systemctl start mongod');
      console.log('   macOS: brew services start mongodb/brew/mongodb-community');
    } else {
      console.log('❌ Error:', error.message);
    }
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Función principal
async function main() {
  console.log('📋 Verificando servicios de base de datos...\n');
  
  const postgresOk = await checkPostgreSQL();
  const mongoOk = await checkMongoDB();
  
  console.log('\n📊 Resumen:');
  console.log(`PostgreSQL: ${postgresOk ? '✅ Funcionando' : '❌ No disponible'}`);
  console.log(`MongoDB: ${mongoOk ? '✅ Funcionando' : '❌ No disponible'}`);
  
  if (!postgresOk || !mongoOk) {
    console.log('\n🔧 Para instalar y configurar las bases de datos:');
    console.log('\n📖 Lee el archivo: scripts/setup-databases.md');
    console.log('\n🚀 O ejecuta estos comandos:');
    
    if (!postgresOk) {
      console.log('\n🐘 PostgreSQL:');
      console.log('   # Windows (usando chocolatey):');
      console.log('   choco install postgresql');
      console.log('   net start postgresql');
      console.log('');
      console.log('   # Linux:');
      console.log('   sudo apt install postgresql postgresql-contrib');
      console.log('   sudo systemctl start postgresql');
      console.log('');
      console.log('   # macOS:');
      console.log('   brew install postgresql');
      console.log('   brew services start postgresql');
    }
    
    if (!mongoOk) {
      console.log('\n🍃 MongoDB:');
      console.log('   # Windows (usando chocolatey):');
      console.log('   choco install mongodb');
      console.log('   net start MongoDB');
      console.log('');
      console.log('   # Linux:');
      console.log('   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -');
      console.log('   sudo apt install mongodb-org');
      console.log('   sudo systemctl start mongod');
      console.log('');
      console.log('   # macOS:');
      console.log('   brew tap mongodb/brew');
      console.log('   brew install mongodb-community');
      console.log('   brew services start mongodb/brew/mongodb-community');
    }
  } else {
    console.log('\n🎉 ¡Todo está configurado correctamente!');
    console.log('🚀 Puedes ejecutar: npm run dev');
    console.log('🌐 Y abrir: http://localhost:3000');
  }
  
  console.log('\n📝 Datos de conexión para Mini DataGrip:');
  console.log('\n🐘 PostgreSQL:');
  console.log('   Host: localhost');
  console.log('   Puerto: 5432');
  console.log('   Usuario: root2');
  console.log('   Contraseña: hola');
  console.log('   Base de datos: prueba5');
  
  console.log('\n🍃 MongoDB:');
  console.log('   Host: localhost');
  console.log('   Puerto: 27017');
  console.log('   Usuario: (opcional)');
  console.log('   Contraseña: (opcional)');
  console.log('   Base de datos: tu_base_datos');
}

// Ejecutar
main().catch(console.error);
