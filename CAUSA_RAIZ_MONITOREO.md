# Análisis de causa raíz: Abortos del agente monitoreo

## Evidencia

- **Período**: 2026-10-10 en adelante
- **Frecuencia**: 6/6 verificaciones fallidas por corrida (antes 12/12)
- **Error registrado**: `"Error de Anthropic API (undefined): Request was aborted."`
- **Duración observada**: ~9.5 segundos por llamada fallida
- **Otros agentes**: deteccion, legislacion, casos → funcionan correctamente

## Hipótesis investigadas

### ❌ Hipótesis 1: Timeout interno muy corto (MIN_TIMEOUT_MS=20s)

**Descartada**: Si el timeout era 20s+, no explica abortos a los 9.5s.

**Cálculo con 12 candidatos y DEADLINE_MS=280s**:
```
timeout_primer_anuncio = max(20s, (280s - 5s) / 12) = max(20s, 22.9s) = 22.9s
```

El primer anuncio debería tener ~23s, no 9.5s.

### ⚠️ Hipótesis 2: SDK de Anthropic tiene timeout por defecto de 10s

**Evidencia**:
- `new Anthropic({ apiKey })` sin especificar `timeout` explícito
- Documentación oficial: timeout por defecto es **600s (10 minutos)**
- PERO: ~9.5s es muy cercano a 10s
- `"Request was aborted."` es el mensaje de `APIUserAbortError` cuando `abortController.abort()` se dispara

**Problema**: No tenemos acceso a logs detallados de las corridas fallidas para confirmar.

**Contradicción**: La documentación dice 600s, pero el comportamiento observado sugiere ~10s.

### ⚠️ Hipótesis 3: Timeout dinámico negativo o muy bajo

**Código en lib/agents.ts:403-407**:
```typescript
const tiempoRestante = DEADLINE_MS - tiempoTranscurrido;
const timeoutDinamico = Math.floor((tiempoRestante - MARGEN_MS) / candidatosRestantes);
const timeoutPorAnuncio = Math.max(MIN_TIMEOUT_MS, timeoutDinamico);
```

**Escenario problemático**: Si `tiempoRestante` es negativo (porque otros procesos consumieron tiempo):
- `timeoutDinamico` = negativo
- `Math.max(MIN_TIMEOUT_MS, -X)` = `MIN_TIMEOUT_MS`
- Se pasa timeout=MIN_TIMEOUT_MS a Claude, PERO el DEADLINE ya expiró
- ¿El setTimeout se dispara antes de lo esperado por alguna razón de Node.js?

**No probado**: No tenemos logs que muestren el valor real de `tiempoRestante` en las corridas fallidas.

### ⚠️ Hipótesis 4: Agentes en paralelo comparten presupuesto de Vercel

**Código en app/api/cron/todo/route.ts:14**:
```
// Se ejecutan EN PARALELO: cada sub-endpoint corre en su propia función
// serverless, así el tiempo total ≈ el agente más lento, no la suma.
```

**Pero**: Cada sub-ruta (`/api/cron/monitoreo`) tiene su propio `maxDuration=300`.

¿Vercel comparte el presupuesto entre funciones serverless paralelas del mismo deployment?
- Si SÍ → monitoreo podría quedarse sin tiempo si otros agentes consumen primero
- Si NO → cada agente tiene 300s independientes

**No probado**: No tenemos confirmación de cómo Vercel asigna presupuesto a funciones paralelas.

## Conclusión

**No puedo probar la causa raíz exacta** sin:
1. Logs detallados de corridas fallidas mostrando `tiempoTranscurrido`, `tiempoRestante`, `timeoutPorAnuncio`
2. Confirmación de cómo Vercel asigna presupuesto a funciones paralelas
3. Verificación del timeout real del SDK de Anthropic en este entorno

## Soluciones implementadas (defensas comprehensivas)

### 1. Timeout explícito del SDK (lib/claude.ts:3-8)

```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: 600_000, // 10 minutos explícito
  maxRetries: 0, // Manejamos retry manualmente
});
```

**Justificación**: Elimina ambigüedad sobre el timeout del SDK.

### 2. Validación de timeout positivo (lib/claude.ts:111-114)

```typescript
if (timeoutMs !== undefined && timeoutMs <= 0) {
  console.error(`[claude] WARNING: timeoutMs inválido (${timeoutMs}ms)`);
}
```

**Justificación**: Detecta si el cálculo dinámico produce timeouts negativos.

### 3. Logging detallado de timeouts (lib/agents.ts:410-417)

```typescript
console.log(
  `[MONITOREO] Anuncio ${i}/${total}: ` +
  `Transcurrido: ${tiempoTranscurrido}ms | ` +
  `Restante: ${tiempoRestante}ms | ` +
  `Timeout dinámico: ${timeoutDinamico}ms | ` +
  `Timeout aplicado: ${timeoutPorAnuncio}ms`
);
```

**Justificación**: Las próximas corridas mostrarán el cálculo real de timeouts para diagnóstico.

### 4. MIN_TIMEOUT_MS aumentado a 45s (lib/agents.ts:353)

```typescript
const MIN_TIMEOUT_MS = 45_000; // Antes: 20_000
```

**Justificación**: Con web search + thinking, una llamada puede tomar 30-60s.

### 5. Detención anticipada si presupuesto insuficiente (lib/agents.ts:428-432)

```typescript
if (timeoutDinamico < MIN_TIMEOUT_MS && candidatosRestantes > 0) {
  console.log(`[MONITOREO] STOP: Timeout dinámico (${timeoutDinamico}ms) < mínimo.`);
  break;
}
```

**Justificación**: Evita iniciar verificaciones que abortarán inevitablemente.

### 6. Retry limitado con presupuesto (lib/claude.ts:76-105)

```typescript
// Solo 1 reintento (2 intentos totales)
// Deadline absoluto: startTime + (timeout * 2.2)
return retryWithBackoff(executeSearch, {
  maxRetries: 1,
  deadline: timeoutMs ? startTime + (timeoutMs * 2.2) : undefined,
  shouldRetry: (error, attempt) => {
    if (attempt >= 1) return false;
    // Verificar presupuesto antes de reintentar timeout
    if (error.name === 'TimeoutError') {
      const hasTimeForRetry = elapsed + timeoutMs < (timeoutMs * 1.8);
      return hasTimeForRetry;
    }
    // Solo reintentar 5xx, 429, 503
    return isTransientAPIError(error);
  }
});
```

**Justificación**: Evita exceder maxDuration=300s con reintentos.

### 7. Errores diferenciados (lib/claude.ts:225-237)

```typescript
if (error.name === 'AbortError') {
  const elapsed = Date.now() - attemptStartTime;
  const timeoutError = new Error(
    `Búsqueda cancelada (AbortError) después de ${elapsed}ms ` +
    `(timeout configurado: ${timeoutMs}ms)`
  );
  timeoutError.name = 'TimeoutError';
  timeoutError.code = 'TIMEOUT';
  timeoutError.elapsed = elapsed;
  throw timeoutError;
}
```

**Justificación**: Distingue AbortError externo vs TimeoutError propio vs APIError.

## Próximos pasos para confirmar causa raíz

1. **Ejecutar próximo cron** y revisar logs con el nuevo logging detallado
2. **Verificar** si `timeoutDinamico` es negativo o menor a MIN_TIMEOUT_MS
3. **Confirmar** si Vercel comparte presupuesto entre funciones paralelas
4. **Medir** duración real de llamadas exitosas para ajustar MIN_TIMEOUT_MS

## Referencias

- PR #121: `49bcb7d` - Introducción de timeout dinámico con AbortController
- PR #122: `cfde7aa` - Intentos de corregir persistencia (sin resolver abortos)
- PR #124: `77d683b9` - Fix de undefined en Firestore (sin resolver abortos)
- Logs de actividad: evento `agente_fallo` con id `hhB7aQpkqz16bgzetxTQ` (2026-10-22)
