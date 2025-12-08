/**
 * Script para parsear el CSV actualizado con enlaces
 * 
 * Uso: node scripts/parse-csv.js
 */

const fs = require('fs');
const path = require('path');

function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const iniciativas = [];
  
  // Saltar header (línea 1)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parsear CSV (considerando comillas para campos con comas)
    const parts = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    
    if (parts.length < 9) continue;
    
    const [numero, titulo, proponente, partido, fecha, legislatura, descripcion, estado, urlGaceta, tipoEnlace] = parts;
    
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
    const tituloLower = titulo.toLowerCase();
    if (tituloLower.includes('ley federal') || tituloLower.includes('ley nacional') || tituloLower.includes('ley para') || tituloLower.includes('ley que crea')) {
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
    if (descripcionLower.includes('educación') || descripcionLower.includes('educativa') || descripcionLower.includes('educativos')) tematicas.push('educacion');
    if (descripcionLower.includes('salud')) tematicas.push('salud');
    if (descripcionLower.includes('derechos de autor')) tematicas.push('derechos_autor');
    if (descripcionLower.includes('pornografía')) tematicas.push('pornografia');
    if (descripcionLower.includes('ética')) tematicas.push('etica');
    if (descripcionLower.includes('ciberseguridad')) tematicas.push('ciberseguridad');
    if (descripcionLower.includes('datos personales')) tematicas.push('datos_personales');
    if (descripcionLower.includes('neuroderechos')) tematicas.push('neuroderechos');
    if (descripcionLower.includes('laboral')) tematicas.push('derechos_laborales');
    if (descripcionLower.includes('plataformas digitales')) tematicas.push('plataformas_digitales');
    
    // URL PDF (si no está disponible, usar placeholder)
    const urlPDF = urlGaceta !== 'No disponible' ? urlGaceta : undefined;
    
    iniciativas.push({
      numero: parseInt(numero),
      titulo: titulo.replace(/^"|"$/g, ''),
      proponente: proponente.replace(/Dip\.|Sen\./g, '').trim(),
      partido: partido === '-' ? 'Pluripartidista' : partido,
      fecha: fechaDate.toISOString(),
      legislatura: legislatura.includes('CDMX') ? 'III_CDMX' : legislatura,
      camara,
      descripcion: descripcion.replace(/^"|"$/g, ''),
      status,
      tipo,
      tematicas,
      urlGaceta: urlPDF || 'http://sil.gobernacion.gob.mx/portal/',
      urlPDF,
      eventos: [
        {
          fecha: fechaDate.toISOString(),
          tipo: 'presentacion',
          descripcion: `Iniciativa presentada por ${proponente}`
        }
      ]
    });
  }
  
  return iniciativas;
}

// Función principal
function main() {
  const csvPath = path.join(__dirname, '../tabla_final_con_enlaces_69.csv');
  
  if (!fs.existsSync(csvPath)) {
    // Intentar con el archivo en upload
    const uploadPath = '/home/ubuntu/upload/tabla_final_con_enlaces_69.csv';
    if (fs.existsSync(uploadPath)) {
      fs.copyFileSync(uploadPath, csvPath);
    } else {
      console.error('❌ Archivo tabla_final_con_enlaces_69.csv no encontrado');
      return;
    }
  }
  
  console.log('📖 Parseando CSV...');
  const iniciativas = parseCSV(csvPath);
  
  console.log(`✅ ${iniciativas.length} iniciativas parseadas`);
  
  // Guardar JSON
  const jsonPath = path.join(__dirname, '../iniciativas-final.json');
  fs.writeFileSync(jsonPath, JSON.stringify(iniciativas, null, 2));
  console.log(`✅ JSON guardado en: ${jsonPath}`);
  
  console.log('\n📊 Resumen:');
  console.log(`   Total: ${iniciativas.length}`);
  console.log(`   Activas: ${iniciativas.filter(i => i.status === 'en_comisiones').length}`);
  console.log(`   Desechadas: ${iniciativas.filter(i => i.status === 'desechada_termino').length}`);
  console.log(`   Archivadas: ${iniciativas.filter(i => i.status === 'archivada').length}`);
  console.log(`   Con PDF: ${iniciativas.filter(i => i.urlPDF).length}`);
}

main();
