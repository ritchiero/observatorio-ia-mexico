/**
 * Extrae JSON de una respuesta de Claude que puede contener texto adicional
 */
export function extractJSON(text: string): any {
  // Intentar parsear directamente primero
  try {
    return JSON.parse(text);
  } catch {
    // Si falla, buscar JSON en bloques de código markdown
    const codeBlockMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\]|\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1]);
      } catch {
        // Continuar con otros métodos
      }
    }
    
    // Buscar array JSON en el texto
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // Continuar con otros métodos
      }
    }
    
    // Buscar objeto JSON en el texto
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // Si todo falla, lanzar error con el texto original
        throw new Error(`No se pudo extraer JSON válido. Respuesta: ${text.substring(0, 500)}...`);
      }
    }
    
    throw new Error(`No se encontró JSON en la respuesta. Texto: ${text.substring(0, 500)}...`);
  }
}
