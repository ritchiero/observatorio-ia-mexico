/**
 * Periodo (mes/año) que cubre un recap mensual.
 * Sin override: el mes anterior a `ahora` (el cron corre el día 1).
 * Con override: el mes pedido, para regenerar recaps atrasados.
 */
export function resolverPeriodoRecap(
  ahora: Date,
  override: { mes?: number; anio?: number } = {},
): { mes: number; anio: number } {
  if (override.mes === undefined && override.anio === undefined) {
    const mesActual = ahora.getUTCMonth(); // 0-11
    return mesActual === 0
      ? { mes: 12, anio: ahora.getUTCFullYear() - 1 }
      : { mes: mesActual, anio: ahora.getUTCFullYear() };
  }

  const { mes, anio } = override;
  if (mes === undefined || anio === undefined) {
    throw new Error('Para regenerar un recap se necesitan mes y anio juntos.');
  }
  if (!Number.isInteger(mes) || mes < 1 || mes > 12) {
    throw new Error(`Mes inválido: ${mes}`);
  }
  if (!Number.isInteger(anio) || anio < 2024) {
    throw new Error(`Año inválido: ${anio}`);
  }
  // No se puede hacer el recap de un mes que no ha terminado.
  const inicioMesActual = Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), 1);
  if (Date.UTC(anio, mes - 1, 1) >= inicioMesActual) {
    throw new Error(`El mes ${mes}/${anio} aún no termina.`);
  }
  return { mes, anio };
}
