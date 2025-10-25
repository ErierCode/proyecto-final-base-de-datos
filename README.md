# 🗄️ Mini DataGrip

Una aplicación web moderna para la gestión y consulta de bases de datos PostgreSQL y MongoDB, construida con Next.js 14 y TypeScript.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Arquitectura](#-arquitectura)
- [Componentes](#-componentes)
- [API Routes](#-api-routes)
- [Comandos MongoDB](#-comandos-mongodb)
- [Comandos PostgreSQL](#-comandos-postgresql)
- [Desarrollo](#-desarrollo)
- [Contribución](#-contribución)

## ✨ Características

### 🔗 Gestión de Conexiones
- **Conexiones múltiples**: Soporte para PostgreSQL y MongoDB
- **Conexión dinámica**: Cambio entre bases de datos sin reiniciar la aplicación
- **Autenticación flexible**: Soporte para conexiones con y sin credenciales
- **Validación de conexión**: Prueba de conexión antes de guardar

### 📝 Editor de Consultas
- **Monaco Editor**: Editor de código profesional con resaltado de sintaxis
- **Múltiples pestañas**: Gestión de consultas independientes
- **Autocompletado**: Sugerencias inteligentes para SQL y MongoDB
- **Atajos de teclado**: F5 o Ctrl+Enter para ejecutar consultas

### 🗂️ Explorador de Esquemas
- **Vista jerárquica**: Navegación por bases de datos, tablas/colecciones y columnas
- **Carga dinámica**: Actualización automática al cambiar de conexión
- **Iconos diferenciados**: Identificación visual de elementos de base de datos

### 📊 Resultados de Consultas
- **Vista tabular**: Resultados en formato tabla para SQL
- **Vista JSON**: Resultados formateados para MongoDB
- **Información de ejecución**: Tiempo de ejecución y número de filas
- **Exportación**: Descarga de resultados en diferentes formatos

### 📚 Historial de Consultas
- **Persistencia**: Historial guardado localmente
- **Re-ejecución**: Ejecutar consultas anteriores con un clic
- **Filtrado**: Búsqueda por tipo de base de datos
- **Gestión**: Eliminar consultas individuales o todo el historial

### 🎨 Interfaz de Usuario
- **Tema oscuro/claro**: Cambio dinámico de tema
- **Diseño responsivo**: Adaptable a diferentes tamaños de pantalla
- **Notificaciones**: Feedback visual con toast notifications
- **Manual integrado**: Documentación de comandos disponible

## 🛠️ Tecnologías

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para JavaScript
- **TailwindCSS**: Framework de CSS utilitario
- **Monaco Editor**: Editor de código de VS Code
- **Zustand**: Gestión de estado global
- **React Hot Toast**: Notificaciones

### Backend
- **Next.js API Routes**: Endpoints para operaciones de base de datos
- **PostgreSQL**: Driver `pg` para conexiones SQL
- **MongoDB**: Driver `mongoose` para conexiones NoSQL

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Git**: Control de versiones

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- PostgreSQL (opcional, para pruebas)
- MongoDB (opcional, para pruebas)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd mini-datagrip
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (opcional)
```bash
# Crear archivo .env.local
touch .env.local
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 📖 Uso

### 1. Crear Conexión

1. Haz clic en **"Nueva Conexión"**
2. Completa los campos:
   - **Tipo**: PostgreSQL o MongoDB
   - **Host**: Dirección del servidor
   - **Puerto**: Puerto de la base de datos (se llena automáticamente)
   - **Base de datos**: Nombre de la base de datos
   - **Usuario/Contraseña**: Credenciales (opcional para MongoDB local)

3. Haz clic en **"Probar Conexión"** para verificar
4. Haz clic en **"Guardar Conexión"**

### 2. Ejecutar Consultas

#### Para PostgreSQL:
```sql
-- Consultas SQL estándar
SELECT * FROM usuarios WHERE edad > 18;
INSERT INTO productos (nombre, precio) VALUES ('Laptop', 999.99);
UPDATE usuarios SET activo = true WHERE id = 1;
DELETE FROM productos WHERE precio < 100;
```

#### Para MongoDB:
```javascript
// Comandos directos
db.usuarios.find()
db.productos.insertOne({nombre: "Laptop", precio: 999.99})
db.usuarios.updateOne({id: 1}, {$set: {activo: true}})
db.productos.deleteMany({precio: {$lt: 100}})

// Consultas SQL (traducidas automáticamente)
SELECT * FROM usuarios WHERE edad > 18
INSERT INTO productos VALUES ('Laptop', 999.99)

// Comandos JSON estructurados
{
  "collection": "usuarios",
  "operation": "find",
  "filter": {"edad": {"$gt": 18}},
  "limit": 10
}
```

### 3. Gestión de Pestañas

- **Nueva pestaña**: Botón "+" en la barra de pestañas
- **Cerrar pestaña**: Botón "X" en cada pestaña
- **Cambiar pestaña**: Clic en el nombre de la pestaña
- **Renombrar**: Doble clic en el nombre de la pestaña

### 4. Historial de Consultas

- **Ver historial**: Botón "Historial" en la barra superior
- **Re-ejecutar**: Botón "Reejecutar" en cada entrada
- **Copiar**: Botón "Copiar" para reutilizar consultas
- **Limpiar**: Botón "Limpiar historial" para eliminar todo

## 🏗️ Arquitectura

### Estructura del Proyecto
```
mini-datagrip/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── connect/       # Gestión de conexiones
│   │   ├── query/         # Ejecución de consultas
│   │   └── history/       # Historial de consultas
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal
├── components/            # Componentes React
│   ├── ConnectionForm.tsx # Formulario de conexión
│   ├── QueryEditor.tsx   # Editor de consultas
│   ├── ResultsView.tsx    # Vista de resultados
│   └── Sidebar.tsx        # Barra lateral
├── lib/                   # Utilidades y lógica
│   ├── mongodb.ts        # Cliente MongoDB
│   ├── postgres.ts       # Cliente PostgreSQL
│   └── store.ts          # Estado global (Zustand)
├── types/                # Definiciones TypeScript
│   └── index.ts          # Interfaces principales
└── README.md             # Documentación
```

### Flujo de Datos

1. **Conexión**: Usuario crea conexión → API valida → Estado global
2. **Consulta**: Usuario escribe consulta → API ejecuta → Resultados mostrados
3. **Historial**: Consulta ejecutada → Guardada en estado → Persistencia local

## 🧩 Componentes

### `ConnectionForm.tsx`
**Propósito**: Formulario para crear y probar conexiones de base de datos.

**Props**:
- `onConnectionSuccess`: Callback cuando la conexión es exitosa
- `onTestConnection`: Callback para probar la conexión

**Funcionalidades**:
- Validación de campos requeridos
- Auto-completado de puertos por tipo de DB
- Mensajes de error descriptivos
- Soporte para conexiones sin autenticación (MongoDB)
- Limpieza automática de campos al cambiar tipo de conexión

### `QueryEditor.tsx`
**Propósito**: Editor de consultas con Monaco Editor.

**Props**:
- `activeConnection`: Conexión activa actual
- `onQueryResult`: Callback con resultados de la consulta

**Funcionalidades**:
- Resaltado de sintaxis dinámico (SQL/JavaScript/JSON)
- Atajos de teclado (F5, Ctrl+Enter)
- Gestión de pestañas
- Operaciones de archivo (copiar, descargar, limpiar)

### `ResultsView.tsx`
**Propósito**: Componente para mostrar los resultados de las consultas.

**Props**:
- `result`: Resultado de la consulta ejecutada

**Funcionalidades**:
- Vista tabular para resultados SQL
- Vista JSON para resultados MongoDB
- Información de ejecución (tiempo, filas)
- Exportación de resultados

### `Sidebar.tsx`
**Propósito**: Barra lateral con explorador de esquemas y conexiones.

**Funcionalidades**:
- Lista de conexiones guardadas
- Explorador de esquemas dinámico
- Gestión de conexiones (crear, eliminar)
- Navegación por tablas/colecciones

## 🔌 API Routes

### `/api/connect`
**Método**: POST
**Propósito**: Crear y probar conexiones de base de datos.

**Request Body**:
```typescript
{
  type: 'postgresql' | 'mongodb',
  host: string,
  port: number,
  username?: string,
  password?: string,
  database: string
}
```

**Response**:
```typescript
{
  success: boolean,
  connectionId?: string,
  schemas?: Schema[],
  error?: string
}
```

### `/api/query`
**Método**: POST
**Propósito**: Ejecutar consultas en la base de datos.

**Request Body**:
```typescript
{
  connectionId: string,
  query: string,
  connectionConfig: ConnectionConfig
}
```

**Response**:
```typescript
{
  success: boolean,
  data: {
    success: boolean,
    data: any[],
    columns?: string[],
    rowCount?: number,
    error?: string
  }
}
```

### `/api/history`
**Método**: GET/POST/DELETE
**Propósito**: Gestión del historial de consultas.

**GET**: Obtener historial
**POST**: Agregar consulta al historial
**DELETE**: Limpiar historial

## 🍃 Comandos MongoDB

### Comandos Directos
```javascript
// Crear colección
db.createCollection("usuarios")

// Insertar documentos
db.usuarios.insertOne({nombre: "Juan", edad: 25})
db.usuarios.insertMany([
  {nombre: "Ana", edad: 30},
  {nombre: "Carlos", edad: 28}
])

// Consultar documentos
db.usuarios.find()
db.usuarios.find({edad: {$gt: 25}})
db.usuarios.findOne({nombre: "Juan"})

// Actualizar documentos
db.usuarios.updateOne({nombre: "Juan"}, {$set: {edad: 26}})
db.usuarios.updateMany({activo: true}, {$set: {activo: false}})

// Eliminar documentos
db.usuarios.deleteOne({nombre: "Juan"})
db.usuarios.deleteMany({edad: {$lt: 18}})

// Operaciones de colección
db.usuarios.drop()
db.getCollectionNames()
db.stats()
```

### Consultas SQL (Traducidas)
```sql
-- SELECT traducido a find()
SELECT * FROM usuarios WHERE edad > 25 LIMIT 10
-- Se convierte en: db.usuarios.find({edad: {$gt: 25}}).limit(10)

-- INSERT traducido a insertOne/insertMany()
INSERT INTO usuarios (nombre, edad) VALUES ('Juan', 25)
-- Se convierte en: db.usuarios.insertOne({nombre: "Juan", edad: 25})

-- UPDATE traducido a updateOne/updateMany()
UPDATE usuarios SET activo = true WHERE edad > 18
-- Se convierte en: db.usuarios.updateMany({edad: {$gt: 18}}, {$set: {activo: true}})

-- DELETE traducido a deleteOne/deleteMany()
DELETE FROM usuarios WHERE edad < 18
-- Se convierte en: db.usuarios.deleteMany({edad: {$lt: 18}})
```

### Comandos JSON Estructurados
```json
{
  "collection": "usuarios",
  "operation": "find",
  "filter": {"edad": {"$gt": 25}},
  "limit": 10
}

{
  "collection": "productos",
  "operation": "insertOne",
  "document": {
    "nombre": "Laptop",
    "precio": 999.99,
    "categoria": "Electrónicos"
  }
}

{
  "collection": "usuarios",
  "operation": "updateMany",
  "filter": {"activo": false},
  "update": {"$set": {"activo": true}}
}
```

## 🐘 Comandos PostgreSQL

### Consultas Básicas
```sql
-- Seleccionar datos
SELECT * FROM usuarios;
SELECT nombre, email FROM usuarios WHERE edad > 18;
SELECT COUNT(*) FROM productos WHERE precio > 100;

-- Insertar datos
INSERT INTO usuarios (nombre, email, edad) 
VALUES ('Juan', 'juan@email.com', 25);

INSERT INTO productos (nombre, precio, categoria) 
VALUES ('Laptop', 999.99, 'Electrónicos');

-- Actualizar datos
UPDATE usuarios SET activo = true WHERE edad > 18;
UPDATE productos SET precio = precio * 1.1 WHERE categoria = 'Electrónicos';

-- Eliminar datos
DELETE FROM usuarios WHERE edad < 18;
DELETE FROM productos WHERE precio < 50;
```

### Consultas Avanzadas
```sql
-- JOINs
SELECT u.nombre, p.nombre as producto, p.precio
FROM usuarios u
JOIN compras c ON u.id = c.usuario_id
JOIN productos p ON c.producto_id = p.id;

-- Agregaciones
SELECT categoria, COUNT(*), AVG(precio), MAX(precio)
FROM productos
GROUP BY categoria
HAVING COUNT(*) > 5;

-- Subconsultas
SELECT nombre, precio
FROM productos
WHERE precio > (SELECT AVG(precio) FROM productos);

-- Funciones de ventana
SELECT nombre, precio,
       ROW_NUMBER() OVER (ORDER BY precio DESC) as ranking,
       LAG(precio) OVER (ORDER BY precio) as precio_anterior
FROM productos;
```

### Gestión de Esquemas
```sql
-- Crear tablas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    edad INTEGER CHECK (edad >= 0),
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_edad ON usuarios(edad);

-- Modificar tablas
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20);
ALTER TABLE usuarios ALTER COLUMN nombre SET NOT NULL;

-- Eliminar tablas
DROP TABLE usuarios CASCADE;
```

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Servidor de producción
npm run lint         # Linting de código
```

### Estructura de Estado (Zustand)
```typescript
interface AppState {
  // Conexiones
  connections: DatabaseConnection[]
  activeConnection: DatabaseConnection | null
  
  // Pestañas de consultas
  tabs: QueryTab[]
  activeTab: string | null
  
  // Historial
  queryHistory: QueryHistoryItem[]
  
  // UI
  theme: 'dark' | 'light'
  showSettings: boolean
  showManual: boolean
}
```

### Tipos Principales
```typescript
interface DatabaseConnection {
  id: string
  name: string
  type: 'postgresql' | 'mongodb'
  host: string
  port: number
  username?: string
  password?: string
  database: string
  createdAt: Date
}

interface QueryTab {
  id: string
  name: string
  query: string
  isDirty: boolean
  result?: QueryResult
}

interface QueryResult {
  success: boolean
  data?: any[]
  columns?: string[]
  error?: string
  executionTime?: number
  rowCount?: number
}
```

### Estándares de Código
- Usar TypeScript para todo el código
- Seguir las convenciones de naming de React
- Documentar funciones complejas
- Escribir tests para nuevas funcionalidades
- Mantener la compatibilidad con las versiones de Node.js soportadas

**Mini DataGrip** - Una herramienta moderna para la gestión de bases de datos 🚀
