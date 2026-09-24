# Recibo de migración — Itzel · Observatorio IA México

Fecha: 2026-09-24T00:24:26-06:00 (America/Mexico_City)

## Identidad
Agente: **Itzel · Observatorio IA México**. Continuidad Codex→Itzel. Actualizar código ≠ datos vigentes.

## Paquete
- Workspace: `/workspace/observatorio-ia-mexico/`
- Persistente: `/home/box/observatorio-ia-mexico/`
- ZIP `168d402b1f4de24beeb8aca50c97a2d7df32f52bd47865648497c6e1d6a4579f` · LEEME `57c67269a6a192c5a3ad119ca081a65096d0acc1db2db4137c77f2671478bbf2` · tar `abbe49502ebd4c91fa152b59e1e57d5f27cbccc2d50a44009ee3b0f07f975825` · master `84eb95503c46f5f5ec8042c93f5eba063b7b6028`

## Accesos
1. **GitHub escritura PROBADA** — rama `chore/itzel-migracion-recibo-20260924`, commit `78e6d5f879b328b552f6f624623aace0e6efd73c` (`docs/itzel-migracion-recibo.md`). Ricardo confirmó en GitHub. Master intacto.
2. **Sitio público — lectura EJECUTADA** — home + `/api/actividad|anuncios|iniciativas|casos-ia` HTTP 200; actividad reciente `2026-09-22T09:04:56.613Z`.
3. **Vercel** — identidad/proyecto coinciden con LEEME; “Added” no implica scope team completo (403 posible con teamId). Sin deploy desde Itzel.
4. **Firebase contenido acotado** — no autorizado. Lectura pública sí. Propuesta `CONTENT_OPS_TOKEN` en la matriz (requiere sí explícito). No usar `ADMIN_KEY`/SA amplia como equivalente.

## Modelos
- Vercel tiene configurados (nombres): `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OPENROUTER_API_KEY`.
- Caja Itzel: Anthropic ausente; OpenRouter presente y **no invocado**.
- No duplicar secretos en Itzel si la publicación va por API segura en runtime Vercel.

## Rutinas
- Actualizadas las **mismas** dos (sin duplicar).
- Zona **America/Mexico_City** confirmada (`CRON_TZ`).
- Diaria 08:00; semanal lunes 09:00.
- Aplican correcciones cuando haya acceso + escritor único; si no, lote + bloqueo.
- Cron automático: pendiente primer fire; **lectura de prueba ya corrida**.

## Bloqueos
1. Aprobación mecanismo Firebase/contenido acotado.
2. Re-auth Vercel al scope del team si hacen falta logs/env/deploy team-scoped.
3. Definir escritor único vs crons Vercel antes de escritores concurrentes.

## Crons Vercel (intactos)
- `/api/cron/todo` → `0 9 */3 * *`
- `/api/cron/mensual` → `0 11 1 * *`

## Archivos en esta rama
- https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-migracion-recibo.md
- https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-matriz-accesos.md
- https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-recibo-migracion.md
