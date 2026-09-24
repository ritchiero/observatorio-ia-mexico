# Matriz de accesos — Itzel · Observatorio IA México
Generado: 2026-09-24T00:23:32.639065-06:00 (America/Mexico_City) / 2026-09-23T23:23:32.639451-07:00 PT
Sin secretos ni valores de credenciales.

## Snapshot recibido
| Ítem | Ruta | SHA256 / nota |
|---|---|---|
| ZIP transferencia | adjunto del agente | `168d402b1f4de24beeb8aca50c97a2d7df32f52bd47865648497c6e1d6a4579f` |
| LEEME-MIGRACION.md | `/workspace/observatorio-ia-mexico/LEEME-MIGRACION.md` (+ persistente `/home/box/observatorio-ia-mexico/`) | `57c67269a6a192c5a3ad119ca081a65096d0acc1db2db4137c77f2671478bbf2` |
| Código tar.gz | `codigo-84eb955.tar.gz` | `abbe49502ebd4c91fa152b59e1e57d5f27cbccc2d50a44009ee3b0f07f975825` (coincide con exigido) |
| Snapshot Git | `origin/master` | `84eb95503c46f5f5ec8042c93f5eba063b7b6028` |

## GitHub — PROBADO
| Campo | Valor |
|---|---|
| Usuario | `ritchiero` |
| Repo | `ritchiero/observatorio-ia-mexico` |
| Permiso API reportado | admin/maintain/push/pull/triage = true |
| Push ejecutado | Sí (distinto del permiso reportado) |
| Rama | `chore/itzel-migracion-recibo-20260924` |
| Commit | `78e6d5f879b328b552f6f624623aace0e6efd73c` |
| Archivo inicial | `docs/itzel-migracion-recibo.md` |
| ¿Master tocado? | No |

## Sitio público — PROBADO (lectura ejecutada 2026-09-24T00:23:32.639065-06:00)
| Endpoint | HTTP | Hallazgo |
|---|---|---|
| `/` | 200 | HTML ~75 KB |
| `/api/actividad` | 200 | count/limit; muestra reciente `2026-09-22T09:04:56.613Z` tipo `actualizacion` |
| `/api/anuncios` | 200 | 84 anuncios; muchos sin `createdAt`/`updatedAt` en muestra |
| `/api/iniciativas` | 200 | payload grande (~708 KB) |
| `/api/casos-ia` | 200 | ~32 KB |

HTTP 200 ≠ éxito de persistencia/cron. Crons Vercel existentes **no** desactivados.

## Vercel — PROBADO CON MATIZ (revalidado tras “Added”)
| Campo | Valor |
|---|---|
| Usuario MCP | `ricardo.rodriguez@getlawgic.com` (`ricardorodriguez-3218`) |
| defaultTeamId / accountId | `team_6NHzzhpLapfxfVUOumgDmK6c` |
| Proyecto | `observatorio-ia-mexico` / `prj_0t47BKSpiUaxa05BSnpwZjn98R10` |
| Coincidencia LEEME (correo, team, prj) | Sí vía `get_auth_user` + `list_projects`/`get_project` **sin** teamId |
| `get_project`/`get_team` **con** teamId | **403** scope `ricardo-rodriguezs-projects-11271b26` — requiere re-auth de ese scope |
| Domains vistos | `www.observatorio-ia-mexico.com`, aliases del scope |
| Deploy/escritura desde Itzel | No ejecutados aún |
| “Added” ≠ autorización completa | Correcto: hay gap de scope en operaciones team-scoped |

## Firebase / contenido — PENDIENTE (mecanismo mínimo propuesto)
### Ya disponible sin admin
Lectura pública de contenido vía APIs anteriores (anuncios, iniciativas, casos-ia, actividad).

### Lo que el código exige hoy para escritura/backup
- `requireAdmin()` = sesión NextAuth con rol admin (amplio; incluye rutas como `/api/admin/suscripciones`).
- Varias rutas de agentes usan `ADMIN_KEY` vía Bearer (`requireServiceToken`) — **tampoco** es alcance limitado a contenido.
- `/api/admin/backup-firestore` solo exporta colección `iniciativas` y exige `requireAdmin` completo.

### Propuesta de mecanismo mínimo (NO implementada; requiere aprobación)
1. Nuevo secreto de alcance limitado, p.ej. `CONTENT_OPS_TOKEN` (nombre a confirmar), **distinto** de `ADMIN_KEY` y de service account amplia.
2. Rutas nuevas o endurecidas, p.ej. `/api/ops/content/*` y `/api/ops/backup-content`, autenticadas solo con ese token Bearer.
3. Allowlist de colecciones: `anuncios`, `iniciativas`, `casos`/`casos-ia` (nombre real en Firestore), `actividad` (+ subcolecciones de timeline/fuentes ligadas a esos docs si hace falta para respaldo coherente).
4. **Excluir siempre**: `suscripciones`, usuarios Auth, IAM, secrets, y cualquier listado de correos.
5. Backup: export JSON solo de la allowlist; sin ampliar IAM de Firebase Console.
6. Escrituras factuales: mismo token + bitácora/changelog; un solo escritor (no competir con cron Vercel existente hasta prueba).

### Ajuste de código necesario (si apruebas)
- Añadir guard `requireContentOps(request)` que **no** reutilice `ADMIN_KEY`.
- No conceder `requireAdmin` a Itzel como atajo.
- Opcional: custom claim / rol `content_ops` en NextAuth **sin** permiso de suscripciones — solo si prefieres sesión humana; para automatización el Bearer acotado es más claro.
- PR → CI → deploy → verificación pública obligatorios.

### Pedido concreto de aprobación
Autorizar (sí/no) crear el token acotado + rutas `/api/ops/content` y backup allowlist, **excluyendo suscriptores/auth/IAM**, sin service account amplia ni `ADMIN_KEY` como equivalente.

## Modelos (configuración vs runtime)
| Servicio | En entorno Itzel (caja) | Notas |
|---|---|---|
| Anthropic (`ANTHROPIC_API_KEY`) | Ausente | No invocado |
| OpenRouter (`OPENROUTER_API_KEY`) | Nombre presente (no se imprime valor) | **No invocado** como prueba de pago |
| OpenAI | Ausente | — |
| Runtime Vercel | Variables del proyecto en Vercel (no leídas aquí tras 403 de scope; no duplicar en Grok si la app publica vía API segura) | Distinto del entorno local de Itzel |
| Conclusión | No hace falta copiar secretos de modelos a Itzel si la detección/publicación corre en Vercel con sus propias env y APIs autenticadas |

## Rutinas (mismas dos; actualizadas; zona confirmada)
| Nombre | Folder | Cron | Zona |
|---|---|---|---|
| Observatorio · lectura diaria | `observatorio-lectura-diaria` | `0 8 * * *` | `America/Mexico_City` |
| Observatorio · auditoría documental semanal | `observatorio-auditor-a-documental-semanal` | `0 9 * * 1` | `America/Mexico_City` |

Prompt actualizado: investigar fuentes oficiales según inventario/rotación; aplicar correcciones factuales comprobadas + código + CI/deploy/verificación **cuando** acceso y escritor único estén resueltos; si no, conservar lote listo + bloqueo concreto. **No** modo permanente “solo proponer”.

Estado scheduler: aún “never run” al momento de este doc; **prueba de lectura manual ejecutada** (tabla sitio público arriba).
