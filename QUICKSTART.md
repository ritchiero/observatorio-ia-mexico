# ⚡ Guía Rápida - Observatorio IA México

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y completa las siguientes variables mínimas para desarrollo local:

```env
# Claude API (obligatorio para agentes)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# Firebase Admin (obligatorio)
FIREBASE_ADMIN_PROJECT_ID=tu-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=tu-client-email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Firebase Web (obligatorio)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Seguridad (genera strings aleatorios)
CRON_SECRET=cualquier-string-aleatorio
ADMIN_KEY=token-bearer-para-servicios
NEXTAUTH_SECRET=secreto-aleatorio-de-sesion
ADMIN_USERNAME=tu-usuario-admin
ADMIN_PASSWORD_HASH=hash-bcrypt-de-tu-password
```

### 3. Iniciar servidor de desarrollo

```bash
npm run dev
```

### 4. Datos locales

En desarrollo, si no hay credenciales de Firebase Admin, las APIs de lectura
usan la fuente pública del Observatorio. Las importaciones se ejecutan sólo
desde el panel administrativo autenticado; no existe un endpoint público de seed.

### 5. Abrir en navegador

- **Dashboard**: http://localhost:3000
- **Actividad**: http://localhost:3000/actividad
- **Admin**: http://localhost:3000/admin/login

## 📋 Checklist de Configuración

### Firebase

- [ ] Crear proyecto en [Firebase Console](https://console.firebase.google.com)
- [ ] Habilitar Firestore Database
- [ ] Configurar reglas de Firestore (lectura pública, escritura desde server)
- [ ] Obtener credenciales web (API Key, Auth Domain, etc.)
- [ ] Crear service account y descargar JSON

### Claude API

- [ ] Crear cuenta en [Anthropic](https://console.anthropic.com)
- [ ] Generar API Key
- [ ] Copiar API Key a `.env.local`

### Vercel (para producción)

- [ ] Conectar repositorio Git
- [ ] Configurar variables de entorno
- [ ] Deploy
- [ ] Cargar datos iniciales en producción

## 🧪 Probar Agentes Localmente

### Ejecutar Detección Manual

```bash
curl -X POST http://localhost:3000/api/agents/detect
```

### Ejecutar Monitoreo Manual

```bash
curl -X POST http://localhost:3000/api/agents/monitor
```

## 📁 Archivos Importantes

- `app/page.tsx` - Dashboard principal
- `lib/agents.ts` - Lógica de agentes de IA
- `lib/prompts.ts` - Prompts para Claude
- `app/api/admin/import-iniciativas/route.ts` - Importación autenticada
- `vercel.json` - Configuración de cron jobs

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción local
npm start

# Linter
npm run lint

# Limpiar cache
rm -rf .next
```

## 🐛 Problemas Comunes

### "Firebase Admin not initialized"

→ Verifica que todas las variables de Firebase estén en `.env.local`

### "Anthropic API key invalid"

→ Verifica que tu API key sea válida y empiece con `sk-ant-`

### "Cannot find module '@/types'"

→ Ejecuta `npm install` de nuevo

### Página en blanco

→ Revisa la consola del navegador y los logs del servidor

## 📚 Documentación Completa

- [README.md](./README.md) - Documentación completa
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guía de despliegue detallada

## 🆘 Ayuda

Si tienes problemas:

1. Revisa los logs en la terminal
2. Abre la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas
4. Consulta la documentación de Firebase y Anthropic

---

¡Listo! Ahora tienes el Observatorio IA México corriendo localmente 🎉
