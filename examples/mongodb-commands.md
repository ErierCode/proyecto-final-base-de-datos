# 🍃 Comandos MongoDB Soportados

Mini DataGrip ahora soporta comandos directos de MongoDB. Puedes usar la sintaxis estándar de MongoDB en el editor.

## 📝 Comandos de Base de Datos

### Crear Colecciones
```javascript
db.createCollection("usuarios")
db.createCollection("productos")
db.createCollection("pedidos")
```

### Eliminar Colecciones
```javascript
db.dropCollection("usuarios")
db.dropCollection("productos")
```

### Listar Colecciones
```javascript
db.getCollectionNames()
```

### Estadísticas de la Base de Datos
```javascript
db.stats()
```

## 🔍 Comandos de Consulta

### Buscar Documentos
```javascript
db.usuarios.find()
db.usuarios.find({ activo: true })
db.usuarios.find({ edad: { $gte: 18 } })
```

### Contar Documentos
```javascript
db.usuarios.count()
db.usuarios.count({ activo: true })
```

### Eliminar Colecciones Específicas
```javascript
db.usuarios.drop()
db.productos.drop()
```

## 📊 Comandos de Agregación

### Agregación Simple
```javascript
db.usuarios.aggregate([
  { $match: { activo: true } },
  { $group: { _id: "$rol", count: { $sum: 1 } } }
])
```

### Agregación con Lookup
```javascript
db.pedidos.aggregate([
  {
    $lookup: {
      from: "usuarios",
      localField: "usuario_id",
      foreignField: "_id",
      as: "usuario"
    }
  }
])
```

## 🛠️ Comandos de Administración

### Ejecutar Comandos Personalizados
```javascript
db.runCommand({ ping: 1 })
db.runCommand({ serverStatus: 1 })
db.runCommand({ listCollections: 1 })
```

### Crear Índices
```javascript
db.usuarios.createIndex({ email: 1 }, { unique: true })
db.productos.createIndex({ categoria: 1 })
db.pedidos.createIndex({ usuario_id: 1, fecha: -1 })
```

## 📋 Ejemplos Completos

### 1. Configurar Base de Datos Completa
```javascript
// Crear colecciones
db.createCollection("usuarios")
db.createCollection("productos")
db.createCollection("pedidos")

// Insertar usuarios
db.usuarios.insertMany([
  {
    nombre: "Juan Pérez",
    email: "juan@ejemplo.com",
    edad: 28,
    activo: true,
    rol: "admin",
    fecha_registro: new Date()
  },
  {
    nombre: "María García",
    email: "maria@ejemplo.com",
    edad: 32,
    activo: true,
    rol: "usuario",
    fecha_registro: new Date()
  }
])

// Insertar productos
db.productos.insertMany([
  {
    nombre: "Laptop Gaming",
    categoria: "electrónicos",
    precio: 1299.99,
    stock: 15,
    activo: true,
    fecha_creacion: new Date()
  },
  {
    nombre: "Smartphone",
    categoria: "electrónicos",
    precio: 699.99,
    stock: 25,
    activo: true,
    fecha_creacion: new Date()
  }
])
```

### 2. Consultas Avanzadas
```javascript
// Buscar usuarios activos mayores de 25 años
db.usuarios.find({
  activo: true,
  edad: { $gte: 25 }
})

// Productos con stock bajo
db.productos.find({
  stock: { $lt: 20 }
})

// Estadísticas por categoría
db.productos.aggregate([
  {
    $group: {
      _id: "$categoria",
      total: { $sum: 1 },
      precio_promedio: { $avg: "$precio" }
    }
  }
])
```

### 3. Operaciones CRUD
```javascript
// Insertar un documento
db.usuarios.insertOne({
  nombre: "Carlos López",
  email: "carlos@ejemplo.com",
  edad: 25,
  activo: false,
  rol: "usuario",
  fecha_registro: new Date()
})

// Actualizar un documento
db.usuarios.updateOne(
  { email: "carlos@ejemplo.com" },
  { $set: { activo: true } }
)

// Eliminar un documento
db.usuarios.deleteOne({ email: "carlos@ejemplo.com" })
```

## 🎯 Comandos de Diagnóstico

### Verificar Conexión
```javascript
db.runCommand({ ping: 1 })
```

### Estado del Servidor
```javascript
db.runCommand({ serverStatus: 1 })
```

### Listar Bases de Datos
```javascript
db.runCommand({ listDatabases: 1 })
```

### Información de Colecciones
```javascript
db.runCommand({ listCollections: 1 })
```

## 💡 Consejos de Uso

1. **Usa comandos directos** para operaciones administrativas
2. **Usa JSON queries** para consultas complejas con filtros
3. **Combina ambos enfoques** según la necesidad
4. **Usa el historial** para reutilizar comandos exitosos
5. **Exporta resultados** para análisis posteriores

## 🚨 Notas Importantes

- Los comandos directos se ejecutan inmediatamente
- Usa `db.createCollection()` para crear colecciones
- Usa `db.dropCollection()` para eliminar colecciones
- Los comandos de consulta devuelven resultados en formato tabla
- Los comandos de administración muestran mensajes de confirmación

## 🔧 Solución de Problemas

### Error: "Comando no soportado"
- Verifica la sintaxis del comando
- Asegúrate de usar comillas correctas
- Revisa que el comando esté en la lista soportada

### Error: "Colección no encontrada"
- Usa `db.getCollectionNames()` para ver colecciones disponibles
- Crea la colección con `db.createCollection("nombre")`

### Error: "Base de datos no encontrada"
- Verifica la conexión a MongoDB
- Asegúrate de que la base de datos exista
- Usa `db.runCommand({ listDatabases: 1 })` para ver bases disponibles

¡Ahora puedes usar MongoDB con la sintaxis estándar que conoces! 🎉
