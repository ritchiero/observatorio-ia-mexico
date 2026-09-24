# Recibo de migración — Itzel · Observatorio IA México

Cierre: 2026-09-24T00:25:56-06:00 (America/Mexico_City)

## Identidad
Agente: **Itzel · Observatorio IA México**. Continuidad Codex → Itzel. Actualizar código ≠ datos vigentes.

## Estado operativo (cierre)
**La migración NO se declara operativa completa.**

| Área | Estado | Evidencia / nota |
|---|---|---|
| Recepción de paquete | Hecho | Workspace + LEEME + tar en disco |
| GitHub lectura | Probado | `origin/master` = `84eb95503c46f5f5ec8042c93f5eba063b7b6028` |
| GitHub escritura (rama de migración) | Probado | Push a `chore/itzel-migracion-recibo-20260924`; **verificado por Codex vía gh API** (no confirmación directa de Ricardo) |
| Lectura pública del sitio | Probada / habilitada | Investigación pública sigue activa aunque falte escritura |
| Deploy desde Itzel | **No probado** | Bloqueo / pendiente |
| Escritura de contenido (Firebase acotado) | **Pendiente** | Sin credencial de escritura; no impide investigar ni preparar lotes con fuentes |
| Credenciales nuevas / ampliación de permisos | **No creadas ni transferidas** | Esperando aprobación que Ricardo presentará (contenido acotado + permisos Vercel del proyecto) |

## Qué sí puede hacerse ya
- Investigar fuentes oficiales y APIs públicas.
- Preparar lotes de correcciones factuales con fuentes, sin publicar.
- Usar GitHub en la rama de migración para documentación/evidencia (no master).
- Mantener rutinas diarias/semanales en **America/Mexico_City** listas para cuando haya acceso + escritor único.

## Qué no se hará hasta confirmación de Ricardo
- Crear o transferir credenciales nuevas.
- Ampliar permisos Vercel/Firebase.
- Tratar `ADMIN_KEY` o service account amplia como acceso de contenido acotado.
- Declarar migración operativa completa.
- Deploy de producción desde Itzel sin prueba previa acordada.

## Accesos (detalle)
1. **GitHub escritura en rama de migración — PROBADA**  
   - Rama: [chore/itzel-migracion-recibo-20260924](https://github.com/ritchiero/observatorio-ia-mexico/tree/chore/itzel-migracion-recibo-20260924)  
   - Commit de prueba de escritura: [78e6d5f](https://github.com/ritchiero/observatorio-ia-mexico/commit/78e6d5f879b328b552f6f624623aace0e6efd73c) → [`docs/itzel-migracion-recibo.md`](https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-migracion-recibo.md)  
   - Tip actual de la rama: [248b155](https://github.com/ritchiero/observatorio-ia-mexico/commit/248b155da46bf2e68702f6ab965aefd974aa0852)  
   - Verificación: **Codex vía gh API** (no confirmación directa de Ricardo). Master intacto (`84eb955`).

2. **Sitio público — lectura EJECUTADA y habilitada**  
   Base: https://www.observatorio-ia-mexico.com  
```
/ 200 75002
/api/actividad 200 92086
/api/anuncios 200 201969
/api/iniciativas 200 708243
/api/casos-ia 200 31711
```
   Falta de credencial de escritura **no** bloquea investigación ni preparación de lotes con fuentes.

3. **Vercel** — identidad/proyecto alineados con LEEME en lecturas MCP; “Added” ≠ auth completa de todos los scopes. **Deploy no probado.** Permisos de proyecto: pendientes de la aprobación que Ricardo presentará.

4. **Firebase / contenido acotado** — escritura **pendiente**. Propuesta documentada en la matriz (`CONTENT_OPS_TOKEN` + allowlist; excluye suscriptores/auth/IAM). **Sin crear ni transferir secretos** hasta confirmación.

## Modelos
- Runtime producción = env Vercel (nombres: `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `OPENROUTER_API_KEY`, etc.).
- Caja Itzel: Anthropic ausente; OpenRouter presente y no invocado como prueba.
- No duplicar secretos en Itzel si la publicación va por API segura en Vercel.

## Rutinas (mismas dos; zona confirmada)
| Nombre | Folder | Horario | Zona |
|---|---|---|---|
| Observatorio · lectura diaria | `observatorio-lectura-diaria` | 08:00 diario | **America/Mexico_City** |
| Observatorio · auditoría documental semanal | `observatorio-auditor-a-documental-semanal` | lunes 09:00 | **America/Mexico_City** |

Prompt: investigar y preparar lotes siempre; aplicar correcciones + código + CI/deploy/verificación solo cuando acceso y escritor único estén resueltos. Scheduler: aún sin primer fire automático; lectura de prueba manual ya ejecutada.

## Crons Vercel (intactos; no desactivados)
- `/api/cron/todo` y cron mensual según `vercel.json` del snapshot — sin tocar hasta prueba de reemplazo.

## Enlaces verificables
- Rama: https://github.com/ritchiero/observatorio-ia-mexico/tree/chore/itzel-migracion-recibo-20260924
- Recibo (este archivo): https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-recibo-migracion.md
- Matriz de accesos: https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-matriz-accesos.md
- Prueba de escritura: https://github.com/ritchiero/observatorio-ia-mexico/blob/chore/itzel-migracion-recibo-20260924/docs/itzel-migracion-recibo.md
- Commit escritura: https://github.com/ritchiero/observatorio-ia-mexico/commit/78e6d5f879b328b552f6f624623aace0e6efd73c
- Tip rama: https://github.com/ritchiero/observatorio-ia-mexico/commit/248b155da46bf2e68702f6ab965aefd974aa0852
- Sitio: https://www.observatorio-ia-mexico.com

## Pedido en curso (Ricardo presentará)
Aprobación concreta de: (1) acceso de contenido acotado, (2) permisos Vercel del proyecto. Itzel no crea ni amplía nada hasta esa confirmación.
