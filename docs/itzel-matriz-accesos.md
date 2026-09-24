# Matriz de accesos — Itzel · Observatorio IA México

Generado: 2026-09-24T00:25:03.484054-06:00 (America/Mexico_City). **Sin secretos ni valores de credenciales.**

## Snapshot recibido
| Ítem | Ruta / nota | SHA256 |
|---|---|---|
| ZIP transferencia | `/home/box/sand-data/agents/97dea623-8da9-4210-9882-36e0354eab65/attachments/168d402b1f4de24beeb8aca50c97a2d7df32f52bd47865648497c6e1d6a4579f.zip` | `168d402b1f4de24beeb8aca50c97a2d7df32f52bd47865648497c6e1d6a4579f` |
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
| Push **ejecutado** | Sí (confirmado también por Ricardo) |
| Rama | `chore/itzel-migracion-recibo-20260924` |
| Commit de prueba | `78e6d5f879b328b552f6f624623aace0e6efd73c` → `docs/itzel-migracion-recibo.md` |
| URL | https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-migracion-recibo.md |
| ¿Master tocado? | No |

## Sitio público — PROBADO (lectura **ejecutada** 2026-09-24T00:25:03.484054-06:00)
Base: `https://www.observatorio-ia-mexico.com`

| Endpoint | HTTP | Bytes | Hallazgo |
|---|---|---|---|
| `/` | 200 | 75002 | HTML |
| `/api/actividad` | 200 | 92086 | 200 ítems en respuesta; fecha muestra `2026-09-22T09:04:56.613Z` |
| `/api/anuncios` | 200 | 201969 | 84 anuncios |
| `/api/iniciativas` | 200 | 708243 | payload grande |
| `/api/casos-ia` | 200 | 31711 | OK |

HTTP 200 ≠ éxito de cron/persistencia. Crons Vercel existentes **intactos**.

## Vercel — PROBADO CON MATIZ (revalidado tras “Added”)
| Campo | Valor |
|---|---|
| Usuario MCP | correo del LEEME / `ricardorodriguez-3218` |
| Team / accountId | `team_6NHzzhpLapfxfVUOumgDmK6c` |
| Proyecto | `observatorio-ia-mexico` / `prj_0t47BKSpiUaxa05BSnpwZjn98R10` |
| Coincidencia LEEME | Sí (correo, team, prj) |
| Ops con teamId explícito | Pueden devolver **403** de scope → “Added” ≠ autorización completa |
| Deploy desde Itzel | No ejecutado aún |

### Nombres de env en Vercel (solo keys)
`ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OPENROUTER_API_KEY`, `ADMIN_KEY`, `CRON_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, `ADMIN_EMAIL`, `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `NEXT_PUBLIC_FIREBASE_*`, `SUBSCRIPTION_RATE_LIMIT_SECRET`.

### Caja Itzel (local) — solo presencia
| Nombre | Estado |
|---|---|
| `ANTHROPIC_API_KEY` | Ausente |
| `OPENROUTER_API_KEY` | Presente (no invocado; valor no impreso) |
| `ADMIN_KEY` / `CRON_SECRET` / Firebase Admin | Ausentes |

Runtime producción = env Vercel. No duplicar secretos de modelos en Itzel si la app publica vía API segura en Vercel.

## Firebase / contenido — PENDIENTE (mecanismo mínimo)
### Ya posible sin admin
Lectura pública: anuncios, iniciativas, casos-ia, actividad.

### Código actual para escritura/backup
- `requireAdmin()` = sesión NextAuth admin (incluye `/api/admin/suscripciones` → demasiado amplio).
- Varias rutas usan Bearer `ADMIN_KEY` → tampoco es alcance limitado a contenido.
- `/api/admin/backup-firestore` exporta solo `iniciativas` y exige admin completo.

**Conclusión:** `ADMIN_KEY` o service account amplia **no** equivalen al acceso mínimo pedido.

### Propuesta (NO implementada; requiere aprobación)
1. Nuevo secreto acotado `CONTENT_OPS_TOKEN`, distinto de `ADMIN_KEY` y de SA amplia.
2. Rutas `/api/ops/content/*` y `/api/ops/backup-content` solo con ese Bearer.
3. Allowlist: `anuncios`, `iniciativas`, colección de casos de `/api/casos-ia`, `actividad` (+ subdatos de timeline/fuentes ligados si hacen falta).
4. Excluir siempre: `suscripciones`, Auth users, IAM, secretos, listados de correo.
5. Un solo escritor; no competir con `/api/cron/todo` hasta prueba.
6. Entrega: PR → CI → deploy → verificación pública.

### Pedido de aprobación
¿Autorizas crear `CONTENT_OPS_TOKEN` + rutas ops allowlist (sin suscriptores/auth/IAM), sin tratar `ADMIN_KEY`/SA amplia como equivalente? Responde sí/no.

## Rutinas — mismas dos, actualizadas, zona confirmada
| Nombre | Folder | Horario | Zona |
|---|---|---|---|
| Observatorio · lectura diaria | `observatorio-lectura-diaria` | `0 8 * * *` | **America/Mexico_City** |
| Observatorio · auditoría documental semanal | `observatorio-auditor-a-documental-semanal` | `0 9 * * 1` | **America/Mexico_City** |

Prompt: investigar fuentes oficiales según inventario/rotación; aplicar correcciones factuales + código + CI/deploy/verificación cuando acceso y escritor único estén resueltos; si no, lote listo + bloqueo concreto. No modo permanente “solo proponer”.

Scheduler: sin primer fire automático aún; **prueba de lectura manual ya ejecutada** (tabla sitio público).
