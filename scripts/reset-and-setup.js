// Script para limpiar y reconfigurar MongoDB
const { MongoClient } = require('mongodb');

console.log('🔄 Mini DataGrip - Reset y Configuración');
console.log('=====================================\n');

const MONGO_CONFIG = {
  uri: 'mongodb://localhost:27017',
  database: 'mini_datagrip'
};

async function resetAndSetup() {
  let client = null;
  
  try {
    client = new MongoClient(MONGO_CONFIG.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(MONGO_CONFIG.database);
    
    // Limpiar colecciones existentes
    console.log('🧹 Limpiando colecciones existentes...');
    try {
      await db.collection('usuarios').drop();
      console.log('✅ Colección usuarios eliminada');
    } catch (error) {
      console.log('⚠️ Colección usuarios no existía');
    }
    
    try {
      await db.collection('productos').drop();
      console.log('✅ Colección productos eliminada');
    } catch (error) {
      console.log('⚠️ Colección productos no existía');
    }
    
    try {
      await db.collection('pedidos').drop();
      console.log('✅ Colección pedidos eliminada');
    } catch (error) {
      console.log('⚠️ Colección pedidos no existía');
    }
    
    // Crear nuevas colecciones con datos
    console.log('\n📝 Creando nuevas colecciones...');
    
    // Usuarios
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
    console.log(`✅ ${usuariosResult.insertedCount} usuarios insertados`);
    
    // Productos
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
    console.log(`✅ ${productosResult.insertedCount} productos insertados`);
    
    // Pedidos
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
    console.log(`✅ ${pedidosResult.insertedCount} pedidos insertados`);
    
    // Crear índices
    await usuariosCollection.createIndex({ email: 1 }, { unique: true });
    await productosCollection.createIndex({ categoria: 1 });
    await pedidosCollection.createIndex({ usuario_id: 1 });
    console.log('✅ Índices creados');
    
    // Mostrar estadísticas finales
    const usuariosCount = await usuariosCollection.countDocuments();
    const productosCount = await productosCollection.countDocuments();
    const pedidosCount = await pedidosCollection.countDocuments();
    
    console.log('\n📊 Estadísticas finales:');
    console.log(`👥 Usuarios: ${usuariosCount}`);
    console.log(`📦 Productos: ${productosCount}`);
    console.log(`🛒 Pedidos: ${pedidosCount}`);
    
    console.log('\n🎉 ¡Base de datos MongoDB configurada exitosamente!');
    console.log('\n📝 Comandos de ejemplo:');
    console.log('   db.createCollection("mi_coleccion")');
    console.log('   db.usuarios.find()');
    console.log('   db.productos.find({ categoria: "electrónicos" })');
    console.log('   db.getCollectionNames()');
    console.log('   db.stats()');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    if (client) {
      await client.close();
    }
  }
}

resetAndSetup();
