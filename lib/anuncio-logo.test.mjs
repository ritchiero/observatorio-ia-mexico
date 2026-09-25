import assert from 'node:assert/strict';
import test from 'node:test';
import { getAnuncioLogo } from './anuncio-logo.ts';

test('incomplete public announcements cannot crash the homepage or imply Presidency', () => {
  for (const responsable of [undefined, null, '', '  ', 123, {}, []]) {
    assert.equal(getAnuncioLogo(responsable), '/logos/institucion.svg');
  }
});

test('known institutions keep their logo; unknown institutions stay neutral', () => {
  assert.equal(getAnuncioLogo('Claudia Sheinbaum'), '/logos/presidencia.jpg');
  assert.equal(getAnuncioLogo('SEP'), '/logos/sep.png');
  assert.equal(getAnuncioLogo('SE'), '/logos/economia.png');
  assert.equal(getAnuncioLogo('SECIHTI'), '/logos/institucion.svg');
});
