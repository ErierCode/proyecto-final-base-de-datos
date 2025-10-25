// Script para crear datos de ejemplo en MongoDB (cuando esté disponible)
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017';
const DATABASE_NAME = 'tu_base_datos';

async function createSampleData() {
  let client = null;
  
  try {
    console.log('🔍 Conectando a MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // 1. Colección de usuarios
    console.log('\n👥 Creando colección usuarios...');
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
    
    const usuariosResult = await usuariosCollection.insertMany(usuariosData);
    console.log(`✅ Insertados ${usuariosResult.insertedCount} usuarios`);
    
    // 2. Colección de productos
    console.log('\n📦 Creando colección productos...');
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
      },
      {
        nombre: 'Libro de Programación',
        categoria: 'libros',
        precio: 49.99,
        stock: 50,
        activo: true,
        especificaciones: {
          autor: 'Juan Developer',
          isbn: '978-1234567890',
          paginas: 400,
          idioma: 'español'
        },
        tags: ['programación', 'libro', 'educación'],
        fecha_creacion: new Date()
      }
    ];
    
    const productosResult = await productosCollection.insertMany(productosData);
    console.log(`✅ Insertados ${productosResult.insertedCount} productos`);
    
    // 3. Colección de pedidos
    console.log('\n🛒 Creando colección pedidos...');
    const pedidosCollection = db.collection('pedidos');
    
    const pedidosData = [
      {
        numero_pedido: 'PED-001',
        usuario_id: usuariosResult.insertedIds[0],
        productos: [
          {
            producto_id: productosResult.insertedIds[0],
            cantidad: 1,
            precio_unitario: 1299.99
          }
        ],
        total: 1299.99,
        estado: 'completado',
        fecha_pedido: new Date(),
        direccion_entrega: {
          calle: 'Av. Principal 123',
          ciudad: 'Madrid',
          codigo_postal: '28001'
        }
      },
      {
        numero_pedido: 'PED-002',
        usuario_id: usuariosResult.insertedIds[1],
        productos: [
          {
            producto_id: productosResult.insertedIds[1],
            cantidad: 2,
            precio_unitario: 699.99
          },
          {
            producto_id: productosResult.insertedIds[2],
            cantidad: 1,
            precio_unitario: 49.99
          }
        ],
        total: 1449.97,
        estado: 'pendiente',
        fecha_pedido: new Date(),
        direccion_entrega: {
          calle: 'Calle Secundaria 456',
          ciudad: 'Barcelona',
          codigo_postal: '08001'
        }
      }
    ];
    
    const pedidosResult = await pedidosCollection.insertMany(pedidosData);
    console.log(`✅ Insertados ${pedidosResult.insertedCount} pedidos`);
    
    // 4. Crear índices
    console.log('\n🔍 Creando índices...');
    await usuariosCollection.createIndex({ email: 1 }, { unique: true });
    await productosCollection.createIndex({ categoria: 1 });
    await pedidosCollection.createIndex({ usuario_id: 1 });
    console.log('✅ Índices creados');
    
    // 5. Mostrar estadísticas
    console.log('\n📊 Estadísticas:');
    const usuariosCount = await usuariosCollection.countDocuments();
    const productosCount = await productosCollection.countDocuments();
    const pedidosCount = await pedidosCollection.countDocuments();
    
    console.log(`👥 Usuarios: ${usuariosCount}`);
    console.log(`📦 Productos: ${productosCount}`);
    console.log(`🛒 Pedidos: ${pedidosCount}`);
    
    console.log('\n🎉 ¡Datos de ejemplo creados exitosamente!');
    console.log('\n📝 Consultas de ejemplo para Mini DataGrip:');
    
    console.log('\n1. Buscar usuarios activos:');
    console.log(JSON.stringify({
      "collection": "usuarios",
      "operation": "find",
      "filter": { "activo": true },
      "limit": 10
    }, null, 2));
    
    console.log('\n2. Buscar productos por categoría:');
    console.log(JSON.stringify({
      "collection": "productos",
      "operation": "find",
      "filter": { "categoria": "electrónicos" },
      "limit": 10
    }, null, 2));
    
    console.log('\n3. Estadísticas por rol:');
    console.log(JSON.stringify({
      "collection": "usuarios",
      "operation": "aggregate",
      "pipeline": [
        { "$match": { "activo": true } },
        { "$group": { "_id": "$rol", "count": { "$sum": 1 } } },
        { "$sort": { "count": -1 } }
      ]
    }, null, 2));
    
    console.log('\n4. Productos con stock bajo:');
    console.log(JSON.stringify({
      "collection": "productos",
      "operation": "find",
      "filter": { "stock": { "$lt": 20 } },
      "limit": 10
    }, null, 2));
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ MongoDB no está ejecutándose');
      console.log('💡 Soluciones:');
      console.log('   Windows: net start MongoDB');
      console.log('   Linux: sudo systemctl start mongod');
      console.log('   macOS: brew services start mongodb/brew/mongodb-community');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Conexión cerrada');
    }
  }
}

createSampleData();
