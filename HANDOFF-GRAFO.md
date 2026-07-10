# HANDOFF — Grafo del ecosistema (prototipo de nuevo hero)

> **De:** Itzel (Opus 4.8) · **Para:** 5.6 Sol Ultra · **Fecha:** 10-jul-2026
> **Misión:** mejorar el grafo interactivo hasta que se sienta como las referencias de Ricardo
> (InfraNodus / mapa de personajes de The Witcher): comunidades separadas por color,
> denso pero orgánico, moderno. La base funciona; falta la magia final del layout.

## Dónde vive todo

| Pieza | Ruta |
|---|---|
| Repo del sitio | `/Users/ritchie/ObervatorioMx/site` (Next.js 16 App Router + Tailwind 4) |
| **Rama** | `itzel/grafo-hero` (3 commits: `236649a`, `321f57e`, `481cd07`) |
| Página | `app/grafo/page.tsx` — overlay hero + chips de filtro (poder y estado) |
| Componente | `components/GrafoEcosistema.tsx` — render canvas, fuerzas, hover, zoom, tooltip |
| API | `app/api/grafo/route.ts` — construye nodos+aristas desde la data viva |
| Dev server | `npm run dev --prefix site` → `http://localhost:3000/grafo` (config del preview en `/Users/ritchie/ObervatorioMx/.claude/launch.json`) |
| Dependencia | `react-force-graph-2d` (^1.29.1); usa `d3-force-3d` (dep transitiva de force-graph) para `forceX/forceY/forceCollide` |

## Arquitectura de datos (API)

- Fuentes VIVAS (producción, no requieren credenciales locales):
  `/api/anuncios` (78 · Ejecutivo), `/api/iniciativas` (154 · Legislativo, clave `data`), `/api/casos-ia` (5 · Judicial).
  Localmente los endpoints propios (`localhost/api/anuncios`…) dan 500 (sin Firebase admin) — **es esperado**; `/api/grafo` fetchea PROD (`https://www.observatorio-ia-mexico.com`).
- Nodos item: `anuncio` | `iniciativa` | `caso` (con `estado`: vigente/tramite/inactivo + `nuevo`: <90 días).
- Nodos conector (hubs): `actor` (dependencia/responsable), `camara`, `tema`. Solo se materializan con grado >= 2 (`MIN_DEG`).
- Aristas `rel` (item→hub) con **`prim: true`** en la "casa" del item (anuncio→dependencia, iniciativa→tema[0] o cámara, caso→temaIA).
- Aristas `mesh` (hub↔hub) por co-ocurrencia de items, **esqueleto kNN**: cada hub conserva sus 3 más fuertes (una malla completa colapsa el layout en bola).
- Sin huérfanos (nodos grado 0 se filtran). ~268 nodos, ~471 aristas.

## Lo que ya funciona (pedidos de Ricardo cumplidos)

1. **Filtros por poder** (chips con conteo, toggle) y **por estado** (Todos/Nuevos/Vigentes/En trámite/Inactivos) — en `page.tsx`, aplicados en el memo `view` del componente.
2. **Zoom** +/−/encuadrar (`data-testid`: `zoom-in`/`zoom-out`/`zoom-fit`).
3. Hover ilumina vecindario + partículas en aristas; clic abre ficha (`/anuncio/[id]`, `/casos-ia/[id]`).
4. Jerarquía de tamaño (hubs val≤42) y labels "capitales" (Cámara de Diputados, Senado, deepfakes…).
5. Anillo pulsante = nuevo; atenuado = inactivo.

## EL PROBLEMA ABIERTO (la razón del handoff)

**El layout converge a "disco": hubs en anillo + items apozados al centro.** Ricardo quiere
comunidades separadas espacialmente (como el mapa del Witcher).

**Diagnóstico (verificado empíricamente, no especulación):** es estructural, no de parámetros.
Cada iniciativa tiene resortes a 3–4 hubs en lados opuestos del anillo (cámara + hasta 3 temas)
→ su equilibrio es el centroide → pozo central. Se intentó: gravedad global/selectiva, charge
por tipo (-7…-600), colisión on/off, distancias por grado, resorte primario fuerte + secundarios
a 0.015, malla completa vs kNN. Todas convergen a variantes del mismo disco (el `zoomToFit`
además normaliza la escala, así que capturas de configs distintas se ven casi iguales — ojo).

**Ruta v2 recomendada (no implementada):**
1. **Detección de comunidades** (Louvain/Leiden sobre el grafo de co-ocurrencia, o incluso
   los clusters naturales: tema-primario del item) — en el API, etiquetar `community` por nodo.
2. **Un pozo de gravedad por comunidad**: `forceX/forceY` hacia el centroide asignado de su
   comunidad (layout radial de centroides, p.ej. en círculo), en lugar de gravedad global a (0,0).
3. Aristas inter-comunidad se vuelven los "puentes" visibles (más largas, curvas).
4. Opcional: colorear por comunidad (hoy el color = tipo/poder; Ricardo valora ese código,
   consultarle antes de cambiarlo).

## TRAMPAS que ya me comí (no las repitas)

- **`next/dynamic` + ref fantasma con HMR:** tras un hot-reload, el ref puede quedar apuntando
  a una instancia VIEJA/vacía del force-graph (d3Force existe pero `links()` = [] y bbox null).
  Por eso se usa `bindFg` (callback ref + `fgReady`). **Siempre valida con full reload**, no HMR.
- **`zoomToFit` normaliza**: dos layouts con escalas muy distintas se ven idénticos en captura.
  Para comparar configs, mide distancias reales entre hubs (p.ej. `c:diputados` ↔ `c:senado`).
- El efecto de fuerzas debe correr DESPUÉS de que el canvas monta y con datos (deps
  `[view, fgReady]`) — si corre con ref null, no aplica nada y no truena.
- Los 500 de `/api/anuncios` locales en la consola del dev server son ruido esperado (otras
  páginas); el grafo no depende de ellos.
- El dev server puede estar ya corriendo en :3000 (preview del harness). `pkill -f "next dev"`
  si necesitas reiniciarlo.

## Contexto de producto (no perder)

- Es el candidato a **nuevo hero** del sitio (Ricardo: "el mapa vivo"). Datos 100% reales,
  cero inventados; si el cron detecta algo nuevo, aparece solo.
- Colores actuales = poder (cian Ejecutivo / azul Legislativo / violeta Judicial / verde temas).
  La leyenda y los chips dependen de ese código.
- Registro de decisiones y contexto mayor: rama `itzel/historial-login-correo` (PR #48, pendiente
  de merge: bitácora `/historial` + fix del cron consolidado cada 3 días).

¡Suerte! — I.
