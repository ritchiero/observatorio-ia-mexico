import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requireAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  // Verificar autenticación
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const initiative = await request.json();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [{
        role: "system",
        content: `Eres un experto en derecho mexicano especializado en legislación sobre inteligencia artificial. Tu tarea es verificar iniciativas legislativas mexicanas.

IMPORTANTE: Debes responder ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.`
      }, {
        role: "user",
        content: `Verifica la siguiente iniciativa legislativa:

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

1. **Validar Coherencia:** Verifica si el título, descripción y resumen son coherentes entre sí
2. **Evaluar Completitud:** Identifica campos faltantes o información incompleta
3. **Verificar Formato:** Revisa que los datos sigan el formato esperado
4. **Detectar Inconsistencias:** Señala cualquier discrepancia en los datos
5. **Sugerir Mejoras:** Proporciona recomendaciones para mejorar la información

**DOMINIOS OFICIALES DE REFERENCIA:**
- diputados.gob.mx (Cámara de Diputados Federal)
- senado.gob.mx (Senado)
- sil.gobernacion.gob.mx (Sistema de Información Legislativa)
- dof.gob.mx (Diario Oficial de la Federación)
- Congresos estatales: [estado].gob.mx

**FORMATO DE RESPUESTA (JSON estricto):**
{
  "verified": true/false,
  "confidence": "high" | "medium" | "low",
  "completeness": {
    "score": 0-100,
    "missingFields": ["lista de campos faltantes"],
    "incompleteFields": ["lista de campos incompletos"]
  },
  "coherence": {
    "titleDescriptionMatch": true/false,
    "dataConsistency": true/false,
    "issues": ["lista de problemas de coherencia"]
  },
  "recommendations": [
    "Recomendación 1",
    "Recomendación 2"
  ],
  "suggestedCorrections": {
    "titulo": "título sugerido si aplica, o null",
    "estatus": "estatus sugerido si aplica, o null",
    "descripcion": "descripción mejorada si aplica, o null"
  },
  "flags": [
    "Lista de alertas o problemas encontrados"
  ],
  "summary": "Resumen breve de la verificación en español (2-3 oraciones)"
}

Responde ÚNICAMENTE con el JSON, sin texto adicional.`
      }]
    });

    const responseText = completion.choices[0].message.content || '';
    
    // Intentar parsear como JSON
    let verification;
    try {
      verification = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      verification = {
        verified: false,
        confidence: 'low',
        completeness: {
          score: 0,
          missingFields: [],
          incompleteFields: []
        },
        coherence: {
          titleDescriptionMatch: false,
          dataConsistency: false,
          issues: ['Error al procesar la respuesta']
        },
        recommendations: [],
        suggestedCorrections: {},
        flags: ['Error al parsear la respuesta de IA'],
        summary: 'No se pudo completar la verificación. Respuesta raw: ' + responseText.substring(0, 500),
        rawResponse: responseText
      };
    }

    return NextResponse.json({
      success: true,
      verification,
      usage: completion.usage
    });

  } catch (error: any) {
    console.error('Error en verificación:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error desconocido'
    }, { status: 500 });
  }
}
