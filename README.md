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
npm install
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
- `FIREBASE_ADMIN_PROJECT_ID`: ID del proyecto
- `FIREBASE_ADMIN_CLIENT_EMAIL`: Email del service account
- `FIREBASE_ADMIN_PRIVATE_KEY`: Private key (con saltos de línea)

**Seguridad:**
- `CRON_SECRET`: String aleatorio de 32 caracteres
- `ADMIN_KEY`: Token Bearer para integraciones de servicio; no autentica el panel
- `NEXTAUTH_SECRET`: Secreto aleatorio para firmar la sesión
- `SUBSCRIPTION_RATE_LIMIT_SECRET`: Secreto HMAC de 32+ caracteres para el límite distribuido de altas (si se omite, usa `NEXTAUTH_SECRET`)
- `ADMIN_USERNAME`: Usuario del panel
- `ADMIN_EMAIL`: Correo opcional para iniciar sesión
- `ADMIN_PASSWORD_HASH`: Hash bcrypt de la contraseña
- `PDF_BACKUP_ALLOWED_HOSTS`: Allowlist opcional de repositorios PDF

Para que los documentos efímeros del límite de suscripciones se eliminen de
forma automática, configura una política TTL de Firestore sobre el campo
`expiresAt` de la colección `_rate_limits`.

### 3. Configurar Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Firestore Database
3. Crear service account y descargar credenciales
4. Desplegar las reglas de Firestore incluidas en el repositorio:

```bash
firebase deploy --only firestore:rules
```

Las reglas niegan toda lectura y escritura desde SDKs cliente. El sitio público
lee exclusivamente mediante APIs Next.js saneadas; Firebase Admin opera sólo
en servidor y aplica sus propias guardas de autorización.

Antes de recibir tráfico, agrega en Vercel Firewall una regla de rate limiting
para `POST /api/suscripciones`, con ventana fija de 10 minutos, máximo 5
solicitudes por IP y respuesta 429. El límite Firestore incluido en la API es
una segunda capa y no sustituye el filtro previo a la Function.

### 4. Datos iniciales

Las APIs de lectura pueden usar los datos públicos en desarrollo cuando no hay
credenciales de Firebase Admin. Cualquier importación se realiza desde el panel
administrativo autenticado; el proyecto no expone una ruta pública de seed.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 📅 Cron Jobs

Los agentes se ejecutan automáticamente en Vercel:

- **Detección**: Día 1 de cada mes a las 9am (busca nuevos anuncios)
- **Monitoreo**: Día 15 de cada mes a las 9am (actualiza anuncios existentes)

## 🔧 Panel de Administración

Acceder a `/admin/login` con la sesión administrativa para:

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
4. **Admin (/admin/login)**: Panel de administración con sesión NextAuth

## 📦 Scripts

```bash
npm run dev       # Desarrollo
npm run build     # Build para producción
npm start         # Servidor de producción
npm run lint      # Linter
```

## 🤝 Contribuir

Este es un proyecto de código abierto para transparencia ciudadana. Contribuciones son bienvenidas.

## 📄 Licencia

MIT

## 👥 Créditos

Proyecto inspirado en el artículo "México 2025: la IA que vive en PowerPoint" por Ricardo Rodríguez.

---

**Nota**: Este proyecto es una iniciativa ciudadana independiente y no tiene afiliación con el gobierno mexicano.
