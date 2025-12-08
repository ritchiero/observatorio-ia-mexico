/**
 * Script para parsear las 69 iniciativas legislativas desde el informe MD
 * 
 * Uso: node scripts/parse-informe.js
 */

const fs = require('fs');
const path = require('path');

// Función para parsear el informe MD
function parseInformeMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const iniciativas = [];
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
        if (estado.includes('En comisiones') || estado.includes('En proceso')) {
          status = 'en_comisiones';
        } else if (estado.includes('Archivada')) {
          status = 'archivada';
        } else if (estado.includes('Aprobada')) {
          status = 'aprobada';
        } else if (estado.includes('Rechazada')) {
          status = 'rechazada';
        } else if (estado.includes('Turnada')) {
          status = 'turnada';
        }
        
        // Determinar tipo de iniciativa
        let tipo = 'reforma_otra';
        const tituloLower = tituloTexto.toLowerCase();
        if (tituloLower.includes('ley federal') || tituloLower.includes('ley nacional') || tituloLower.includes('ley para')) {
          tipo = 'ley_federal';
        } else if (tituloLower.includes('constitución') || tituloLower.includes('artículo 73')) {
          tipo = 'reforma_constitucional';
        } else if (tituloLower.includes('código penal')) {
          tipo = 'reforma_codigo_penal';
        } else if (tituloLower.includes('educación')) {
          tipo = 'reforma_educacion';
        } else if (tituloLower.includes('salud')) {
          tipo = 'reforma_salud';
        } else if (tituloLower.includes('derecho de autor')) {
          tipo = 'reforma_derechos_autor';
        } else if (tituloLower.includes('violencia') || tituloLower.includes('mujeres')) {
          tipo = 'reforma_violencia_mujer';
        } else if (tituloLower.includes('trabajo')) {
          tipo = 'reforma_trabajo';
        } else if (tituloLower.includes('telecomunicaciones')) {
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
        const tematicas = [];
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
function main() {
  const informePath = path.join(__dirname, '../informe_corregido_ia_mexico_69.md');
  
  if (!fs.existsSync(informePath)) {
    console.error('❌ Archivo informe_corregido_ia_mexico_69.md no encontrado');
    console.log('   Colócalo en la raíz del proyecto');
    return;
  }
  
  console.log('📖 Parseando informe...');
  const iniciativas = parseInformeMarkdown(informePath);
  
  console.log(`✅ ${iniciativas.length} iniciativas parseadas`);
  
  // Guardar JSON para revisión
  const jsonPath = path.join(__dirname, '../iniciativas-parsed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(iniciativas, null, 2));
  console.log(`✅ JSON guardado en: ${jsonPath}`);
  
  console.log('\n📊 Resumen:');
  console.log(`   Total: ${iniciativas.length}`);
  console.log(`   Activas: ${iniciativas.filter(i => i.status === 'en_comisiones').length}`);
  console.log(`   Desechadas: ${iniciativas.filter(i => i.status === 'desechada_termino').length}`);
  console.log(`   Archivadas: ${iniciativas.filter(i => i.status === 'archivada').length}`);
}

main();
