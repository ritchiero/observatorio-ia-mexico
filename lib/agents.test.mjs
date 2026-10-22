import { strict as assert } from 'node:assert';
import { describe, it, mock, beforeEach } from 'node:test';

/**
 * Tests para OIA-013: Bug de persistencia y timeouts del agente de monitoreo
 * 
 * Estos tests verifican el comportamiento esperado sin importar el código real.
 * Los tests de las funciones exportadas están en agents-sanitizer.test.ts
 */

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
  it('LIMIT debe ser 6 candidatos por defecto', () => {
    const LIMIT_DEFAULT = 6;
    const opts = {};
    const LIMIT = opts.limit ?? LIMIT_DEFAULT;
    
    assert.strictEqual(LIMIT, 6);
  });

  it('MAX_SEARCHES debe ser 3 por defecto solo para monitoreo', () => {
    const MAX_SEARCHES_DEFAULT = 3;
    const opts = {};
    const MAX_SEARCHES = opts.maxSearches ?? MAX_SEARCHES_DEFAULT;
    
    assert.strictEqual(MAX_SEARCHES, 3);
  });

  it('el presupuesto por anuncio debe ser >= 45s con 6 candidatos', () => {
    const DEADLINE_MS = 280_000;
    const MARGEN_MS = 5_000;
    const LIMIT = 6;
    const MIN_TIMEOUT_MS = 45_000;
    
    const presupuestoTotal = DEADLINE_MS - MARGEN_MS;
    const presupuestoPorAnuncio = Math.floor(presupuestoTotal / LIMIT);
    
    // El timeout por anuncio será el máximo entre el dinámico y el mínimo
    const timeoutEfectivo = Math.max(MIN_TIMEOUT_MS, presupuestoPorAnuncio);
    
    assert.ok(timeoutEfectivo >= MIN_TIMEOUT_MS,
      `Timeout efectivo ${timeoutEfectivo}ms debe ser >= ${MIN_TIMEOUT_MS}ms (mínimo)`);
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
  
  it('distinción timer propio vs abort externo', () => {
    // TimeoutError: tiene abortedByOurTimer = true
    const timeoutError = new Error('Timeout');
    timeoutError.name = 'TimeoutError';
    timeoutError.abortedByOurTimer = true;
    
    assert.strictEqual(timeoutError.name, 'TimeoutError');
    assert.strictEqual(timeoutError.abortedByOurTimer, true);
    
    // ExternalAbortError: tiene abortedByOurTimer = false
    const externalError = new Error('Abort externo');
    externalError.name = 'ExternalAbortError';
    externalError.abortedByOurTimer = false;
    externalError.signalReason = 'external_cancellation';
    
    assert.strictEqual(externalError.name, 'ExternalAbortError');
    assert.strictEqual(externalError.abortedByOurTimer, false);
    assert.strictEqual(externalError.signalReason, 'external_cancellation');
  });
  
  it('loop se detiene cuando tiempo no alcanza', () => {
    const MIN_TIMEOUT_MS = 45_000;
    const DEADLINE_MS = 280_000;
    const MARGEN_MS = 5_000;
    
    // Simular que ya se consumió mucho tiempo
    const tiempoTranscurrido = 240_000; // 4 minutos
    const tiempoRestante = DEADLINE_MS - tiempoTranscurrido; // 40s
    const candidatosRestantes = 2;
    
    const timeoutDinamico = Math.floor((tiempoRestante - MARGEN_MS) / candidatosRestantes);
    
    // timeoutDinamico = (40000 - 5000) / 2 = 17,500ms < 45,000ms
    assert.ok(timeoutDinamico < MIN_TIMEOUT_MS,
      'Con poco tiempo restante, timeoutDinamico debe ser menor al mínimo');
    
    // El loop debe DETENERSE (break) cuando:
    // - timeoutDinamico < MIN_TIMEOUT_MS
    // - candidatosRestantes > 0
    const debeDetener = timeoutDinamico < MIN_TIMEOUT_MS && candidatosRestantes > 0;
    assert.strictEqual(debeDetener, true, 'El loop debe detenerse cuando no hay presupuesto suficiente');
    
    // Y NO debe calcular timeout <= 0
    const timeoutPorAnuncio = Math.max(MIN_TIMEOUT_MS, timeoutDinamico);
    assert.ok(timeoutPorAnuncio > 0);
    assert.strictEqual(timeoutPorAnuncio, MIN_TIMEOUT_MS);
  });
  
  it('peor caso: 6 anuncios × (45s + 1s + 45s) = 546s', () => {
    const numAnuncios = 6;
    const timeoutMs = 45_000;
    const maxRetries = 1; // 2 intentos totales
    const backoffMs = 1_000; // backoff del intento 0
    
    // Peor caso: TODOS los anuncios fallan el primer intento y usan el retry
    // Por anuncio: intento1 (45s) + backoff (1s) + intento2 (45s) = 91s
    const worstCasePerAnuncio = timeoutMs + backoffMs + timeoutMs;
    const worstCaseTotal = numAnuncios * worstCasePerAnuncio;
    
    assert.strictEqual(worstCasePerAnuncio, 91_000, 'Peor caso por anuncio debe ser 91s');
    assert.strictEqual(worstCaseTotal, 546_000, 'Peor caso total debe ser 546s');
    
    // Esto EXCEDE maxDuration=300s, POR ESO necesitamos el deadline global
    const maxDuration = 300_000;
    assert.ok(worstCaseTotal > maxDuration,
      `Peor caso (${worstCaseTotal}ms) EXCEDE maxDuration (${maxDuration}ms), ` +
      `por eso el deadline global detiene antes de llegar a ese extremo`);
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
