# 🚀 Guía de Despliegue - Observatorio IA México

Esta guía te ayudará a desplegar el Observatorio IA México en Vercel con Firebase y Claude API.

## Requisitos Previos

- Cuenta de [Vercel](https://vercel.com)
- Cuenta de [Firebase](https://firebase.google.com)
- Cuenta de [Anthropic](https://www.anthropic.com) (para Claude API)
- Repositorio Git (GitHub, GitLab, o Bitbucket)

## Paso 1: Configurar Firebase

### 1.1 Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Haz clic en "Agregar proyecto"
3. Nombra tu proyecto (ej: `observatorio-ia-mexico`)
4. Desactiva Google Analytics (opcional)
5. Haz clic en "Crear proyecto"

### 1.2 Habilitar Firestore

1. En el menú lateral, ve a "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Iniciar en modo de producción"
4. Elige una ubicación (ej: `us-central1`)
5. Haz clic en "Habilitar"

### 1.3 Configurar Reglas de Firestore

1. Ve a la pestaña "Reglas"
2. Reemplaza el contenido con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública
    match /{document=**} {
      allow read: if true;
    }
    
    // Restringir escritura (solo desde server)
    match /{document=**} {
      allow write: if false;
    }
  }
}
```

3. Haz clic en "Publicar"

### 1.4 Obtener Credenciales Web

1. Ve a "Configuración del proyecto" (ícono de engranaje)
2. En la sección "Tus apps", haz clic en el ícono web `</>`
3. Registra tu app (ej: "Observatorio IA Web")
4. Copia las credenciales que aparecen:
   - `apiKey`
   - `authDomain`
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

### 1.5 Crear Service Account

1. Ve a "Configuración del proyecto" → "Cuentas de servicio"
2. Haz clic en "Generar nueva clave privada"
3. Se descargará un archivo JSON
4. Abre el archivo y copia:
   - `project_id`
   - `client_email`
   - `private_key` (mantén los `\n` intactos)

## Paso 2: Obtener API Key de Claude

1. Ve a [Anthropic Console](https://console.anthropic.com)
2. Crea una cuenta o inicia sesión
3. Ve a "API Keys"
4. Haz clic en "Create Key"
5. Copia tu API key (empieza con `sk-ant-`)

## Paso 3: Preparar el Repositorio

### 3.1 Subir Código a Git

```bash
cd observatorio-ia-mexico
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <tu-repositorio-url>
git push -u origin main
```

### 3.2 Generar Secrets

Genera dos strings aleatorios de 32 caracteres para `CRON_SECRET` y `ADMIN_KEY`:

```bash
# En Linux/Mac
openssl rand -hex 32

# O usa un generador online
# https://www.random.org/strings/
```

## Paso 4: Desplegar en Vercel

### 4.1 Importar Proyecto

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio Git
4. Selecciona el framework: "Next.js"
5. **NO hagas clic en Deploy todavía**

### 4.2 Configurar Variables de Entorno

En la sección "Environment Variables", agrega las siguientes variables:

#### Claude API

```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

#### Firebase Admin (Server)

```
FIREBASE_PROJECT_ID=tu-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----\n"
```

**Importante**: El `FIREBASE_PRIVATE_KEY` debe incluir las comillas y los `\n` tal como aparecen en el JSON descargado.

#### Firebase Web (Client)

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx
```

#### Seguridad

```
CRON_SECRET=tu-string-aleatorio-de-32-caracteres
ADMIN_KEY=otro-string-aleatorio-de-32-caracteres
```

### 4.3 Deploy

1. Haz clic en "Deploy"
2. Espera a que termine el build (2-3 minutos)
3. Una vez completado, haz clic en "Visit" para ver tu sitio

## Paso 5: Cargar Datos Iniciales

Una vez desplegado, carga los datos iniciales:

```bash
curl -X POST https://tu-dominio.vercel.app/api/seed
```

Deberías recibir:

```json
{
  "success": true,
  "message": "10 anuncios iniciales cargados exitosamente"
}
```

## Paso 6: Verificar Cron Jobs

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a "Settings" → "Cron Jobs"
3. Deberías ver dos cron jobs configurados:
   - `/api/cron/semanal` — Lunes a las 10am (umbrella: detección + legislación + casos)
   - `/api/cron/mensual` — Día 1 de cada mes a las 11am (umbrella: recap + monitoreo)

## Paso 7: Probar el Panel de Admin

1. Ve a `https://tu-dominio.vercel.app/admin?key=TU_ADMIN_KEY`
2. Deberías ver el panel de administración
3. Prueba ejecutar los agentes manualmente

## Paso 8: Configurar Dominio Personalizado (Opcional)

1. En Vercel Dashboard, ve a "Settings" → "Domains"
2. Agrega tu dominio personalizado
3. Sigue las instrucciones para configurar DNS

## Troubleshooting

### Error: "Firebase Admin not initialized"

- Verifica que todas las variables de entorno de Firebase estén configuradas correctamente
- Asegúrate de que `FIREBASE_PRIVATE_KEY` incluya los `\n` y las comillas

### Error: "Anthropic API key invalid"

- Verifica que tu API key de Claude sea válida
- Asegúrate de que empiece con `sk-ant-`

### Error: "Firestore permission denied"

- Verifica las reglas de Firestore
- Asegúrate de permitir lectura pública y escritura desde server

### Cron jobs no se ejecutan

- Verifica que `CRON_SECRET` esté configurado en Vercel
- Los cron jobs solo funcionan en producción, no en preview

## Monitoreo

### Ver Logs

1. Ve a Vercel Dashboard → tu proyecto
2. Haz clic en "Logs" en el menú superior
3. Filtra por función (ej: `/api/cron/semanal` o `/api/cron/mensual`)

### Ver Datos en Firestore

1. Ve a Firebase Console → Firestore Database
2. Explora las colecciones:
   - `anuncios`: Todos los anuncios
   - `actividad`: Log de actividad
   - `agenteLogs`: Logs de ejecución de agentes

## Mantenimiento

### Actualizar el Código

```bash
git add .
git commit -m "Descripción del cambio"
git push
```

Vercel desplegará automáticamente los cambios.

### Actualizar Variables de Entorno

1. Ve a Vercel Dashboard → Settings → Environment Variables
2. Edita las variables necesarias
3. Redeploy el proyecto

### Backup de Datos

Exporta regularmente tus datos de Firestore:

```bash
gcloud firestore export gs://tu-bucket/backup-$(date +%Y%m%d)
```

## Costos Estimados

- **Vercel**: Gratis (Hobby plan) o $20/mes (Pro)
- **Firebase**: Gratis hasta ciertos límites, luego pay-as-you-go
- **Claude API**: ~$0.01 por ejecución de agente (estimado)

**Costo mensual estimado**: $0-5 USD para tráfico bajo/medio

## Soporte

Si encuentras problemas:

1. Revisa los logs en Vercel
2. Verifica la consola de Firebase
3. Abre un issue en el repositorio

---

¡Felicidades! Tu Observatorio IA México está ahora en producción 🎉
