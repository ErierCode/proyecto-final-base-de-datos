# 📝 Consultas de Ejemplo

Este archivo contiene ejemplos de consultas que puedes usar para probar Mini DataGrip.

## 🐘 PostgreSQL

### Consultas Básicas

```sql
-- Ver todas las tablas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver estructura de una tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'usuarios';

-- Consulta simple
SELECT * FROM usuarios LIMIT 10;

-- Consulta con filtros
SELECT id, nombre, email, created_at 
FROM usuarios 
WHERE activo = true 
ORDER BY created_at DESC;

-- Consulta con JOIN
SELECT u.nombre, p.titulo, p.fecha_publicacion
FROM usuarios u
JOIN posts p ON u.id = p.usuario_id
WHERE p.activo = true;
```

### Consultas Avanzadas

```sql
-- Estadísticas por tabla
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public';

-- Tamaño de las tablas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices de una tabla
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'usuarios';
```

## 🍃 MongoDB

### Consultas Básicas

```json
{
  "collection": "usuarios",
  "operation": "find",
  "filter": {},
  "limit": 10
}
```

```json
{
  "collection": "usuarios",
  "operation": "find",
  "filter": { "activo": true },
  "limit": 5
}
```

```json
{
  "collection": "usuarios",
  "operation": "count",
  "filter": { "activo": true }
}
```

### Consultas Avanzadas

```json
{
  "collection": "usuarios",
  "operation": "aggregate",
  "pipeline": [
    {
      "$match": { "activo": true }
    },
    {
      "$group": {
        "_id": "$rol",
        "count": { "$sum": 1 }
      }
    },
    {
      "$sort": { "count": -1 }
    }
  ]
}
```

```json
{
  "collection": "posts",
  "operation": "aggregate",
  "pipeline": [
    {
      "$lookup": {
        "from": "usuarios",
        "localField": "autor_id",
        "foreignField": "_id",
        "as": "autor"
      }
    },
    {
      "$unwind": "$autor"
    },
    {
      "$project": {
        "titulo": 1,
        "contenido": 1,
        "autor_nombre": "$autor.nombre",
        "fecha_publicacion": 1
      }
    }
  ]
}
```

## 🧪 Datos de Prueba

### Crear Tabla de Usuarios (PostgreSQL)

```sql
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nombre, email, activo) VALUES
('Juan Pérez', 'juan@ejemplo.com', true),
('María García', 'maria@ejemplo.com', true),
('Carlos López', 'carlos@ejemplo.com', false);
```

### Crear Colección de Usuarios (MongoDB)

```json
{
  "collection": "usuarios",
  "operation": "insertMany",
  "documents": [
    {
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "activo": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "nombre": "María García", 
      "email": "maria@ejemplo.com",
      "activo": true,
      "created_at": "2024-01-15T11:00:00Z"
    },
    {
      "nombre": "Carlos López",
      "email": "carlos@ejemplo.com", 
      "activo": false,
      "created_at": "2024-01-15T12:00:00Z"
    }
  ]
}
```

## 🔧 Configuración de Conexión

### PostgreSQL Local
- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: tu_contraseña
- **Base de datos**: tu_base_datos

### MongoDB Local
- **Host**: localhost
- **Puerto**: 27017
- **Usuario**: (opcional)
- **Contraseña**: (opcional)
- **Base de datos**: tu_base_datos

## 💡 Consejos de Uso

1. **Siempre usa LIMIT** en consultas de exploración
2. **Prueba la conexión** antes de ejecutar consultas complejas
3. **Usa el historial** para reutilizar consultas exitosas
4. **Exporta resultados** para análisis posteriores
5. **Revisa los esquemas** antes de escribir consultas

## 🚨 Notas de Seguridad

- No ejecutes consultas DROP o DELETE sin confirmación
- Usa transacciones para operaciones críticas
- Haz backup antes de modificaciones importantes
- Revisa permisos de usuario en producción
