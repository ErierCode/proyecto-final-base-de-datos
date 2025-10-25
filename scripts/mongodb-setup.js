// Script para crear colecciones e insertar datos en MongoDB
const { MongoClient } = require('mongodb');

// Configuración de conexión
const MONGODB_URI = 'mongodb://localhost:27017'; // Cambia por tu URI
const DATABASE_NAME = 'tu_base_datos'; // Cambia por el nombre de tu BD

async function setupMongoDB() {
  let client = null;
  
  try {
    console.log('🔍 Conectando a MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Conectado a MongoDB exitosamente');
    
    const db = client.db(DATABASE_NAME);
    
    // 1. Crear colección de usuarios
    console.log('\n📝 Creando colección usuarios...');
    const usuariosCollection = db.collection('usuarios');
    
    // Insertar datos de ejemplo
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
    
    // 2. Crear colección de productos
    console.log('\n📝 Creando colección productos...');
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
    
    // 3. Crear colección de pedidos
    console.log('\n📝 Creando colección pedidos...');
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
    
    // 4. Crear índices para mejorar el rendimiento
    console.log('\n🔍 Creando índices...');
    
    // Índice en usuarios por email
    await usuariosCollection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Índice creado en usuarios.email');
    
    // Índice en productos por categoría
    await productosCollection.createIndex({ categoria: 1 });
    console.log('✅ Índice creado en productos.categoria');
    
    // Índice en pedidos por usuario
    await pedidosCollection.createIndex({ usuario_id: 1 });
    console.log('✅ Índice creado en pedidos.usuario_id');
    
    // 5. Mostrar estadísticas
    console.log('\n📊 Estadísticas de la base de datos:');
    const usuariosCount = await usuariosCollection.countDocuments();
    const productosCount = await productosCollection.countDocuments();
    const pedidosCount = await pedidosCollection.countDocuments();
    
    console.log(`👥 Usuarios: ${usuariosCount}`);
    console.log(`📦 Productos: ${productosCount}`);
    console.log(`🛒 Pedidos: ${pedidosCount}`);
    
    // 6. Ejemplos de consultas
    console.log('\n🔍 Ejemplos de consultas que puedes usar:');
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
    
    console.log('\n3. Agregación de estadísticas:');
    console.log(JSON.stringify({
      "collection": "usuarios",
      "operation": "aggregate",
      "pipeline": [
        { "$match": { "activo": true } },
        { "$group": { "_id": "$rol", "count": { "$sum": 1 } } },
        { "$sort": { "count": -1 } }
      ]
    }, null, 2));
    
    console.log('\n4. Buscar pedidos de un usuario:');
    console.log(JSON.stringify({
      "collection": "pedidos",
      "operation": "find",
      "filter": { "usuario_id": "ObjectId('...')" },
      "limit": 10
    }, null, 2));
    
    console.log('\n✅ ¡Base de datos MongoDB configurada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
      console.log('✅ Conexión cerrada');
    }
  }
}

// Ejecutar el script
setupMongoDB();
