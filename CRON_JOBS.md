# Configuración de Cron Jobs

Este proyecto usa **Vercel Cron Jobs** para correr los agentes automáticos del Observatorio.

> ⚠️ **Fuente única de verdad: `vercel.json`.** Esta doc se sincroniza con ese archivo.

## Crons activos (en producción)

Solo hay **dos** crons registrados en Vercel. Ambos son *umbrellas* que ejecutan varios sub-pasos en orden.

### 1. Cron semanal — ingesta nueva

- **Endpoint**: `/api/cron/semanal`
- **Schedule**: `0 10 * * 1` (Lunes 10:00 AM, hora del servidor / UTC)
- **Qué hace**: corre `ejecutarAgenteDeteccion` (anuncios nuevos), después llama internamente a `/api/cron/legislacion` (iniciativas nuevas) y `/api/cron/casos` (casos judiciales nuevos).
- **Sub-pasos llamados** (no son crons independientes en Vercel, los dispara `semanal`):
  - `/api/cron/deteccion` — busca nuevos anuncios oficiales
  - `/api/cron/legislacion` — busca nuevas iniciativas de ley
  - `/api/cron/casos` — busca nuevos casos judiciales

### 2. Cron mensual — recap + monitoreo

- **Endpoint**: `/api/cron/mensual`
- **Schedule**: `0 11 1 * *` (día 1 de cada mes, 11:00 AM)
- **Qué hace**: corre `ejecutarAgenteRecapMensual` primero (rápido, ~30s), después llama internamente a `/api/cron/monitoreo` para actualizar estados de anuncios.
- **Sub-pasos llamados** (idem):
  - `/api/cron/recap` (lógica equivalente) — genera el recap del mes anterior
  - `/api/cron/monitoreo` — actualiza estados de anuncios existentes

## Estructura de endpoints

```
app/api/cron/
├── semanal/         ← REGISTRADO en vercel.json (Lunes 10am)
├── mensual/         ← REGISTRADO en vercel.json (Día 1, 11am)
├── deteccion/       ← llamado por semanal
├── legislacion/     ← llamado por semanal
├── casos/           ← llamado por semanal
├── monitoreo/       ← llamado por mensual
└── recap/           ← invocable manualmente o vía mensual
```

> Los endpoints que existían antes en `detect/` y `monitor/` se eliminaron (eran duplicados zombie).

## Variable de entorno requerida

### CRON_SECRET

Autentica las peticiones que vienen de Vercel Cron. Todos los crons validan:

```ts
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Configurar en Vercel → Project Settings → Environment Variables. Generar valor con:

```bash
openssl rand -base64 32
```

## Ejecución manual (testing / disparo ad-hoc)

```bash
# Cron semanal completo (deteccion + legislacion + casos)
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/semanal \
  -H "Authorization: Bearer $CRON_SECRET"

# Cron mensual completo (recap + monitoreo)
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/mensual \
  -H "Authorization: Bearer $CRON_SECRET"

# Sub-pasos individuales (si quieres correr solo uno)
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/deteccion -H "Authorization: Bearer $CRON_SECRET"
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/legislacion -H "Authorization: Bearer $CRON_SECRET"
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/casos -H "Authorization: Bearer $CRON_SECRET"
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/monitoreo -H "Authorization: Bearer $CRON_SECRET"
curl -X GET https://www.observatorio-ia-mexico.com/api/cron/recap -H "Authorization: Bearer $CRON_SECRET"
```

## Verificación de ejecución

### Logs en Vercel

1. Dashboard de Vercel → proyecto `observatorio-ia-mexico`
2. **Cron Jobs** tab → ver próxima ejecución y historial
3. **Logs** → filtrar por `/api/cron/`

### Logs en Firestore

Los agentes escriben en:
- `actividad` — timeline de eventos detectados
- `recapsMensuales` — recaps generados
- (potencialmente `agentLogs` si se implementa)

## Formato cron expression

```
┌───── minuto (0-59)
│ ┌─── hora (0-23)
│ │ ┌─ día del mes (1-31)
│ │ │ ┌─ mes (1-12)
│ │ │ │ ┌─ día de semana (0-6, 0=domingo)
│ │ │ │ │
* * * * *
```

Ejemplos relevantes:
- `0 10 * * 1` — Lunes 10:00 AM
- `0 11 1 * *` — Día 1 de cada mes a las 11:00 AM
- `0 */6 * * *` — Cada 6 horas

## Troubleshooting

### Cron job no se ejecuta
1. Verificar `CRON_SECRET` configurado en Vercel para production
2. Verificar `vercel.json` mergeado a la rama productiva
3. Ver Cron Jobs en dashboard de Vercel para confirmar que están registrados

### Error 401 Unauthorized
- `CRON_SECRET` no coincide entre Vercel y el código
- Header `Authorization: Bearer <secret>` mal formado

### Timeout (>300s)
- Vercel limita a 300s. Los agentes principales tienen `export const maxDuration = 300`.
- Si un agente se acerca al límite, dividir en lotes o mover a worker externo.

### El recap mensual no se generó
- Verificar que `mensual` se haya disparado el día 1 (Vercel Cron Jobs tab)
- Si falló, revisar logs de la última ejecución
- Disparo manual: `curl /api/cron/recap` (o el umbrella `mensual`) con el `CRON_SECRET`

## Costos

- Plan Pro de Vercel requerido para crons. Plan Hobby no soporta.
- Cada ejecución de los umbrellas (semanal / mensual) consume créditos de Anthropic API (Claude WebSearch).
