# 🗄️ Configuración de Bases de Datos

## 🐘 PostgreSQL

### 1. Instalar PostgreSQL

**Windows:**
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar chocolatey:
choco install postgresql

# O usar winget:
winget install PostgreSQL.PostgreSQL
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

### 2. Iniciar PostgreSQL

**Windows:**
```cmd
# Iniciar servicio
net start postgresql

# O desde servicios de Windows
services.msc
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS:**
```bash
brew services start postgresql
```

### 3. Crear Usuario y Base de Datos

```bash
# Conectar como superusuario
psql -U postgres

# Crear usuario
CREATE USER root2 WITH PASSWORD 'hola';

# Crear base de datos
CREATE DATABASE prueba5 OWNER root2;

# Dar permisos
GRANT ALL PRIVILEGES ON DATABASE prueba5 TO root2;

# Salir
\q
```

### 4. Probar Conexión

```bash
# Probar conexión
psql -h localhost -p 5432 -U root2 -d prueba5

# Crear tabla de prueba
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Insertar datos
INSERT INTO usuarios (nombre, email, activo) VALUES
('Juan Pérez', 'juan@ejemplo.com', true),
('María García', 'maria@ejemplo.com', true),
('Carlos López', 'carlos@ejemplo.com', false);

# Verificar datos
SELECT * FROM usuarios;
```

## 🍃 MongoDB

### 1. Instalar MongoDB

**Windows:**
```bash
# Descargar desde: https://www.mongodb.com/try/download/community
# O usar chocolatey:
choco install mongodb

# O usar winget:
winget install MongoDB.Server
```

**Ubuntu/Debian:**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org
```

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
```

### 2. Iniciar MongoDB

**Windows:**
```cmd
# Iniciar servicio
net start MongoDB

# O manualmente
mongod --dbpath C:\data\db
```

**Linux:**
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

**macOS:**
```bash
brew services start mongodb/brew/mongodb-community
```

### 3. Configurar Base de Datos

```bash
# Conectar a MongoDB
mongosh

# Crear base de datos
use tu_base_datos

# Crear colección y insertar datos
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

# Verificar datos
db.usuarios.find()
```

## 🔧 Scripts de Configuración

### Para PostgreSQL:

```bash
# Ejecutar script de prueba
node scripts/test-postgres.js

# Si hay errores, verificar:
# 1. PostgreSQL está ejecutándose
# 2. Puerto 5432 está abierto
# 3. Usuario y contraseña son correctos
# 4. Base de datos existe
```

### Para MongoDB:

```bash
# Ejecutar script de configuración
node scripts/mongodb-setup.js

# Verificar conexión
mongosh --eval "db.runCommand('ping')"
```

## 🚨 Solución de Problemas

### PostgreSQL no se conecta:

1. **Verificar que PostgreSQL esté ejecutándose:**
   ```bash
   # Windows
   net start postgresql
   
   # Linux
   sudo systemctl status postgresql
   
   # macOS
   brew services list | grep postgresql
   ```

2. **Verificar puerto:**
   ```bash
   netstat -an | grep 5432
   ```

3. **Verificar configuración:**
   - Archivo `pg_hba.conf` debe permitir conexiones
   - Archivo `postgresql.conf` debe tener `listen_addresses = '*'`

### MongoDB no se conecta:

1. **Verificar que MongoDB esté ejecutándose:**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl status mongod
   
   # macOS
   brew services list | grep mongodb
   ```

2. **Verificar puerto:**
   ```bash
   netstat -an | grep 27017
   ```

3. **Verificar permisos:**
   - Usuario debe tener permisos en la base de datos
   - Verificar configuración de autenticación

## 📝 Consultas de Prueba

### PostgreSQL:
```sql
-- Ver todas las tablas
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros
SELECT COUNT(*) FROM usuarios;

-- Consulta con JOIN
SELECT u.nombre, u.email, COUNT(p.id) as total_posts
FROM usuarios u
LEFT JOIN posts p ON u.id = p.usuario_id
GROUP BY u.id, u.nombre, u.email;
```

### MongoDB:
```json
{
  "collection": "usuarios",
  "operation": "find",
  "filter": { "activo": true },
  "limit": 10
}
```

```json
{
  "collection": "usuarios",
  "operation": "aggregate",
  "pipeline": [
    { "$match": { "activo": true } },
    { "$group": { "_id": "$rol", "count": { "$sum": 1 } } }
  ]
}
```

## ✅ Verificación Final

1. **PostgreSQL funcionando:**
   - Servicio ejecutándose
   - Conexión exitosa
   - Tablas creadas
   - Datos insertados

2. **MongoDB funcionando:**
   - Servicio ejecutándose
   - Conexión exitosa
   - Colecciones creadas
   - Datos insertados

3. **Mini DataGrip:**
   - Aplicación ejecutándose
   - Conexiones exitosas
   - Consultas funcionando
   - Resultados mostrándose
