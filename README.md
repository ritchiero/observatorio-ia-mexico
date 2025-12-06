# 🇲🇽 Observatorio IA México

Seguimiento ciudadano automatizado de anuncios gubernamentales sobre inteligencia artificial en México.

## 📋 Descripción

Este proyecto es un observatorio ciudadano que monitorea y da seguimiento a los anuncios del gobierno mexicano relacionados con inteligencia artificial. Utiliza agentes de IA automatizados para:

- **Detectar nuevos anuncios** del gobierno sobre IA (mensual)
- **Monitorear avances** de proyectos anunciados (quincenal)
- **Registrar cambios de status** basados en evidencia
- **Mantener transparencia** sobre promesas y cumplimientos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router, TypeScript, React)
- **Estilos**: Tailwind CSS 4
- **Base de datos**: Firebase Firestore
- **Agentes IA**: Claude API con Web Search nativo
- **Hosting**: Vercel
- **Cron Jobs**: Vercel Cron

## 📁 Estructura del Proyecto

```
observatorio-ia-mexico/
├── app/
│   ├── page.tsx                      # Dashboard público
│   ├── layout.tsx                    # Layout principal
│   ├── anuncio/[id]/page.tsx         # Detalle de anuncio
│   ├── actividad/page.tsx            # Feed de actividad
│   ├── admin/page.tsx                # Panel admin
│   └── api/
│       ├── anuncios/                 # CRUD de anuncios
│       ├── actividad/                # Log de actividad
│       ├── agents/                   # Ejecución manual de agentes
│       ├── cron/                     # Endpoints para Vercel Cron
│       └── seed/                     # Datos iniciales
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── StatsOverview.tsx
│   ├── AnuncioCard.tsx
│   ├── StatusBadge.tsx
│   ├── Timeline.tsx
│   ├── ActividadFeed.tsx
│   └── AdminForm.tsx
├── lib/
│   ├── firebase.ts                   # Config Firebase client
│   ├── firebase-admin.ts             # Config Firebase admin
│   ├── claude.ts                     # Wrapper Claude API
│   ├── prompts.ts                    # Prompts de agentes
│   ├── agents.ts                     # Lógica de agentes
│   └── utils.ts                      # Utilidades
├── types/
│   └── index.ts                      # Tipos TypeScript
├── .env.example                      # Variables de entorno ejemplo
└── vercel.json                       # Config cron jobs
```

## 🚀 Instalación

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env.local` y completar con tus credenciales:

```bash
cp .env.example .env.local
```

#### Variables requeridas:

**Claude API:**
- `ANTHROPIC_API_KEY`: Tu API key de Anthropic

**Firebase Admin (Server):**
- `FIREBASE_PROJECT_ID`: ID del proyecto
- `FIREBASE_CLIENT_EMAIL`: Email del service account
- `FIREBASE_PRIVATE_KEY`: Private key (con saltos de línea)

**Firebase Web (Client):**
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

**Seguridad:**
- `CRON_SECRET`: String aleatorio de 32 caracteres
- `ADMIN_KEY`: String aleatorio de 32 caracteres

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Crear service account y descargar credenciales
4. Configurar reglas de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 4. Cargar datos iniciales

```bash
# Iniciar servidor de desarrollo
pnpm dev

# En otra terminal, cargar datos iniciales
curl -X POST http://localhost:3000/api/seed
```

### 5. Ejecutar en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📅 Cron Jobs

Los agentes se ejecutan automáticamente en Vercel:

- **Detección**: Día 1 de cada mes a las 9am (busca nuevos anuncios)
- **Monitoreo**: Día 15 de cada mes a las 9am (actualiza anuncios existentes)

## 🔧 Panel de Administración

Acceder a `/admin?key=TU_ADMIN_KEY` para:

- Ejecutar agentes manualmente
- Agregar anuncios manualmente
- Ver logs de ejecución

## 🚀 Deploy en Vercel

1. Conectar repositorio con Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático

```bash
vercel --prod
```

## 📝 API Endpoints

### Públicos

- `GET /api/anuncios` - Obtener todos los anuncios
- `GET /api/anuncios/[id]` - Obtener un anuncio específico
- `GET /api/actividad` - Obtener actividad reciente

### Protegidos (Admin)

- `POST /api/anuncios` - Crear anuncio manualmente
- `PUT /api/anuncios/[id]` - Actualizar anuncio
- `DELETE /api/anuncios/[id]` - Eliminar anuncio
- `POST /api/agents/detect` - Ejecutar detección manual
- `POST /api/agents/monitor` - Ejecutar monitoreo manual

## 🎨 Vistas

1. **Dashboard (/)**: Estadísticas, último anuncio, lista completa con filtros
2. **Detalle (/anuncio/[id])**: Información completa y timeline de actualizaciones
3. **Actividad (/actividad)**: Feed de actividad reciente
4. **Admin (/admin?key=xxx)**: Panel de administración

## 📦 Scripts

```bash
pnpm dev          # Desarrollo
pnpm build        # Build para producción
pnpm start        # Servidor de producción
pnpm lint         # Linter
```

## 🤝 Contribuir

Este es un proyecto de código abierto para transparencia ciudadana. Contribuciones son bienvenidas.

## 📄 Licencia

MIT

## 👥 Créditos

Proyecto inspirado en el artículo "México 2025: la IA que vive en PowerPoint" por Ricardo Rodríguez.

---

**Nota**: Este proyecto es una iniciativa ciudadana independiente y no tiene afiliación con el gobierno mexicano.
