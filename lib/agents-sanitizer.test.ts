import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { sanitizarError, limpiarUndefined } from './agents';

/**
 * Tests para las funciones de sanitización y limpieza de undefined
 * que previenen rechazos de Firestore (fix para regresión PR #122)
 */

describe('sanitizarError: prevención de undefined en errores', () => {
  it('NO debe devolver claves con valor undefined', () => {
    const errorSinCode = new Error('Test error sin code ni status');
    const sanitizado = sanitizarError(errorSinCode);
    
    // Verificar que NO existen las claves codigo/status cuando son undefined
    assert.strictEqual('codigo' in sanitizado, false);
    assert.strictEqual('status' in sanitizado, false);
    
    // Verificar que tipo y mensaje sí existen
    assert.ok('tipo' in sanitizado);
    assert.ok('mensaje' in sanitizado);
    assert.strictEqual(sanitizado.tipo, 'Error');
    assert.strictEqual(sanitizado.mensaje, 'Test error sin code ni status');
  });

  it('debe incluir codigo y status cuando están definidos', () => {
    const errorCompleto = new Error('Test con code y status');
    (errorCompleto as any).code = 'ETIMEDOUT';
    (errorCompleto as any).status = 504;
    
    const sanitizado = sanitizarError(errorCompleto);
    
    assert.strictEqual(sanitizado.codigo, 'ETIMEDOUT');
    assert.strictEqual(sanitizado.status, 504);
  });

  it('debe convertir codigo a string', () => {
    const errorConCodigoNumerico = new Error('Test');
    (errorConCodigoNumerico as any).code = 123;
    
    const sanitizado = sanitizarError(errorConCodigoNumerico);
    
    assert.strictEqual(sanitizado.codigo, '123');
    assert.strictEqual(typeof sanitizado.codigo, 'string');
  });

  it('debe limitar la longitud del mensaje a 500 caracteres', () => {
    const mensajeLargo = 'x'.repeat(1000);
    const error = new Error(mensajeLargo);
    
    const sanitizado = sanitizarError(error);
    
    assert.strictEqual(sanitizado.mensaje.length, 500);
    assert.ok(error.message.length === 1000);
  });
});

describe('limpiarUndefined: eliminación recursiva de claves undefined', () => {
  it('debe eliminar claves con valor undefined en objeto plano', () => {
    const obj = {
      a: 1,
      b: undefined,
      c: 'test',
      d: null,
      e: undefined,
    };
    
    const limpio = limpiarUndefined(obj);
    
    assert.strictEqual('a' in limpio, true);
    assert.strictEqual('b' in limpio, false);
    assert.strictEqual('c' in limpio, true);
    assert.strictEqual('d' in limpio, true);
    assert.strictEqual('e' in limpio, false);
    assert.strictEqual(limpio.a, 1);
    assert.strictEqual(limpio.c, 'test');
    assert.strictEqual(limpio.d, null);
  });

  it('debe eliminar undefined recursivamente en objetos anidados', () => {
    const obj = {
      nivel1: {
        definido: 'valor',
        noDef: undefined,
        nivel2: {
          valor: 42,
          sinValor: undefined,
        },
      },
      claudeMeta: undefined,
    };
    
    const limpio = limpiarUndefined(obj);
    
    assert.strictEqual('claudeMeta' in limpio, false);
    assert.ok('nivel1' in limpio);
    assert.strictEqual('noDef' in limpio.nivel1, false);
    assert.ok('nivel2' in limpio.nivel1);
    assert.strictEqual('sinValor' in limpio.nivel1.nivel2, false);
    assert.strictEqual(limpio.nivel1.nivel2.valor, 42);
  });

  it('debe manejar arrays correctamente (preservar undefined en arrays)', () => {
    const obj = {
      arr: [1, undefined, 'test', null, undefined],
      nested: {
        data: undefined,
      },
    };
    
    const limpio = limpiarUndefined(obj);
    
    // Los arrays conservan undefined (solo objetos eliminan claves)
    assert.deepStrictEqual(limpio.arr, [1, undefined, 'test', null, undefined]);
    assert.strictEqual('nested' in limpio, true);
    assert.strictEqual('data' in limpio.nested, false);
  });

  it('debe simular el caso real: agenteLogs con claudeMeta undefined', () => {
    const logData = {
      tipo: 'monitoreo',
      duracionMs: 1000,
      errores: [],
      primerError: {
        tipo: 'Error',
        mensaje: 'test',
      },
      claudeMeta: undefined, // ⚠️ Esto causaba el rechazo de Firestore
    };
    
    const limpio = limpiarUndefined(logData);
    
    // claudeMeta no debe existir en el resultado limpio
    assert.strictEqual('claudeMeta' in limpio, false);
    assert.ok('primerError' in limpio);
    assert.strictEqual(limpio.tipo, 'monitoreo');
  });
});

describe('Prevención de rechazo de Firestore por undefined', () => {
  it('debe demostrar que limpiarUndefined previene el error de Firestore', () => {
    // Simular un objeto de log que causaría error en Firestore
    const logDataPeligroso = {
      tipo: 'monitoreo',
      fecha: new Date(),
      duracionMs: 1234,
      primerError: {
        tipo: 'Error',
        mensaje: 'Búsqueda con Claude cancelada después de 100ms (timeout)',
        codigo: undefined, // ⚠️ Esto causaba: Cannot use "undefined" as a Firestore value
        status: undefined, // ⚠️ Esto también
      },
      claudeMeta: undefined, // ⚠️ Y esto
    };
    
    // Simular validación de Firestore (rechaza undefined)
    const validarFirestore = (obj: any) => {
      const verificar = (val: any, path = '') => {
        if (val === undefined) {
          throw new Error(`Cannot use "undefined" as a Firestore value (found in field "${path}")`);
        }
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          for (const [key, value] of Object.entries(val)) {
            verificar(value, path ? `${path}.${key}` : key);
          }
        }
      };
      verificar(obj);
    };
    
    // Sin limpiar: debería lanzar error
    assert.throws(
      () => validarFirestore(logDataPeligroso),
      /Cannot use "undefined" as a Firestore value/
    );
    
    // Con limpiarUndefined: debe pasar
    const logDataSeguro = limpiarUndefined(logDataPeligroso);
    assert.doesNotThrow(() => validarFirestore(logDataSeguro));
    
    // Verificar que las claves undefined fueron eliminadas
    assert.strictEqual('claudeMeta' in logDataSeguro, false);
    assert.strictEqual('codigo' in logDataSeguro.primerError, false);
    assert.strictEqual('status' in logDataSeguro.primerError, false);
    
    // Las demás claves deben existir
    assert.ok('tipo' in logDataSeguro);
    assert.ok('primerError' in logDataSeguro);
    assert.ok('tipo' in logDataSeguro.primerError);
    assert.ok('mensaje' in logDataSeguro.primerError);
  });

  it('debe verificar que sanitizarError + limpiarUndefined es seguro', () => {
    // Error típico de timeout en Claude
    const error = new Error('Búsqueda con Claude cancelada después de 100ms (timeout)');
    // Sin code ni status (undefined)
    
    const sanitizado = sanitizarError(error);
    const limpio = limpiarUndefined({ primerError: sanitizado });
    
    // Simular validación de Firestore
    const validarFirestore = (obj: any) => {
      JSON.stringify(obj, (key, val) => {
        if (val === undefined) throw new Error(`undefined en ${key}`);
        return val;
      });
    };
    
    // No debe lanzar
    assert.doesNotThrow(() => validarFirestore(limpio));
  });
});
