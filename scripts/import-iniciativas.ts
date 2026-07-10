/**
 * Script para importar las 69 iniciativas legislativas desde el informe MD
 * 
 * Uso:
 * 1. Asegúrate de tener el archivo informe_corregido_ia_mexico_69.md
 * 2. Ejecuta: npx ts-node scripts/import-iniciativas.ts
 * 3. Revisa el JSON y cárgalo desde el panel administrativo autenticado
 */

import * as fs from 'fs';
import * as path from 'path';

// Función para parsear el informe MD
function parseInformeMarkdown(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const iniciativas: Array<Record<string, unknown>> = [];
  let inTable = false;
  
  for (const line of lines) {
    // Detectar inicio de tabla
    if (line.startsWith('| # | Nombre de la Iniciativa')) {
      inTable = true;
      continue;
    }
    
    // Saltar línea de separación
    if (line.startsWith('|---|')) {
      continue;
    }
    
    // Parsear línea de iniciativa
    if (inTable && line.startsWith('|')) {
      const parts = line.split('|').map(p => p.trim()).filter(p => p);
      
      if (parts.length >= 7) {
        const [numero, titulo, proponente, partido, fecha, legislatura, descripcion, estado] = parts;
        
        // Extraer URL del título si existe
        const tituloMatch = titulo.match(/\[(.+?)\]\((.+?)\)/);
        const tituloTexto = tituloMatch ? tituloMatch[1] : titulo;
        const urlGaceta = tituloMatch ? tituloMatch[2] : 'http://sil.gobernacion.gob.mx/portal/';
        
        // Parsear fecha
        const fechaParts = fecha.split('-');
        const fechaDate = new Date(
          parseInt(fechaParts[0]),
          parseInt(fechaParts[1]) - 1,
          parseInt(fechaParts[2])
        );
        
        // Determinar status
        let status = 'desechada_termino';
        if (estado.includes('En comisiones')) {
          status = 'en_comisiones';
        } else if (estado.includes('Archivada')) {
          status = 'archivada';
        } else if (estado.includes('Aprobada')) {
          status = 'aprobada';
        } else if (estado.includes('Rechazada')) {
          status = 'rechazada';
        }
        
        // Determinar tipo de iniciativa
        let tipo = 'reforma_otra';
        if (tituloTexto.toLowerCase().includes('ley federal') || tituloTexto.toLowerCase().includes('ley nacional') || tituloTexto.toLowerCase().includes('ley para')) {
          tipo = 'ley_federal';
        } else if (tituloTexto.toLowerCase().includes('constitución') || tituloTexto.toLowerCase().includes('artículo 73')) {
          tipo = 'reforma_constitucional';
        } else if (tituloTexto.toLowerCase().includes('código penal')) {
          tipo = 'reforma_codigo_penal';
        } else if (tituloTexto.toLowerCase().includes('educación')) {
          tipo = 'reforma_educacion';
        } else if (tituloTexto.toLowerCase().includes('salud')) {
          tipo = 'reforma_salud';
        } else if (tituloTexto.toLowerCase().includes('derecho de autor')) {
          tipo = 'reforma_derechos_autor';
        } else if (tituloTexto.toLowerCase().includes('violencia') || tituloTexto.toLowerCase().includes('mujeres')) {
          tipo = 'reforma_violencia_mujer';
        } else if (tituloTexto.toLowerCase().includes('trabajo')) {
          tipo = 'reforma_trabajo';
        } else if (tituloTexto.toLowerCase().includes('telecomunicaciones')) {
          tipo = 'reforma_telecomunicaciones';
        }
        
        // Determinar cámara
        let camara = 'diputados';
        if (proponente.includes('Sen.')) {
          camara = 'senadores';
        } else if (legislatura.includes('CDMX')) {
          camara = 'congreso_cdmx';
        }
        
        // Extraer temáticas
        const tematicas: string[] = [];
        const descripcionLower = descripcion.toLowerCase();
        if (descripcionLower.includes('deepfake')) tematicas.push('deepfakes');
        if (descripcionLower.includes('violencia digital')) tematicas.push('violencia_digital');
        if (descripcionLower.includes('educación') || descripcionLower.includes('educativa')) tematicas.push('educacion');
        if (descripcionLower.includes('salud')) tematicas.push('salud');
        if (descripcionLower.includes('derechos de autor')) tematicas.push('derechos_autor');
        if (descripcionLower.includes('pornografía')) tematicas.push('pornografia');
        if (descripcionLower.includes('ética')) tematicas.push('etica');
        if (descripcionLower.includes('ciberseguridad')) tematicas.push('ciberseguridad');
        if (descripcionLower.includes('datos personales')) tematicas.push('datos_personales');
        if (descripcionLower.includes('neuroderechos')) tematicas.push('neuroderechos');
        
        iniciativas.push({
          numero: parseInt(numero),
          titulo: tituloTexto,
          proponente: proponente.replace(/Dip\.|Sen\./g, '').trim(),
          partido: partido === '-' ? 'Pluripartidista' : partido,
          fecha: fechaDate.toISOString(),
          legislatura: legislatura.includes('CDMX') ? 'III_CDMX' : legislatura,
          camara,
          descripcion: descripcion,
          status,
          tipo,
          tematicas,
          urlGaceta,
          eventos: [
            {
              fecha: fechaDate.toISOString(),
              tipo: 'presentacion',
              descripcion: `Iniciativa presentada por ${proponente}`
            }
          ]
        });
      }
    }
    
    // Fin de tabla
    if (inTable && line.startsWith('##')) {
      break;
    }
  }
  
  return iniciativas;
}

// Función principal
async function main() {
  const informePath = path.join(__dirname, '../informe_corregido_ia_mexico_69.md');
  
  if (!fs.existsSync(informePath)) {
    console.error('❌ Archivo informe_corregido_ia_mexico_69.md no encontrado');
    console.log('   Colócalo en la raíz del proyecto');
    return;
  }
  
  console.log('📖 Parseando informe...');
  const iniciativas = parseInformeMarkdown(informePath);
  
  console.log(`✅ ${iniciativas.length} iniciativas parseadas`);
  console.log('\n📤 Exportando a JSON...');
  
  // Guardar JSON para revisión
  const jsonPath = path.join(__dirname, '../iniciativas-parsed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(iniciativas, null, 2));
  console.log(`✅ JSON guardado en: ${jsonPath}`);
  
  console.log('\n⚠️  Revisa el JSON y usa /admin/import-legislacion para importarlo.');
}

main().catch(console.error);
