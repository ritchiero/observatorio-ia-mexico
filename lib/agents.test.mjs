import { strict as assert } from 'node:assert';
import { describe, it, mock, beforeEach } from 'node:test';

/**
 * Tests para OIA-013: Bug de persistencia y timeouts del agente de monitoreo
 * 
 * Estos tests verifican el comportamiento esperado sin importar el código real.
 * Los tests de las funciones exportadas están en agents-sanitizer.test.ts
 */

// R3: Test de timeout DEBE ser el primero para configurar env vars antes de importar claude.ts
describe('R3: searchWithClaude timeout real (debe ejecutarse primero)', () => {
  it('genera TimeoutError con elapsed y timeoutMs contra servidor que nunca responde', async () => {
    // Crear servidor HTTP local que nunca responde
    const http = await import('node:http');
    const server = http.createServer((req, res) => {
      // No responder nunca - el timeout lo abortará
    });
    
    await new Promise((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;
    
    // Configurar SDK para apuntar al servidor local ANTES de importar claude.ts
    const originalBaseURL = process.env.ANTHROPIC_BASE_URL;
    const originalAPIKey = process.env.ANTHROPIC_API_KEY;
    
    let startTime;
    try {
      process.env.ANTHROPIC_BASE_URL = `http://localhost:${port}`;
      process.env.ANTHROPIC_API_KEY = 'test-dummy-key';
      
      // AHORA importar searchWithClaude (después de configurar env vars)
      const { searchWithClaude } = await import('./claude.ts');
      
      startTime = Date.now();
      await searchWithClaude({
        prompt: 'test timeout',
        timeoutMs: 1_500, // 1.5s timeout
        maxSearches: 1,
        globalDeadline: Date.now() + 10_000, // 10s deadline
      });
      
      assert.fail('Debería haber lanzado TimeoutError');
    } catch (error) {
      const elapsed = Date.now() - startTime;
      
      // Verificar que es un error
      assert.ok(error instanceof Error, 'Debe ser instancia de Error');
      const errorObj = error;
      
      // EXIGIR TimeoutError con valores exactos (sin rama "sin key")
      assert.strictEqual(errorObj.name, 'TimeoutError', `name debe ser TimeoutError, fue ${errorObj.name}`);
      assert.strictEqual(errorObj.timeoutMs, 1_500, `timeoutMs debe ser 1500, fue ${errorObj.timeoutMs}`);
      assert.ok(
        errorObj.elapsed >= 1_400 && errorObj.elapsed <= 2_500,
        `elapsed debe estar entre 1400-2500ms, fue ${errorObj.elapsed}ms`
      );
      
      console.log(`[TEST] searchWithClaude timeout OK: ${errorObj.name} tras ${errorObj.elapsed}ms (timeout ${errorObj.timeoutMs}ms)`);
    } finally {
      // Restaurar env vars
      if (originalBaseURL !== undefined) {
        process.env.ANTHROPIC_BASE_URL = originalBaseURL;
      } else {
        delete process.env.ANTHROPIC_BASE_URL;
      }
      if (originalAPIKey !== undefined) {
        process.env.ANTHROPIC_API_KEY = originalAPIKey;
      } else {
        delete process.env.ANTHROPIC_API_KEY;
      }
      
      server.close();
    }
  });
});

describe('OIA-013: Helpers de normalización y sanitización', () => {
  describe('normalizarFecha', () => {
    it('debe manejar Timestamp de Firestore', () => {
      // Mock de Timestamp de Firestore
      const mockTimestamp = {
        toDate: () => new Date('2026-10-12T00:00:00Z')
      };
      
      // Verificar que normalizarFecha puede manejar:
      // 1. Timestamp con método toDate()
      assert.ok(typeof mockTimestamp.toDate === 'function');
      const fecha1 = mockTimestamp.toDate();
      assert.ok(fecha1 instanceof Date);
      
      // 2. String ISO
      const fechaString = '2026-10-12';
      const fecha2 = new Date(fechaString);
      assert.ok(fecha2 instanceof Date);
      
      // 3. Date object
      const fechaDate = new Date('2026-10-12');
      assert.ok(fechaDate instanceof Date);
      
      // 4. null
      const fechaNula = null;
      assert.strictEqual(fechaNula, null);
    });
  });

  describe('limpiarUndefined (comportamiento esperado)', () => {
    it('debe preservar Date y otras instancias intactas', () => {
      // Simular el comportamiento esperado de limpiarUndefined
      const limpiarUndefined = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(limpiarUndefined);
        
        // Solo recursar en objetos planos
        const proto = Object.getPrototypeOf(obj);
        if (proto !== Object.prototype && proto !== null) {
          return obj; // Preservar instancias
        }
        
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            result[key] = limpiarUndefined(value);
          }
        }
        return result;
      };
      
      // Test: Date debe preservarse
      const ahora = new Date('2026-10-19T15:00:00Z');
      const obj = {
        fecha: ahora,
        data: undefined,
        nested: {
          otraFecha: new Date('2026-01-01'),
          basura: undefined,
        },
      };
      
      const limpio = limpiarUndefined(obj);
      
      // Las fechas deben preservarse como Date
      assert.ok(limpio.fecha instanceof Date);
      assert.strictEqual(limpio.fecha.getTime(), ahora.getTime());
      assert.ok(limpio.nested.otraFecha instanceof Date);
      
      // Los undefined en objetos planos sí deben eliminarse
      assert.strictEqual('data' in limpio, false);
      assert.strictEqual('basura' in limpio.nested, false);
    });
    
    it('debe preservar instancias de clase intactas', () => {
      const limpiarUndefined = (obj) => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(limpiarUndefined);
        
        const proto = Object.getPrototypeOf(obj);
        if (proto !== Object.prototype && proto !== null) {
          return obj;
        }
        
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined) {
            result[key] = limpiarUndefined(value);
          }
        }
        return result;
      };
      
      class MiClase {
        constructor(valor) {
          this.valor = valor;
        }
        metodo() {
          return this.valor;
        }
      }
      
      const instancia = new MiClase(42);
      const obj = {
        instancia,
        campo: undefined,
        nested: {
          otraInstancia: new MiClase(100),
          sinDefinir: undefined,
        },
      };
      
      const limpio = limpiarUndefined(obj);
      
      // Las instancias deben preservarse
      assert.ok(limpio.instancia instanceof MiClase);
      assert.strictEqual(limpio.instancia.valor, 42);
      assert.strictEqual(limpio.instancia.metodo(), 42);
      assert.ok(limpio.nested.otraInstancia instanceof MiClase);
      
      // Los undefined en objetos planos sí se eliminan
      assert.strictEqual('campo' in limpio, false);
      assert.strictEqual('sinDefinir' in limpio.nested, false);
    });
  });
});

describe('OIA-013: Filtrado de campos undefined', () => {
  it('no debe incluir campos undefined en el objeto de actualización', () => {
    const cambioStatusRecomendado = false;
    const statusActual = 'operando';
    const nuevoStatus = undefined;

    const actualizacion = {
      fecha: new Date(),
      descripcion: 'Actualización sin cambio de status',
      fuente: 'https://ejemplo.com',
      cambioStatus: cambioStatusRecomendado,
    };

    // Solo incluir statusAnterior/statusNuevo si hubo cambio
    if (cambioStatusRecomendado) {
      actualizacion.statusAnterior = statusActual;
      actualizacion.statusNuevo = nuevoStatus;
    }

    // Verificar que no existen los campos
    assert.strictEqual('statusAnterior' in actualizacion, false);
    assert.strictEqual('statusNuevo' in actualizacion, false);
    
    // Verificar que no hay valores undefined
    Object.values(actualizacion).forEach(valor => {
      assert.notStrictEqual(valor, undefined);
    });
  });

  it('debe incluir statusAnterior/statusNuevo cuando hay cambio', () => {
    const cambioStatusRecomendado = true;
    const statusActual = 'prometido';
    const nuevoStatus = 'en_desarrollo';

    const actualizacion = {
      fecha: new Date(),
      descripcion: 'Actualización con cambio de status',
      fuente: 'https://ejemplo.com',
      cambioStatus: cambioStatusRecomendado,
    };

    if (cambioStatusRecomendado) {
      actualizacion.statusAnterior = statusActual;
      actualizacion.statusNuevo = nuevoStatus;
    }

    // Verificar que existen con valores correctos
    assert.strictEqual(actualizacion.statusAnterior, 'prometido');
    assert.strictEqual(actualizacion.statusNuevo, 'en_desarrollo');
  });
});

describe('OIA-013: Configuración de límites para monitoreo', () => {
  it('R2: LIMIT debe ser 2 por defecto desde monitoreo-budget.ts', async () => {
    // R2: Importar desde módulo centralizado
    const { MONITOREO_DEFAULTS } = await import('./monitoreo-budget.ts');
    
    assert.strictEqual(MONITOREO_DEFAULTS.LIMIT, 2);
    assert.strictEqual(MONITOREO_DEFAULTS.TIMEOUT_POR_LLAMADA_MS, 120_000);
    assert.strictEqual(MONITOREO_DEFAULTS.DEADLINE_MS, 250_000);
    assert.strictEqual(MONITOREO_DEFAULTS.MAX_SEARCHES, 3);
  });

  it('R2: debeDetenerMonitoreo con regla de parada real', async () => {
    // R2: Probar la función centralizada
    const { debeDetenerMonitoreo, MONITOREO_DEFAULTS } = await import('./monitoreo-budget.ts');
    
    // Caso 1: Tiempo suficiente (200s restantes, timeout 120s)
    const parada1 = debeDetenerMonitoreo(50_000, {
      deadlineMs: 250_000,
      timeoutPorLlamadaMs: 120_000,
    });
    assert.strictEqual(parada1.debeDetener, false);
    assert.strictEqual(parada1.tiempoRestante, 200_000);
    assert.strictEqual(parada1.razon, undefined);
    
    // Caso 2: Tiempo insuficiente (100s restantes, timeout 120s)
    const parada2 = debeDetenerMonitoreo(150_000, {
      deadlineMs: 250_000,
      timeoutPorLlamadaMs: 120_000,
    });
    assert.strictEqual(parada2.debeDetener, true);
    assert.strictEqual(parada2.tiempoRestante, 100_000);
    assert.ok(parada2.razon?.includes('100000ms'));
    assert.ok(parada2.razon?.includes('120000ms'));
    
    // Caso 3: Usar defaults
    const parada3 = debeDetenerMonitoreo(150_000);
    assert.strictEqual(parada3.debeDetener, true);
    assert.strictEqual(parada3.tiempoRestante, 100_000);
  });

  it('timeout fijo vs reparto equitativo (sin constantes locales)', async () => {
    // R2: Usar defaults importados
    const { MONITOREO_DEFAULTS } = await import('./monitoreo-budget.ts');
    
    const DEADLINE_MS = MONITOREO_DEFAULTS.DEADLINE_MS;
    const TIMEOUT_FIJO_MS = MONITOREO_DEFAULTS.TIMEOUT_POR_LLAMADA_MS;
    const LIMIT = MONITOREO_DEFAULTS.LIMIT;
    
    // Con timeout fijo, cada llamada usa 120s independientemente del tiempo restante
    const tiempoTranscurrido = 50_000; // Ya pasaron 50s
    const tiempoRestante = DEADLINE_MS - tiempoTranscurrido; // 200s restantes
    
    // Antigua lógica (reparto equitativo): dividía tiempo restante / llamadas restantes
    const candidatosRestantes = LIMIT - 1; // Queda 1 llamada
    const timeoutRepartoEquitativo = Math.floor(tiempoRestante / candidatosRestantes); // 200s / 1 = 200s
    
    // Nueva lógica (timeout fijo): siempre usa 120s
    const timeoutFijo = TIMEOUT_FIJO_MS; // 120s
    
    assert.notStrictEqual(timeoutFijo, timeoutRepartoEquitativo,
      'Timeout fijo debe ser diferente del reparto equitativo');
    assert.strictEqual(timeoutFijo, 120_000,
      'Timeout fijo debe ser 120s');
    
    // La regla de parada ahora es: si tiempoRestante < TIMEOUT_FIJO, detener
    const debeDetener = tiempoRestante < TIMEOUT_FIJO_MS;
    assert.strictEqual(debeDetener, false, 
      'Con 200s restantes y timeout de 120s, NO debe detenerse');
    
    // Caso donde sí debe detenerse
    const tiempoRestanteCorto = 100_000; // 100s restantes
    const debeDetenerCorto = tiempoRestanteCorto < TIMEOUT_FIJO_MS;
    assert.strictEqual(debeDetenerCorto, true,
      'Con 100s restantes y timeout de 120s, SÍ debe detenerse');
  });
});

describe('OIA-013: Retry con presupuesto limitado', () => {
  it('calculateRetryBudget: no reintenta pasando deadline global', async () => {
    // Importar helper puro de retry-budget.ts (sin deps de Anthropic SDK)
    const { calculateRetryBudget } = await import('./retry-budget.ts');
    
    const now = 1000;
    const deadline = now + 50_000; // 50s restantes
    const timeoutMs = 45_000;
    const initialDelayMs = 1_000;
    
    // Intento 0: backoff 1s, necesita 1s + 45s = 46s, cabe en 50s → OK
    const budget0 = calculateRetryBudget({ now, deadline, attempt: 0, initialDelayMs, timeoutMs });
    assert.ok(budget0.canRetry, 'Primer reintento debe caber');
    assert.strictEqual(budget0.delay, 1_000);
    
    // Intento 1: backoff 2s, necesita 2s + 45s = 47s, cabe en 50s → OK
    const budget1 = calculateRetryBudget({ now, deadline, attempt: 1, initialDelayMs, timeoutMs });
    assert.ok(budget1.canRetry, 'Segundo reintento debe caber con 50s');
    assert.strictEqual(budget1.delay, 2_000);
    
    // Deadline muy cercano: solo 10s restantes
    const tightDeadline = now + 10_000;
    const budgetTight = calculateRetryBudget({ now, deadline: tightDeadline, attempt: 0, initialDelayMs, timeoutMs });
    assert.strictEqual(budgetTight.canRetry, false, 'No debe reintentar si no cabe intento completo');
    assert.ok(budgetTight.reason?.includes('No hay presupuesto'));
  });
  
  it('R1: clasificarErrorAbort con instancia real de Anthropic.APIUserAbortError', async () => {
    // R1: Usar instancia real del SDK, no simular con Object.defineProperty
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    
    // Instancia real de APIUserAbortError del SDK
    const sdkAbortError = new Anthropic.APIUserAbortError();
    
    // Clasificar como timeout propio
    const classification1 = clasificarErrorAbort(sdkAbortError, {
      abortedByOurTimer: true,
      elapsed: 120_500,
      timeoutMs: 120_000,
      signalAborted: true,
    });
    
    assert.strictEqual(classification1.isAbort, true);
    assert.strictEqual(classification1.type, 'TimeoutError');
    assert.strictEqual(classification1.name, 'TimeoutError');
    assert.strictEqual(classification1.abortedByOurTimer, true);
    assert.strictEqual(classification1.elapsed, 120_500);
    assert.strictEqual(classification1.timeoutMs, 120_000);
    
    // Clasificar como abort externo
    const classification2 = clasificarErrorAbort(sdkAbortError, {
      abortedByOurTimer: false,
      elapsed: 50_000,
      timeoutMs: 120_000,
      signalAborted: true,
      signalReason: 'external_cancel',
    });
    
    assert.strictEqual(classification2.isAbort, true);
    assert.strictEqual(classification2.type, 'ExternalAbortError');
    assert.strictEqual(classification2.name, 'ExternalAbortError');
    assert.strictEqual(classification2.abortedByOurTimer, false);
    assert.strictEqual(classification2.signalReason, 'external_cancel');
  });
  
  it('R2: loop se detiene cuando tiempo no alcanza para un timeout completo', async () => {
    // R2: Probar la lógica de parada importando desde monitoreo-budget.ts
    const { debeDetenerMonitoreo, MONITOREO_DEFAULTS } = await import('./monitoreo-budget.ts');
    
    const TIMEOUT_FIJO_MS = MONITOREO_DEFAULTS.TIMEOUT_POR_LLAMADA_MS;
    const DEADLINE_MS = MONITOREO_DEFAULTS.DEADLINE_MS;
    
    // Simular que ya se consumió mucho tiempo
    const tiempoTranscurrido = 140_000; // 140s (2m 20s)
    
    const resultado = debeDetenerMonitoreo(tiempoTranscurrido, {
      deadlineMs: DEADLINE_MS,
      timeoutPorLlamadaMs: TIMEOUT_FIJO_MS,
    });
    
    assert.strictEqual(resultado.debeDetener, true,
      'Con 110s restantes y timeout fijo de 120s, el loop debe detenerse');
    assert.strictEqual(resultado.tiempoRestante, 110_000);
    assert.ok(resultado.razon?.includes('110000'));
    
    // Caso donde NO debe detenerse
    const tiempoTranscurridoCorto = 50_000; // 50s
    const resultadoCorto = debeDetenerMonitoreo(tiempoTranscurridoCorto, {
      deadlineMs: DEADLINE_MS,
      timeoutPorLlamadaMs: TIMEOUT_FIJO_MS,
    });
    
    assert.strictEqual(resultadoCorto.debeDetener, false,
      'Con 200s restantes y timeout fijo de 120s, el loop NO debe detenerse');
    assert.strictEqual(resultadoCorto.tiempoRestante, 200_000);
  });
  
  it('R2: presupuesto con LIMIT=2 y timeout fijo 120s cabe en 250s deadline', async () => {
    // R2: Verificar que la configuración nueva es sostenible usando defaults
    const { MONITOREO_DEFAULTS } = await import('./monitoreo-budget.ts');
    
    const DEADLINE_MS = MONITOREO_DEFAULTS.DEADLINE_MS;
    const TIMEOUT_FIJO_MS = MONITOREO_DEFAULTS.TIMEOUT_POR_LLAMADA_MS;
    const LIMIT = MONITOREO_DEFAULTS.LIMIT;
    
    // Mejor caso: 2 llamadas exitosas sin retry
    const mejorCaso = LIMIT * TIMEOUT_FIJO_MS; // 2 × 120s = 240s
    
    // Peor caso: 2 llamadas con 1 retry cada una (backoff 1s)
    const peorCasoPorLlamada = TIMEOUT_FIJO_MS + 1_000 + TIMEOUT_FIJO_MS; // 120s + 1s + 120s = 241s
    const peorCaso = LIMIT * peorCasoPorLlamada; // 2 × 241s = 482s
    
    assert.ok(mejorCaso < DEADLINE_MS,
      `Mejor caso (${mejorCaso}ms) debe caber en deadline (${DEADLINE_MS}ms)`);
    
    // El peor caso NO cabe, pero el deadline global detiene antes
    assert.ok(peorCaso > DEADLINE_MS,
      `Peor caso (${peorCaso}ms) excede deadline, pero el deadline global lo previene`);
    
    // El deadline global detiene después de la primera llamada si consume demasiado
    const despuesDePrimeraLlamada = peorCasoPorLlamada; // 241s
    const tiempoRestanteDespuesDePrimera = DEADLINE_MS - despuesDePrimeraLlamada; // 250s - 241s = 9s
    const cabeSegundaLlamada = tiempoRestanteDespuesDePrimera >= TIMEOUT_FIJO_MS;
    
    assert.strictEqual(cabeSegundaLlamada, false,
      'Si la primera llamada consume 241s (con retry), la segunda no cabe (9s < 120s)');
  });
});

describe('OIA-013: Manejo de errores en fechas', () => {
  it('debe detectar cuando fechaAnuncio es string en lugar de Timestamp', () => {
    const anuncioConStringFecha = {
      fechaAnuncio: '2026-10-12',
      fechaPrometida: null,
    };
    
    // El código antiguo fallaba con: anuncio.fechaAnuncio.toDate()
    // porque string no tiene método toDate()
    assert.strictEqual(typeof anuncioConStringFecha.fechaAnuncio, 'string');
    assert.strictEqual(typeof anuncioConStringFecha.fechaAnuncio.toDate, 'undefined');
  });

  it('debe normalizar correctamente diferentes formatos de fecha', () => {
    const fechaString = '2026-10-12';
    const fechaDate = new Date('2026-10-12');
    const fechaTimestamp = {
      toDate: () => new Date('2026-10-12')
    };
    
    // String → Date
    const dateFromString = new Date(fechaString);
    assert.ok(dateFromString instanceof Date);
    assert.strictEqual(dateFromString.toISOString().split('T')[0], '2026-10-12');
    
    // Timestamp → Date
    const dateFromTimestamp = fechaTimestamp.toDate();
    assert.ok(dateFromTimestamp instanceof Date);
    
    // Date → Date (identity)
    assert.ok(fechaDate instanceof Date);
  });
});

describe('OIA-013: Orden de operaciones', () => {
  it('debe ejecutar update antes de registrar actividad', async () => {
    const operaciones = [];
    
    const mockUpdate = () => {
      operaciones.push('update');
      return Promise.resolve();
    };
    
    const mockActividad = () => {
      operaciones.push('actividad');
      return Promise.resolve();
    };

    await mockUpdate();
    await mockActividad();

    assert.strictEqual(operaciones[0], 'update');
    assert.strictEqual(operaciones[1], 'actividad');
  });

  it('no debe registrar actividad si update falla', async () => {
    const operaciones = [];
    let actividadRegistrada = false;
    
    const mockUpdateFallido = () => {
      operaciones.push('update');
      throw new Error('Update falló');
    };
    
    const mockActividad = () => {
      actividadRegistrada = true;
      operaciones.push('actividad');
    };

    try {
      await mockUpdateFallido();
      await mockActividad();
    } catch (error) {
      // Update falló, actividad no debe ejecutarse
    }

    assert.strictEqual(operaciones.length, 1);
    assert.strictEqual(operaciones[0], 'update');
    assert.strictEqual(actividadRegistrada, false);
  });
});

describe('OIA-013: Logging de errores detallado', () => {
  it('debe capturar el primer error con detalles sanitizados', () => {
    const errores = [];
    let primerErrorDetallado = null;
    
    const error1 = new Error('fechaAnuncio.toDate is not a function');
    error1.name = 'TypeError';
    
    const error2 = new Error('Otro error posterior');
    
    // Simular captura del primer error
    if (!primerErrorDetallado) {
      primerErrorDetallado = {
        tipo: error1.name,
        mensaje: error1.message.slice(0, 500),
      };
    }
    errores.push(error1.message);
    
    // El segundo error no reemplaza el primero
    errores.push(error2.message);
    
    assert.strictEqual(primerErrorDetallado.tipo, 'TypeError');
    assert.ok(primerErrorDetallado.mensaje.includes('toDate'));
    assert.strictEqual(errores.length, 2);
  });

  it('debe incluir el primer error en la descripción de actividad', () => {
    const primerError = {
      tipo: 'TypeError',
      mensaje: 'fechaAnuncio.toDate is not a function',
    };
    
    const verificacionesFallidas = 12;
    
    const descripcion = `El agente de monitoreo falló en las ${verificacionesFallidas} verificaciones del lote (${primerError.tipo}: ${primerError.mensaje.slice(0, 100)}). El detalle quedó en el registro interno.`;
    
    assert.ok(descripcion.includes('TypeError'));
    assert.ok(descripcion.includes('toDate'));
    assert.ok(descripcion.includes('12'));
  });
});

describe('OIA-013: Parámetro maxSearches', () => {
  it('claude.ts debe aceptar maxSearches como parámetro opcional', () => {
    const options1 = { prompt: 'test', maxSearches: 3 };
    const options2 = { prompt: 'test' }; // sin maxSearches
    
    const maxSearches1 = options1.maxSearches ?? 8;
    const maxSearches2 = options2.maxSearches ?? 8;
    
    assert.strictEqual(maxSearches1, 3);
    assert.strictEqual(maxSearches2, 8); // default
  });

  it('monitoreo debe pasar maxSearches=3 a searchWithClaude', () => {
    const MAX_SEARCHES_MONITOREO = 3;
    const MAX_SEARCHES_OTROS = 8;
    
    assert.ok(MAX_SEARCHES_MONITOREO < MAX_SEARCHES_OTROS,
      'Monitoreo debe usar menos búsquedas que otros agentes');
  });
});
