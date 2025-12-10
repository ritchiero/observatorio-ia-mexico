import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
});

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const initiative = await request.json();
    
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20250516",
      max_tokens: 4096,
      tools: [{
        type: "web_search_20250305",
        name: "web_search",
      } as any],
      messages: [{
        role: "user",
        content: `Eres un experto en derecho mexicano especializado en legislación sobre inteligencia artificial. Verifica la siguiente iniciativa legislativa:

**ID:** ${initiative.id}
**Título:** ${initiative.titulo}
**Proponente:** ${initiative.proponente}
**Estatus Actual:** ${initiative.estatus || initiative.status || 'No especificado'}
**Legislatura:** ${initiative.legislatura || 'No especificada'}
**Entidad Federativa:** ${initiative.entidadFederativa || 'Federal'}
**Cámara:** ${initiative.camara || 'No especificada'}
**Tipo:** ${initiative.tipo || 'No especificado'}
**URL Gaceta:** ${initiative.urlGaceta || 'No disponible'}
**URL PDF:** ${initiative.urlPDF || 'No disponible'}

**Descripción:** ${initiative.descripcion || 'No disponible'}

**Resumen:** ${initiative.resumen || 'No disponible'}

---

**TAREAS DE VERIFICACIÓN:**

1. **Validar Título y Descripción:** Verifica si el título coincide con el contenido real de la iniciativa
2. **Confirmar Estatus:** Busca el estatus actual en fuentes oficiales (aprobada/en comisiones/rechazada/publicada)
3. **Verificar Proponente:** Confirma que el proponente y la legislatura sean correctos
4. **Buscar Documentos Oficiales:** Encuentra la gaceta parlamentaria o PDF oficial si falta
5. **Validar URLs:** Verifica que las URLs proporcionadas estén activas y sean correctas
6. **Identificar Discrepancias:** Señala cualquier inconsistencia entre los datos y la información oficial

**DOMINIOS PRIORITARIOS PARA BÚSQUEDA:**
- diputados.gob.mx (Cámara de Diputados Federal)
- senado.gob.mx (Senado)
- ${initiative.entidadFederativa?.toLowerCase() || 'congreso'}.gob.mx (Congreso Estatal si aplica)
- sil.gobernacion.gob.mx (Sistema de Información Legislativa)
- dof.gob.mx (Diario Oficial de la Federación)

**FORMATO DE RESPUESTA (JSON estricto):**
{
  "verified": true/false,
  "confidence": "high" | "medium" | "low",
  "statusMatch": true/false,
  "currentStatus": "estatus verificado o 'no encontrado'",
  "corrections": {
    "titulo": "título correcto si difiere, o null",
    "estatus": "estatus correcto si difiere, o null",
    "proponente": "proponente correcto si difiere, o null",
    "urlPDF": "URL oficial del PDF si se encontró, o null"
  },
  "sources": [
    "URL1 de fuente oficial",
    "URL2 de fuente oficial"
  ],
  "flags": [
    "Lista de alertas o problemas encontrados"
  ],
  "summary": "Resumen breve de la verificación en español"
}

**IMPORTANTE:** Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`
      }]
    });

    // Extraer el contenido de la respuesta
    let responseText = '';
    for (const block of message.content) {
      if (block.type === 'text') {
        responseText += block.text;
      }
    }

    // Intentar parsear como JSON
    let verification;
    try {
      // Buscar JSON en la respuesta (por si Claude agregó texto adicional)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        verification = JSON.parse(jsonMatch[0]);
      } else {
        verification = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      verification = {
        verified: false,
        confidence: 'low',
        statusMatch: false,
        currentStatus: 'error al procesar',
        corrections: {},
        sources: [],
        flags: ['Error al parsear la respuesta de Claude'],
        summary: 'No se pudo completar la verificación. Respuesta raw: ' + responseText.substring(0, 500),
        rawResponse: responseText
      };
    }

    return NextResponse.json({
      success: true,
      verification,
      usage: message.usage
    });

  } catch (error: any) {
    console.error('Error en verificación:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
