// Script final para configurar Mini DataGrip completamente
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

console.log('🚀 Mini DataGrip - Configuración Final');
console.log('=====================================\n');

const MONGO_CONFIG = {
  uri: 'mongodb://localhost:27017',
  database: 'mini_datagrip'
};

async function setupMongoDB() {
  console.log('🍃 Configurando MongoDB...');
  
  let client = null;
  
  try {
    client = new MongoClient(MONGO_CONFIG.uri);
    await client.connect();
    console.log('✅ Conectado a MongoDB');
    
    const db = client.db(MONGO_CONFIG.database);
    
    // Crear colección de usuarios con datos completos
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
        hobbies: ['programación', 'música', 'deportes'],
        configuracion: {
          tema: 'oscuro',
          idioma: 'español',
          notificaciones: true
        }
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
        hobbies: ['lectura', 'cocina'],
        configuracion: {
          tema: 'claro',
          idioma: 'español',
          notificaciones: false
        }
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
        hobbies: ['fotografía', 'viajes'],
        configuracion: {
          tema: 'oscuro',
          idioma: 'español',
          notificaciones: true
        }
      }
    ];
    
    await usuariosCollection.insertMany(usuariosData);
    console.log('✅ Colección usuarios creada con datos completos');
    
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
          almacenamiento: '512GB SSD',
          pantalla: '15.6 pulgadas',
          grafica: 'RTX 3070'
        },
        tags: ['gaming', 'laptop', 'alto rendimiento'],
        fecha_creacion: new Date(),
        reviews: [
          { usuario: 'Juan Pérez', rating: 5, comentario: 'Excelente laptop' },
          { usuario: 'María García', rating: 4, comentario: 'Muy buena calidad' }
        ]
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
          bateria: '4000mAh',
          procesador: 'Snapdragon 888',
          almacenamiento: '128GB'
        },
        tags: ['smartphone', 'móvil', 'tecnología'],
        fecha_creacion: new Date(),
        reviews: [
          { usuario: 'Carlos López', rating: 5, comentario: 'Muy bueno' }
        ]
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
          idioma: 'español',
          editorial: 'TechBooks',
          año: 2024
        },
        tags: ['programación', 'libro', 'educación'],
        fecha_creacion: new Date(),
        reviews: []
      }
    ];
    
    await productosCollection.insertMany(productosData);
    console.log('✅ Colección productos creada con datos completos');
    
    // Crear colección de pedidos
    const pedidosCollection = db.collection('pedidos');
    const pedidosData = [
      {
        numero_pedido: 'PED-001',
        usuario_id: usuariosData[0]._id,
        productos: [
          {
            producto_id: productosData[0]._id,
            cantidad: 1,
            precio_unitario: 1299.99,
            nombre: 'Laptop Gaming'
          }
        ],
        total: 1299.99,
        estado: 'completado',
        fecha_pedido: new Date(),
        direccion_entrega: {
          calle: 'Av. Principal 123',
          ciudad: 'Madrid',
          codigo_postal: '28001'
        },
        metodo_pago: 'tarjeta',
        tracking: 'TRK123456789'
      },
      {
        numero_pedido: 'PED-002',
        usuario_id: usuariosData[1]._id,
        productos: [
          {
            producto_id: productosData[1]._id,
            cantidad: 2,
            precio_unitario: 699.99,
            nombre: 'Smartphone'
          },
          {
            producto_id: productosData[2]._id,
            cantidad: 1,
            precio_unitario: 49.99,
            nombre: 'Libro de Programación'
          }
        ],
        total: 1449.97,
        estado: 'pendiente',
        fecha_pedido: new Date(),
        direccion_entrega: {
          calle: 'Calle Secundaria 456',
          ciudad: 'Barcelona',
          codigo_postal: '08001'
        },
        metodo_pago: 'paypal',
        tracking: null
      }
    ];
    
    await pedidosCollection.insertMany(pedidosData);
    console.log('✅ Colección pedidos creada con datos completos');
    
    // Crear índices para mejorar el rendimiento
    await usuariosCollection.createIndex({ email: 1 }, { unique: true });
    await usuariosCollection.createIndex({ rol: 1 });
    await usuariosCollection.createIndex({ activo: 1 });
    
    await productosCollection.createIndex({ categoria: 1 });
    await productosCollection.createIndex({ precio: 1 });
    await productosCollection.createIndex({ stock: 1 });
    
    await pedidosCollection.createIndex({ usuario_id: 1 });
    await pedidosCollection.createIndex({ estado: 1 });
    await pedidosCollection.createIndex({ fecha_pedido: -1 });
    
    console.log('✅ Índices creados para optimizar consultas');
    
    // Mostrar estadísticas
    const usuariosCount = await usuariosCollection.countDocuments();
    const productosCount = await productosCollection.countDocuments();
    const pedidosCount = await pedidosCollection.countDocuments();
    
    console.log('\n📊 Estadísticas de la base de datos:');
    console.log(`👥 Usuarios: ${usuariosCount}`);
    console.log(`📦 Productos: ${productosCount}`);
    console.log(`🛒 Pedidos: ${pedidosCount}`);
    
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

function createConfigFile() {
  const config = {
    mongodb: {
      host: 'localhost',
      port: 27017,
      user: '',
      password: '',
      database: 'mini_datagrip'
    },
    postgres: {
      host: 'localhost',
      port: 5432,
      user: 'root2',
      password: 'hola',
      database: 'prueba5'
    }
  };
  
  const configPath = path.join(__dirname, '..', 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('✅ Archivo de configuración creado');
}

function createExamplesFile() {
  const examples = {
    mongodb: {
      commands: [
        'db.createCollection("nueva_coleccion")',
        'db.usuarios.find()',
        'db.usuarios.find({ activo: true })',
        'db.usuarios.count()',
        'db.productos.find({ categoria: "electrónicos" })',
        'db.pedidos.aggregate([{ $match: { estado: "completado" } }])',
        'db.getCollectionNames()',
        'db.stats()'
      ],
      jsonQueries: [
        {
          collection: 'usuarios',
          operation: 'find',
          filter: { activo: true },
          limit: 10
        },
        {
          collection: 'productos',
          operation: 'aggregate',
          pipeline: [
            { $match: { categoria: 'electrónicos' } },
            { $group: { _id: '$marca', total: { $sum: 1 } } }
          ]
        }
      ]
    },
    postgres: {
      queries: [
        'SELECT * FROM usuarios WHERE activo = true LIMIT 10;',
        'SELECT categoria, COUNT(*) as total FROM productos GROUP BY categoria;',
        'SELECT u.nombre, COUNT(p.id) as total_pedidos FROM usuarios u LEFT JOIN pedidos p ON u.id = p.usuario_id GROUP BY u.id, u.nombre;'
      ]
    }
  };
  
  const examplesPath = path.join(__dirname, '..', 'examples.json');
  fs.writeFileSync(examplesPath, JSON.stringify(examples, null, 2));
  console.log('✅ Archivo de ejemplos creado');
}

async function main() {
  console.log('🔧 Iniciando configuración final...\n');
  
  const mongoOk = await setupMongoDB();
  
  if (mongoOk) {
    createConfigFile();
    createExamplesFile();
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📝 Conexiones configuradas:');
    console.log('\n🍃 MongoDB:');
    console.log('   Host: localhost:27017');
    console.log('   Base de datos: mini_datagrip');
    console.log('   Colecciones: usuarios, productos, pedidos');
    
    console.log('\n📋 Comandos de ejemplo para MongoDB:');
    console.log('   db.createCollection("mi_coleccion")');
    console.log('   db.usuarios.find()');
    console.log('   db.productos.find({ categoria: "electrónicos" })');
    console.log('   db.getCollectionNames()');
    console.log('   db.stats()');
    
    console.log('\n🚀 Ejecuta: npm run dev');
    console.log('🌐 Abre: http://localhost:3000');
    console.log('\n💡 La aplicación se configurará automáticamente al iniciar');
  } else {
    console.log('\n❌ No se pudo configurar MongoDB');
    console.log('💡 Asegúrate de que MongoDB esté ejecutándose');
  }
}

main().catch(console.error);
