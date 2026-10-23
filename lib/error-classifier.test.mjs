import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('clasificarErrorAbort', () => {
  it('debe clasificar APIUserAbortError con timer propio como TimeoutError', async () => {
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    
    // Simular APIUserAbortError (el SDK lo lanza así)
    const error = new Error('Request was aborted.');
    error.name = 'APIUserAbortError';
    Object.setPrototypeOf(error, { constructor: { name: 'APIUserAbortError' } });
    
    const classification = clasificarErrorAbort(error, {
      abortedByOurTimer: true,
      elapsed: 9500,
      timeoutMs: 45000,
      signalAborted: true,
    });
    
    assert.strictEqual(classification.isAbort, true);
    assert.strictEqual(classification.type, 'TimeoutError');
    assert.strictEqual(classification.name, 'TimeoutError');
    assert.strictEqual(classification.code, 'TIMEOUT');
    assert.strictEqual(classification.message, 'TimeoutError tras 9500ms (timeout 45000ms)');
    assert.strictEqual(classification.elapsed, 9500);
    assert.strictEqual(classification.timeoutMs, 45000);
    assert.strictEqual(classification.abortedByOurTimer, true);
  });
  
  it('debe clasificar APIUserAbortError con abort externo como ExternalAbortError', async () => {
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    
    // Simular APIUserAbortError pero NO fue nuestro timer
    const error = new Error('Request was aborted.');
    error.name = 'APIUserAbortError';
    Object.setPrototypeOf(error, { constructor: { name: 'APIUserAbortError' } });
    
    const classification = clasificarErrorAbort(error, {
      abortedByOurTimer: false, // ← NO fue nuestro timer
      elapsed: 9500,
      timeoutMs: 45000,
      signalAborted: true,
      signalReason: 'external_cancellation',
    });
    
    assert.strictEqual(classification.isAbort, true);
    assert.strictEqual(classification.type, 'ExternalAbortError');
    assert.strictEqual(classification.name, 'ExternalAbortError');
    assert.strictEqual(classification.code, 'EXTERNAL_ABORT');
    assert.strictEqual(classification.message, 'ExternalAbortError tras 9500ms (timeout configurado: 45000ms)');
    assert.strictEqual(classification.elapsed, 9500);
    assert.strictEqual(classification.timeoutMs, 45000);
    assert.strictEqual(classification.abortedByOurTimer, false);
    assert.strictEqual(classification.signalReason, 'external_cancellation');
  });
  
  it('debe identificar AbortError genérico', async () => {
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    
    const error = new Error('Aborted');
    error.name = 'AbortError';
    
    const classification = clasificarErrorAbort(error, {
      abortedByOurTimer: true,
      elapsed: 10000,
      timeoutMs: 20000,
    });
    
    assert.strictEqual(classification.isAbort, true);
    assert.strictEqual(classification.type, 'TimeoutError');
  });
  
  it('no debe clasificar APIError 500 como abort', async () => {
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    
    const error = new Error('Internal Server Error');
    error.name = 'APIError';
    error.status = 500;
    
    const classification = clasificarErrorAbort(error, {
      abortedByOurTimer: false,
      elapsed: 5000,
      timeoutMs: 45000,
      signalAborted: false,
    });
    
    assert.strictEqual(classification.isAbort, false);
    assert.strictEqual(classification.type, null);
    assert.strictEqual(classification.name, 'APIError');
  });
  
  it('no debe clasificar APIError 429 como abort', async () => {
    const { clasificarErrorAbort } = await import('./error-classifier.ts');
    
    const error = new Error('Rate limit exceeded');
    error.name = 'APIError';
    error.status = 429;
    
    const classification = clasificarErrorAbort(error, {
      abortedByOurTimer: false,
      elapsed: 1000,
      timeoutMs: 45000,
      signalAborted: false,
    });
    
    assert.strictEqual(classification.isAbort, false);
    assert.strictEqual(classification.type, null);
  });
});
