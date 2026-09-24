# Matriz de accesos — Itzel · Observatorio IA México

Generado: 2026-09-24T00:24:26-06:00 (America/Mexico_City). **Sin secretos ni valores de credenciales.**

## Snapshot recibido
| Ítem | Ruta / nota | SHA256 |
|---|---|---|
| ZIP transferencia | adjunto agente | `168d402b1f4de24beeb8aca50c97a2d7df32f52bd47865648497c6e1d6a4579f` |
| `LEEME-MIGRACION.md` | `/workspace/observatorio-ia-mexico/` (+ `/home/box/observatorio-ia-mexico/`) | `57c67269a6a192c5a3ad119ca081a65096d0acc1db2db4137c77f2671478bbf2` |
| `codigo-84eb955.tar.gz` | coincide con hash exigido | `abbe49502ebd4c91fa152b59e1e57d5f27cbccc2d50a44009ee3b0f07f975825` |
| Código extraído | `/workspace/observatorio-ia-mexico/codigo/` | snapshot `84eb955` |
| `origin/master` | no modificado por Itzel | `84eb95503c46f5f5ec8042c93f5eba063b7b6028` |

## GitHub — PROBADO
| Campo | Valor |
|---|---|
| Usuario | `ritchiero` |
| Repo | `ritchiero/observatorio-ia-mexico` |
| Permiso API **reportado** | admin/maintain/push/pull/triage = true |
| Push **ejecutado** | Sí |
| Rama | `chore/itzel-migracion-recibo-20260924` |
| Commit de prueba | `78e6d5f879b328b552f6f624623aace0e6efd73c` → `docs/itzel-migracion-recibo.md` |
| URL | https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-migracion-recibo.md |
| ¿Master tocado? | No |

## Sitio público — PROBADO (lectura **ejecutada**, no solo programada)
Base: `https://www.observatorio-ia-mexico.com`

| Endpoint | HTTP | Hallazgo |
|---|---|---|
| `/` | 200 | HTML ~75 KB |
| `/api/actividad` | 200 | ~92 KB; muestra reciente fecha `2026-09-22T09:04:56.613Z`; limit/count presentes |
| `/api/anuncios` | 200 | 84 anuncios |
| `/api/iniciativas` | 200 | ~708 KB |
| `/api/casos-ia` | 200 | ~32 KB |

HTTP 200 ≠ éxito de cron/persistencia. Crons Vercel existentes **intactos**.

## Vercel — PROBADO CON MATIZ (revalidado tras “Added”)
| Campo | Valor |
|---|---|
| Usuario MCP | correo LEEME / username `ricardorodriguez-3218` |
| Team / accountId | `team_6NHzzhpLapfxfVUOumgDmK6c` |
| Proyecto | `observatorio-ia-mexico` / `prj_0t47BKSpiUaxa05BSnpwZjn98R10` |
| Coincidencia LEEME | Sí (correo, team, prj) vía list/get **sin** forzar teamId roto |
| Operaciones con teamId explícito | Pueden devolver **403** de scope (`ricardo-rodriguezs-projects-11271b26`) → “Added” ≠ auth completa |
| Deploy desde Itzel | No ejecutado aún |

### Nombres de env en Vercel (solo **keys**, sin valores)
Presentes (entre otras): `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OPENROUTER_API_KEY`, `ADMIN_KEY`, `CRON_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_*`, `SUBSCRIPTION_RATE_LIMIT_SECRET`.

### Entorno local Itzel (caja) — presencia de nombres
| Nombre | En caja Itzel |
|---|---|
| `ANTHROPIC_API_KEY` | Ausente |
| `OPENROUTER_API_KEY` | Presente (no invocado; no se imprime valor) |
| `ADMIN_KEY` / `CRON_SECRET` / Firebase Admin | Ausentes |

**Distinción:** runtime de producción = env de Vercel. Caja Itzel ≠ runtime. No hace falta duplicar secretos de modelos en Itzel si la app publica vía APIs seguras en Vercel.

## Firebase / contenido — PENDIENTE (mecanismo mínimo; sin ampliar acceso)
### Ya posible sin admin
Lectura pública de anuncios, iniciativas, casos-ia, actividad.

### Lo que el código exige hoy para escritura/backup
- `requireAdmin()` = sesión NextAuth admin (incluye `/api/admin/suscripciones` → **demasiado amplio**).
- Varias rutas de agentes usan Bearer `ADMIN_KEY` → **tampoco** es alcance limitado a contenido.
- `/api/admin/backup-firestore` exporta solo `iniciativas` y exige admin completo.

**Por tanto:** `ADMIN_KEY` o service account amplia **no** son equivalentes al acceso mínimo pedido.

### Propuesta (NO implementada; requiere tu sí)
1. Nuevo secreto acotado, p.ej. `CONTENT_OPS_TOKEN`, **distinto** de `ADMIN_KEY` y de SA amplia.
2. Rutas nuevas `/api/ops/content/*` y `/api/ops/backup-content` solo con ese Bearer.
3. Allowlist: `anuncios`, `iniciativas`, colección de casos usada por `/api/casos-ia`, `actividad` (+ subdatos de timeline/fuentes ligados a esos docs si hacen falta para respaldo coherente).
4. **Excluir siempre:** `suscripciones`, Auth users, IAM, secretos, listados de correo.
5. Un solo escritor; no competir con `/api/cron/todo` hasta prueba.
6. Entrega: PR → CI → deploy → verificación pública.

### Pedido de aprobación (responde sí/no)
¿Autorizas crear `CONTENT_OPS_TOKEN` + rutas ops allowlist (sin suscriptores/auth/IAM), **sin** tratar `ADMIN_KEY`/SA amplia como equivalente?

## Rutinas — mismas dos, actualizadas, zona confirmada
| Nombre | Folder | Horario | Zona |
|---|---|---|---|
| Observatorio · lectura diaria | `observatorio-lectura-diaria` | `0 8 * * *` | **America/Mexico_City** |
| Observatorio · auditoría documental semanal | `observatorio-auditor-a-documental-semanal` | `0 9 * * 1` | **America/Mexico_City** |

Prompt: investigar fuentes oficiales según inventario/rotación; aplicar correcciones factuales + código + CI/deploy/verificación cuando acceso y escritor único estén resueltos; si no, lote listo + bloqueo concreto. **No** modo permanente “solo proponer”.

Scheduler: aún sin primer fire automático; **prueba de lectura manual ya ejecutada** (tabla sitio público).
