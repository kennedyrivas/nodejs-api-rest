# API REST con Node.js, Express y JWT

Una API REST completa con sistema de autenticación JWT, refresh tokens, CRUD de tareas y sistema de roles (admin/user).

## 🚀 Características

- ✅ Autenticación con JWT y Refresh Tokens
- ✅ Sistema de roles (admin/user)
- ✅ CRUD completo para tareas
- ✅ Gestión de usuarios
- ✅ Middlewares de seguridad
- ✅ Validación de datos
- ✅ Paginación y filtros
- ✅ Soft delete
- ✅ Rate limiting
- ✅ Documentación completa

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - JSON Web Tokens para autenticación
- **bcryptjs** - Hash de contraseñas
- **express-validator** - Validación de datos
- **helmet** - Middlewares de seguridad
- **cors** - Cross-Origin Resource Sharing

## 📋 Prerrequisitos

- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
   \`\`\`bash
   git clone https://github.com/tu-usuario/nodejs-api-rest.git
   cd nodejs-api-rest
   \`\`\`

2. **Instalar dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configurar variables de entorno**
   
   Crea un archivo \`.env\` en la raíz del proyecto:
   \`\`\`env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/taskapi
   JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_SECRET=tu_jwt_refresh_secret_muy_seguro_aqui
   JWT_REFRESH_EXPIRES_IN=7d
   BCRYPT_ROUNDS=12
   \`\`\`

4. **Iniciar MongoDB**
   
   Asegúrate de que MongoDB esté ejecutándose en tu sistema.

5. **Ejecutar la aplicación**
   \`\`\`bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   \`\`\`

## 📚 Endpoints de la API

### 🔐 Autenticación (\`/api/auth\`)

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | \`/register\` | Registrar usuario | No |
| POST | \`/login\` | Iniciar sesión | No |
| POST | \`/refresh-token\` | Renovar token | No |
| POST | \`/logout\` | Cerrar sesión | Sí |
| POST | \`/logout-all\` | Cerrar todas las sesiones | Sí |

### 👤 Usuarios (\`/api/users\`)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | \`/profile\` | Obtener perfil | user/admin |
| PUT | \`/profile\` | Actualizar perfil | user/admin |
| GET | \`/\` | Listar usuarios | admin |
| PUT | \`/:id/role\` | Cambiar rol | admin |
| DELETE | \`/:id\` | Desactivar usuario | admin |

### 📝 Tareas (\`/api/tasks\`)

| Método | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| GET | \`/\` | Listar tareas | user/admin |
| GET | \`/:id\` | Obtener tarea | user/admin |
| POST | \`/\` | Crear tarea | user/admin |
| PUT | \`/:id\` | Actualizar tarea | user/admin |
| DELETE | \`/:id\` | Eliminar tarea | user/admin |
| GET | \`/stats\` | Estadísticas | admin |

## 🔑 Autenticación

### Registro de Usuario
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "usuario1",
    "email": "usuario@example.com",
    "password": "Password123"
  }'
\`\`\`

### Inicio de Sesión
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "usuario@example.com",
    "password": "Password123"
  }'
\`\`\`

### Usar Token de Acceso
\`\`\`bash
curl -X GET http://localhost:3000/api/tasks \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
\`\`\`

### Renovar Token
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/refresh-token \\
  -H "Content-Type: application/json" \\
  -d '{
    "refreshToken": "TU_REFRESH_TOKEN"
  }'
\`\`\`

## 📝 Ejemplos de Uso

### Crear una Tarea
\`\`\`bash
curl -X POST http://localhost:3000/api/tasks \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Completar proyecto",
    "description": "Finalizar la API REST",
    "priority": "high",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "tags": ["trabajo", "urgente"]
  }'
\`\`\`

### Listar Tareas con Filtros
\`\`\`bash
curl -X GET "http://localhost:3000/api/tasks?status=pending&priority=high&page=1&limit=5" \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
\`\`\`

### Actualizar Tarea
\`\`\`bash
curl -X PUT http://localhost:3000/api/tasks/TASK_ID \\
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "completed"
  }'
\`\`\`

## 🏗️ Estructura del Proyecto

\`\`\`
nodejs-api-rest/
├── controllers/          # Lógica de negocio
│   ├── authController.js
│   ├── taskController.js
│   └── userController.js
├── middleware/           # Middlewares personalizados
│   ├── auth.js
│   └── validation.js
├── models/              # Modelos de datos
│   ├── User.js
│   └── Task.js
├── routes/              # Definición de rutas
│   ├── auth.js
│   ├── tasks.js
│   └── users.js
├── utils/               # Utilidades
│   └── jwt.js
├── config/              # Configuraciones
│   └── database.js
├── .env                 # Variables de entorno
├── .gitignore
├── package.json
├── README.md
└── server.js            # Punto de entrada
\`\`\`

## 🔒 Sistema de Roles

### Usuario Normal (\`user\`)
- Crear, leer y actualizar sus propias tareas
- Ver tareas asignadas a él
- Gestionar su perfil

### Administrador (\`admin\`)
- Todas las funciones de usuario normal
- Ver, crear, actualizar y eliminar cualquier tarea
- Gestionar usuarios (cambiar roles, desactivar)
- Ver estadísticas del sistema

## 🛡️ Seguridad

- **Autenticación JWT** con tokens de corta duración
- **Refresh Tokens** para renovación segura
- **Hash de contraseñas** con bcrypt
- **Rate limiting** para prevenir ataques
- **Validación de datos** en todas las entradas
- **Middlewares de seguridad** con Helmet
- **CORS** configurado
- **Soft delete** para preservar datos

## 📊 Características Avanzadas

### Paginación
Todas las listas soportan paginación:
\`\`\`
GET /api/tasks?page=1&limit=10
\`\`\`

### Filtros
Filtrar tareas por estado, prioridad, etc:
\`\`\`
GET /api/tasks?status=pending&priority=high
\`\`\`

### Ordenamiento
Ordenar resultados:
\`\`\`
GET /api/tasks?sortBy=createdAt&sortOrder=desc
\`\`\`

### Búsqueda
Buscar usuarios:
\`\`\`
GET /api/users?search=john
\`\`\`

## 🚀 Despliegue

### Variables de Entorno para Producción
\`\`\`env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskapi
JWT_SECRET=clave_super_segura_de_64_caracteres_minimo
JWT_REFRESH_SECRET=otra_clave_super_segura_diferente
\`\`\`

### Comandos de Despliegue
\`\`\`bash
# Instalar dependencias de producción
npm ci --only=production

# Iniciar aplicación
npm start
\`\`\`

## 🧪 Testing

Para probar la API puedes usar:
- **Postman** - Importa la colección de endpoints
- **curl** - Ejemplos incluidos en esta documentación
- **Thunder Client** - Extensión de VS Code
\`\`\`
