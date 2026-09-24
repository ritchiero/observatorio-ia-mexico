# Recibo de migración — Itzel · Observatorio IA México
Fecha: 2026-09-24T00:23:32.639065-06:00 (America/Mexico_City)

## Identidad
Agente: Itzel · Observatorio IA México  
Continuidad: Codex → Itzel. Actualizar código ≠ datos vigentes.

## Paquete
- Extraído en `/workspace/observatorio-ia-mexico/`
- Persistente: `/home/box/observatorio-ia-mexico/LEEME-MIGRACION.md`
- Snapshot código: `84eb95503c46f5f5ec8042c93f5eba063b7b6028`
- Hash tar exigido: verificado OK

## Accesos probados
1. **GitHub escritura**: commit `78e6d5f879b328b552f6f624623aace0e6efd73c` en `chore/itzel-migracion-recibo-20260924` (confirmado también por Ricardo). Master intacto.
2. **Sitio público lectura ejecutada** (2026-09-24T00:23:32.639065-06:00): home + `/api/actividad|anuncios|iniciativas|casos-ia` → HTTP 200 con cuerpos no vacíos. Última actividad muestra ~2026-09-22.
3. **Vercel MCP**: identidad y proyecto coinciden con LEEME; operaciones con `teamId` pueden devolver 403 de scope — “Added” no basta. Sin deploy desde Itzel aún.
4. **Firebase admin/contenido acotado**: no autorizado. Lectura pública sí. Propuesta de token/rutas de contenido en `docs/itzel-matriz-accesos.md` (requiere tu sí explícito).

## Rutinas
- Actualizadas las **mismas** dos (sin duplicar).
- Zona: **America/Mexico_City** en ambas (`CRON_TZ`).
- Diaria 08:00; semanal lunes 09:00.
- Capacidad de aplicar correcciones cuando haya acceso + escritor único; si no, lote + bloqueo.
- Scheduler: pending first fire; lectura de prueba **ya ejecutada** fuera del cron.

## Bloqueos concretos
1. Aprobación del mecanismo Firebase/contenido acotado (no `ADMIN_KEY`, no SA amplia, sin suscriptores).
2. Re-auth Vercel al scope `ricardo-rodriguezs-projects-11271b26` si hacen falta logs/env/deploy team-scoped.
3. Definir escritor único vs crons Vercel existentes antes de escritores concurrentes.

## Crons Vercel (intactos)
- `/api/cron/todo` → `0 9 */3 * *`
- `/api/cron/mensual` → `0 11 1 * *`

## Archivos en esta rama
- `docs/itzel-migracion-recibo.md` (prueba inicial)
- `docs/itzel-matriz-accesos.md` (esta matriz)
- `docs/itzel-recibo-migracion.md` (este recibo)
