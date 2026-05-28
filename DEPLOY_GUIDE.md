# Guía de Despliegue - Observatorio IA México

Esta guía te ayudará a desplegar el Observatorio IA México en Vercel de forma permanente.

## 📋 Requisitos Previos

1. **Cuenta de GitHub** (gratuita)
2. **Cuenta de Vercel** (gratuita) - https://vercel.com
3. **Cuenta de Firebase** (plan gratuito Spark)
4. **API Key de Claude** (Anthropic) - https://console.anthropic.com

## 🚀 Pasos para Desplegar

### 1. Crear Proyecto Firebase

1. Ve a https://console.firebase.google.com
2. Crea un nuevo proyecto llamado "observatorio-ia-mexico"
3. Activa Firestore Database en modo producción
4. Ve a Project Settings > Service Accounts
5. Genera una nueva clave privada (descarga el JSON)
6. Ve a Project Settings > General y copia la configuración web

### 2. Obtener API Key de Claude

1. Ve a https://console.anthropic.com
2. Crea una cuenta o inicia sesión
3. Ve a API Keys y genera una nueva clave
4. Guarda la clave de forma segura

### 3. Subir el Proyecto a GitHub

#### Opción A: Desde la interfaz web de GitHub

1. Ve a https://github.com/new
2. Crea un repositorio llamado "observatorio-ia-mexico"
3. Marca como público o privado (tu elección)
4. NO inicialices con README
5. Sube los archivos del proyecto (arrastra la carpeta o usa "uploading an existing file")

#### Opción B: Desde línea de comandos

```bash
# Navega al directorio del proyecto
cd observatorio-ia-mexico

# Inicializa git (si no está inicializado)
git init

# Configura tu usuario
git config user.email "tu@email.com"
git config user.name "Tu Nombre"

# Agrega todos los archivos
git add .

# Haz commit
git commit -m "Initial commit"

# Conecta con GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/TU_USUARIO/observatorio-ia-mexico.git

# Sube el código
git branch -M main
git push -u origin main
```

### 4. Desplegar en Vercel

1. Ve a https://vercel.com y crea una cuenta (puedes usar GitHub)
2. Click en "Add New..." > "Project"
3. Importa tu repositorio de GitHub "observatorio-ia-mexico"
4. Configura las variables de entorno:

#### Variables de Entorno Requeridas

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"

ANTHROPIC_API_KEY=sk-ant-api03-tu-clave-de-claude

ADMIN_KEY=una_clave_secreta_para_admin
```

**Importante**: 
- Para `FIREBASE_PRIVATE_KEY`, copia todo el contenido del campo "private_key" del JSON de Firebase
- Asegúrate de incluir las comillas y los `\n` para los saltos de línea
- `ADMIN_KEY` es una clave que tú defines para proteger el panel admin

5. Click en "Deploy"
6. Espera a que termine el despliegue (2-3 minutos)

### 5. Verificar Cron Jobs

Los cron jobs están configurados en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/semanal",
      "schedule": "0 10 * * 1"
    },
    {
      "path": "/api/cron/mensual",
      "schedule": "0 11 1 * *"
    }
  ]
}
```

- `semanal` (Lunes 10am) corre detección + legislación + casos.
- `mensual` (día 1, 11am) corre recap + monitoreo.

Más detalle en `CRON_JOBS.md`.

**Nota**: Los cron jobs solo funcionan en planes Pro de Vercel ($20/mes). En el plan gratuito, puedes ejecutar los agentes manualmente desde el panel admin.

### 6. Cargar Datos Iniciales

Una vez desplegado:

1. Ve a tu sitio: `https://tu-proyecto.vercel.app`
2. Navega a `/api/seed` para cargar los 10 anuncios iniciales
3. O usa curl: `curl -X POST https://tu-proyecto.vercel.app/api/seed`

### 7. Acceder al Panel Admin

1. Ve a `https://tu-proyecto.vercel.app/admin?key=TU_ADMIN_KEY`
2. Desde ahí puedes ejecutar los agentes manualmente
3. También puedes agregar anuncios de forma manual

## 🔄 Actualizaciones Futuras

Para actualizar el sitio después de hacer cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

Vercel detectará automáticamente los cambios y redesplegará el sitio.

## 🆓 Alternativa Sin Cron Jobs (Plan Gratuito)

Si usas el plan gratuito de Vercel, puedes:

1. Ejecutar los agentes manualmente desde el panel admin cada mes
2. Usar un servicio externo de cron gratuito como:
   - **Cron-job.org** (gratuito)
   - **EasyCron** (plan gratuito)
   - **GitHub Actions** (gratuito)

Configura estos servicios para hacer requests GET a:
- `https://tu-proyecto.vercel.app/api/cron/semanal` (cada lunes 10am — corre detección + legislación + casos)
- `https://tu-proyecto.vercel.app/api/cron/mensual` (día 1 cada mes 11am — corre recap + monitoreo)

## 🎯 URLs Importantes

- **Sitio principal**: `https://tu-proyecto.vercel.app`
- **Dashboard**: `https://tu-proyecto.vercel.app/dashboard`
- **Actividad**: `https://tu-proyecto.vercel.app/actividad`
- **Admin**: `https://tu-proyecto.vercel.app/admin?key=TU_ADMIN_KEY`
- **Seed**: `https://tu-proyecto.vercel.app/api/seed`

## ❓ Solución de Problemas

### Error: "Firebase not initialized"
- Verifica que todas las variables de entorno estén configuradas correctamente
- Revisa que `FIREBASE_PRIVATE_KEY` tenga el formato correcto con `\n`

### Error: "Claude API error"
- Verifica que tu API key de Claude sea válida
- Asegúrate de tener créditos disponibles en tu cuenta de Anthropic

### Los cron jobs no se ejecutan
- Los cron jobs solo funcionan en Vercel Pro
- Usa la alternativa gratuita con servicios externos o ejecución manual

## 📞 Soporte

Si tienes problemas, revisa:
- Logs en Vercel Dashboard > Tu Proyecto > Logs
- Console de Firebase para errores de base de datos
- Console de Anthropic para uso de API

## ✅ Checklist Final

- [ ] Proyecto subido a GitHub
- [ ] Variables de entorno configuradas en Vercel
- [ ] Sitio desplegado correctamente
- [ ] Datos iniciales cargados
- [ ] Panel admin accesible
- [ ] Agentes probados (manualmente o con cron)

¡Listo! Tu Observatorio IA México está funcionando permanentemente 🎉
