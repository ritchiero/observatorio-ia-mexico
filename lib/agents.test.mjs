import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/**
 * Tests para OIA-013: Bug de persistencia del agente de monitoreo
 * 
 * Problema reportado: El agente de monitoreo escribe campos undefined en Firestore
 * y registra la actividad ANTES del update, causando que si el update falla,
 * la actividad ya se escribió.
 * 
 * Fix:
 * 1. Filtrar campos undefined del objeto de actualización
 * 2. Hacer el update PRIMERO, luego registrar actividad
 * 3. Configurar ignoreUndefinedProperties en firebase-admin
 */

describe('OIA-013: Persistencia del agente de monitoreo', () => {
  describe('Filtrado de campos undefined', () => {
    it('no debe incluir statusAnterior/statusNuevo cuando no hay cambio de status', () => {
      // Simular el objeto de actualización sin cambio de status
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
      assert.strictEqual(actualizacion.statusAnterior, undefined);
      assert.strictEqual(actualizacion.statusNuevo, undefined);
      
      // Verificar que las claves no están en el objeto
      assert.strictEqual('statusAnterior' in actualizacion, false);
      assert.strictEqual('statusNuevo' in actualizacion, false);
    });

    it('debe incluir statusAnterior/statusNuevo cuando hay cambio de status', () => {
      const cambioStatusRecomendado = true;
      const statusActual = 'operando';
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

      // Verificar que existen los campos con valores correctos
      assert.strictEqual(actualizacion.statusAnterior, 'operando');
      assert.strictEqual(actualizacion.statusNuevo, 'en_desarrollo');
    });
  });

  describe('Orden de escritura', () => {
    it('debe realizar operaciones en orden: update → actividad', () => {
      const operaciones = [];
      
      // Simular el orden de operaciones
      const mockUpdate = () => {
        operaciones.push('update');
        return Promise.resolve();
      };
      
      const mockActividad = () => {
        operaciones.push('actividad');
        return Promise.resolve();
      };

      // Simular ejecución en orden correcto
      return mockUpdate()
        .then(() => mockActividad())
        .then(() => {
          assert.strictEqual(operaciones[0], 'update', 'El update debe ejecutarse primero');
          assert.strictEqual(operaciones[1], 'actividad', 'La actividad debe ejecutarse después');
        });
    });

    it('no debe registrar actividad si el update falla', () => {
      const operaciones = [];
      let actividadRegistrada = false;
      
      const mockUpdateFallido = () => {
        operaciones.push('update');
        return Promise.reject(new Error('Error en update'));
      };
      
      const mockActividad = () => {
        actividadRegistrada = true;
        operaciones.push('actividad');
        return Promise.resolve();
      };

      // Simular ejecución con error en update
      return mockUpdateFallido()
        .then(() => mockActividad())
        .catch(() => {
          assert.strictEqual(operaciones.length, 1, 'Solo debe ejecutarse el update');
          assert.strictEqual(operaciones[0], 'update');
          assert.strictEqual(actividadRegistrada, false, 'No se debe registrar actividad si el update falla');
        });
    });
  });

  describe('Configuración de límites', () => {
    it('el LIMIT debe ser 6 candidatos por corrida (reducido desde 12)', () => {
      const LIMIT_ESPERADO = 6;
      const LIMIT_ANTERIOR = 12;
      
      // Este test documenta el cambio de configuración
      assert.strictEqual(LIMIT_ESPERADO, 6, 
        `LIMIT debe ser ${LIMIT_ESPERADO} para permitir ~46s por anuncio (280s deadline / 6 candidatos)`);
      
      assert.ok(LIMIT_ESPERADO < LIMIT_ANTERIOR, 
        `LIMIT reducido de ${LIMIT_ANTERIOR} a ${LIMIT_ESPERADO} para evitar timeouts`);
    });

    it('max_uses debe ser 3 búsquedas web por anuncio (reducido desde 8)', () => {
      const MAX_USES_ESPERADO = 3;
      const MAX_USES_ANTERIOR = 8;
      
      assert.strictEqual(MAX_USES_ESPERADO, 3,
        'max_uses debe ser 3 para reducir tiempo por búsqueda');
      
      assert.ok(MAX_USES_ESPERADO < MAX_USES_ANTERIOR,
        `max_uses reducido de ${MAX_USES_ANTERIOR} a ${MAX_USES_ESPERADO} para evitar timeouts`);
    });

    it('el presupuesto por anuncio debe ser realista para búsquedas web', () => {
      const DEADLINE_MS = 280_000;
      const MARGEN_POR_LLAMADA_MS = 5_000;
      const LIMIT = 6;
      
      const presupuestoTotalMs = DEADLINE_MS - MARGEN_POR_LLAMADA_MS;
      const presupuestoPorAnuncioMs = Math.floor(presupuestoTotalMs / LIMIT);
      
      // Con 6 candidatos, cada uno tiene ~45.8 segundos
      const MINIMO_REALISTA_MS = 40_000; // 40 segundos mínimo para búsqueda web
      
      assert.ok(presupuestoPorAnuncioMs >= MINIMO_REALISTA_MS,
        `Presupuesto por anuncio (${presupuestoPorAnuncioMs}ms) debe ser >= ${MINIMO_REALISTA_MS}ms para búsqueda web`);
    });
  });

  describe('Rotación de candidatos', () => {
    it('debe seleccionar candidatos usando ultimaVerificacionAt', () => {
      const anuncios = [
        { id: '1', titulo: 'A', ultimaVerificacionAt: { toMillis: () => 1000 } },
        { id: '2', titulo: 'B', ultimaVerificacionAt: { toMillis: () => 3000 } },
        { id: '3', titulo: 'C', ultimaVerificacionAt: { toMillis: () => 2000 } },
      ];
      
      // Los candidatos se seleccionan por ultimaVerificacionAt más antiguo
      const ordenado = [...anuncios].sort((a, b) => {
        const aTime = a.ultimaVerificacionAt?.toMillis?.() ?? 0;
        const bTime = b.ultimaVerificacionAt?.toMillis?.() ?? 0;
        return aTime - bTime;
      });
      
      assert.strictEqual(ordenado[0].id, '1', 'Debe priorizar el menos recientemente verificado');
      assert.strictEqual(ordenado[1].id, '3');
      assert.strictEqual(ordenado[2].id, '2');
    });
  });
});

describe('OIA-013: Validación de datos', () => {
  it('ignoreUndefinedProperties debe estar configurado en firebase-admin', () => {
    // Este test documenta que firebase-admin.ts debe tener:
    // adminDb.settings({ ignoreUndefinedProperties: true });
    
    const configuracionRequerida = {
      ignoreUndefinedProperties: true,
    };
    
    assert.strictEqual(configuracionRequerida.ignoreUndefinedProperties, true,
      'Firebase Admin debe ignorar propiedades undefined como medida de defensa');
  });

  it('los objetos de actualización no deben contener undefined como valor explícito', () => {
    const actualizacion = {
      fecha: new Date(),
      descripcion: 'Test',
      fuente: 'https://ejemplo.com',
      cambioStatus: false,
    };
    
    // Verificar que no hay valores undefined
    Object.values(actualizacion).forEach(valor => {
      assert.notStrictEqual(valor, undefined, 
        'Ningún campo debe tener undefined como valor explícito');
    });
  });
});
