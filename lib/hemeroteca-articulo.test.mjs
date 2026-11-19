import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { readFileSync } from 'node:fs';

const {
  slugify, slugUnico, localizarTexto, ensamblarArticulo, validarBorrador,
} = await import('./hemeroteca-articulo.ts');
const { limpiarHtml, parseParteAnexoII } = await import('./gacetas/diputados.ts');

const PARTE = new TextDecoder('iso-8859-1').decode(
  readFileSync(new URL('./gacetas/__fixtures__/diputados-20260902-II-2-1.html', import.meta.url)),
);
const URL_PARTE = 'https://gaceta.diputados.gob.mx/Gaceta/66/2026/sep/20260902-II-2-1.html';

const CUERPO_OK = `**Qué es.** Propone reglas para el uso de inteligencia artificial en el procedimiento.

**Quién.** Dip. Fulana (Morena). **Cuándo.** 2 de septiembre de 2026. **Estatus.** Turnada.

## Lo que cambia

${'Texto del contenido concreto de la iniciativa. '.repeat(15)}

## Por qué importa

La exposición de motivos explica el contexto.`;

describe('slugs', () => {
  it('quita acentos y signos', () => {
    assert.equal(slugify('Uso de IA en la justicia agraria (Ley Agraria, arts. 169 Bis)'), 'uso-de-ia-en-la-justicia-agraria-ley-agraria-arts-169-bis');
  });
  it('corta en palabra completa', () => {
    const s = slugify('palabra '.repeat(30));
    assert.ok(s.length <= 80 && !s.endsWith('-'));
  });
  it('no repite un slug existente', () => {
    assert.equal(slugUnico('Ley de IA', new Set(['ley-de-ia', 'ley-de-ia-2'])), 'ley-de-ia-3');
  });
});

describe('localizarTexto', () => {
  it('encuentra cada iniciativa del Anexo II en la página completa', () => {
    const pagina = limpiarHtml(PARTE);
    const { hallazgos } = parseParteAnexoII(PARTE, '2026-09-02', URL_PARTE);
    assert.ok(hallazgos.length > 0);
    for (const h of hallazgos) {
      const tramo = localizarTexto(pagina, h.titulo, h.textoCompleto.slice(0, 1200));
      assert.ok(tramo, `no encontró "${h.titulo.slice(0, 60)}"`);
      // El tramo empieza en la iniciativa, no en otra del mismo día.
      const inicio = h.titulo.split(/\s+/).slice(0, 4).join(' ');
      assert.ok(tramo.slice(0, 400).includes(inicio), `tramo desalineado para "${inicio}"`);
    }
  });
  it('devuelve null si la iniciativa no está en la página', () => {
    const pagina = limpiarHtml(PARTE);
    assert.equal(localizarTexto(pagina, 'Que expide la Ley General de Aguas Marinas Profundas del Pacífico Norte', ''), null);
  });
});

describe('validarBorrador', () => {
  const base = { titulo: 'Reglas para usar IA en el amparo', resumen: 'Propone principios y límites para que los tribunales usen inteligencia artificial.', cuerpo: CUERPO_OK, esSobreIA: true };
  it('acepta un borrador bien formado', () => {
    assert.equal(validarBorrador(base).ok, true);
  });
  it('rechaza lo que no es sobre IA', () => {
    const r = validarBorrador({ ...base, esSobreIA: false });
    assert.equal(r.ok, false);
    assert.equal(r.motivo, 'no_es_ia');
  });
  it('rechaza un cuerpo sin la apertura fija', () => {
    assert.equal(validarBorrador({ ...base, cuerpo: CUERPO_OK.replace('**Qué es.**', 'Esta iniciativa') }).ok, false);
  });
  it('quita el título y las fuentes que agregue el modelo', () => {
    const r = validarBorrador({ ...base, cuerpo: `# Título\n\n${CUERPO_OK}\n\n## Fuentes\n\n- [x](https://x.mx)` });
    assert.equal(r.ok, true);
    assert.ok(!r.borrador.cuerpo.includes('## Fuentes'));
    assert.ok(r.borrador.cuerpo.startsWith('**Qué es.**'));
  });
});

describe('ensamblarArticulo', () => {
  it('arma frontmatter, título, cuerpo y fuentes que el render entiende', () => {
    const md = ensamblarArticulo(
      { id: 'abc123', titulo: 'Que reforma…', fecha: '2026-09-02', camara: 'Diputados', proponente: 'del diputado Juan Pérez', partido: 'PAN', estatus: 'turnada', urlGaceta: URL_PARTE },
      { titulo: 'Reglas para usar IA en el amparo', resumen: 'Resumen "con comillas".', cuerpo: CUERPO_OK, esSobreIA: true },
      'reglas-para-usar-ia-en-el-amparo',
    );
    assert.ok(md.startsWith('---\ntitle: "Reglas para usar IA en el amparo"'));
    assert.ok(md.includes('description: "Resumen \\"con comillas\\"."'));
    assert.ok(md.includes('proponente: Juan Pérez (PAN)'));
    assert.ok(md.includes(`[Publicación oficial en la Gaceta](${URL_PARTE})`));
    assert.ok(md.includes('/legislacion/abc123'));
    // Mismo corte que stripFrontmatter() de lib/hemeroteca.ts.
    const fin = md.indexOf('\n---', 3);
    assert.ok(md.slice(fin + 4).trimStart().startsWith('# Reglas para usar IA en el amparo'));
  });
});
