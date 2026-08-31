import Anthropic from '@anthropic-ai/sdk';
import {
  PROMPT_AGENTE_CASOS,
  PROMPT_AGENTE_CRITERIOS,
  PROMPT_AGENTE_PROPUESTAS,
  PROMPT_AGENTE_PROBLEMATICAS
} from './prompts-ia-pi';
import {
  crearCasoJudicial,
  crearCriterioJuridico,
  crearPropuestaLegislativa,
  crearProblematica
} from './firestore-ia-pi';
import { extractJSON } from './json-parser';
import type { CasoJudicial, CriterioJuridico, PropuestaLegislativa, Problematica } from '@/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Agentes especializados para IA y Propiedad Intelectual
 */

// ============= AGENTE DE CASOS JUDICIALES =============

export async function ejecutarAgenteCasos() {
  console.log('🔍 Iniciando agente de casos judiciales...');
  
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const message = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `${PROMPT_AGENTE_CASOS}

Fecha actual: ${fechaActual}

Busca casos judiciales relacionados con IA y propiedad intelectual en México del último mes.

IMPORTANTE: Devuelve SOLO un JSON array válido, sin texto adicional.`
    }]
  });
  
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    console.log('📝 Respuesta de Claude:', responseText.substring(0, 200));
    const casos = extractJSON(responseText) as Array<Omit<CasoJudicial, 'id'>>;
    
    const resultados = {
      encontrados: casos.length,
      guardados: 0,
      errores: 0
    };
    
    for (const caso of casos) {
      try {
        await crearCasoJudicial(caso);
        resultados.guardados++;
      } catch (error) {
        console.error('Error al guardar caso:', error);
        resultados.errores++;
      }
    }
    
    console.log(`✅ Agente de casos completado: ${resultados.guardados} casos guardados`);
    return resultados;
    
  } catch (error) {
    console.error('Error al parsear respuesta del agente de casos:', error);
    console.error('Respuesta completa:', responseText);
    throw error;
  }
}

// ============= AGENTE DE CRITERIOS Y PRECEDENTES =============

export async function ejecutarAgenteCriterios() {
  console.log('🔍 Iniciando agente de criterios y precedentes...');
  
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const message = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `${PROMPT_AGENTE_CRITERIOS}

Fecha actual: ${fechaActual}

Busca criterios jurídicos y precedentes relacionados con IA en México del último mes.

IMPORTANTE: Devuelve SOLO un JSON array válido, sin texto adicional.`
    }]
  });
  
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    console.log('📝 Respuesta de Claude:', responseText.substring(0, 200));
    const criterios = extractJSON(responseText) as Array<Omit<CriterioJuridico, 'id'>>;
    
    const resultados = {
      encontrados: criterios.length,
      guardados: 0,
      errores: 0
    };
    
    for (const criterio of criterios) {
      try {
        await crearCriterioJuridico(criterio);
        resultados.guardados++;
      } catch (error) {
        console.error('Error al guardar criterio:', error);
        resultados.errores++;
      }
    }
    
    console.log(`✅ Agente de criterios completado: ${resultados.guardados} criterios guardados`);
    return resultados;
    
  } catch (error) {
    console.error('Error al parsear respuesta del agente de criterios:', error);
    console.error('Respuesta completa:', responseText);
    throw error;
  }
}

// ============= AGENTE DE PROPUESTAS LEGISLATIVAS =============

export async function ejecutarAgentePropuestas() {
  console.log('🔍 Iniciando agente de propuestas legislativas...');
  
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const message = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `${PROMPT_AGENTE_PROPUESTAS}

Fecha actual: ${fechaActual}

Busca propuestas legislativas sobre IA en el Congreso mexicano del último mes.

IMPORTANTE: Devuelve SOLO un JSON array válido, sin texto adicional.`
    }]
  });
  
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    console.log('📝 Respuesta de Claude:', responseText.substring(0, 200));
    const propuestas = extractJSON(responseText) as Array<Omit<PropuestaLegislativa, 'id'>>;
    
    const resultados = {
      encontrados: propuestas.length,
      guardados: 0,
      errores: 0
    };
    
    for (const propuesta of propuestas) {
      try {
        await crearPropuestaLegislativa(propuesta);
        resultados.guardados++;
      } catch (error) {
        console.error('Error al guardar propuesta:', error);
        resultados.errores++;
      }
    }
    
    console.log(`✅ Agente de propuestas completado: ${resultados.guardados} propuestas guardadas`);
    return resultados;
    
  } catch (error) {
    console.error('Error al parsear respuesta del agente de propuestas:', error);
    console.error('Respuesta completa:', responseText);
    throw error;
  }
}

// ============= AGENTE DE PROBLEMÁTICAS =============

export async function ejecutarAgenteProblematicas() {
  console.log('🔍 Iniciando agente de problemáticas...');
  
  const fechaActual = new Date().toISOString().split('T')[0];
  
  const message = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `${PROMPT_AGENTE_PROBLEMATICAS}

Fecha actual: ${fechaActual}

Busca casos documentados de problemáticas causadas por IA en México del último mes.

IMPORTANTE: Devuelve SOLO un JSON array válido, sin texto adicional.`
    }]
  });
  
  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
  
  try {
    console.log('📝 Respuesta de Claude:', responseText.substring(0, 200));
    const problematicas = extractJSON(responseText) as Array<Omit<Problematica, 'id'>>;
    
    const resultados = {
      encontrados: problematicas.length,
      guardados: 0,
      errores: 0
    };
    
    for (const problematica of problematicas) {
      try {
        await crearProblematica(problematica);
        resultados.guardados++;
      } catch (error) {
        console.error('Error al guardar problemática:', error);
        resultados.errores++;
      }
    }
    
    console.log(`✅ Agente de problemáticas completado: ${resultados.guardados} problemáticas guardadas`);
    return resultados;
    
  } catch (error) {
    console.error('Error al parsear respuesta del agente de problemáticas:', error);
    console.error('Respuesta completa:', responseText);
    throw error;
  }
}
