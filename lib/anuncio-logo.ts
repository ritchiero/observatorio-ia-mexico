// Public records can be incomplete; TypeScript types do not validate API data.
export function getAnuncioLogo(responsable: unknown): string {
  if (typeof responsable !== 'string' || !responsable.trim()) return '/logos/institucion.svg';
  if (responsable.includes('Sheinbaum')) return '/logos/presidencia.jpg';
  if (responsable.includes('Ebrard')) return '/logos/economia.png';
  if (responsable.includes('Economía') || responsable === 'SE') return '/logos/economia.png';
  if (responsable.includes('SEP')) return '/logos/sep.png';
  if (responsable.includes('Senado')) return '/logos/senado.jpg';
  if (responsable.includes('CCE')) return '/logos/cce.jpg';
  if (responsable.includes('Infotec') || responsable.includes('ATDT') || responsable.includes('TecNM')) return '/logos/infotec.jpg';
  if (responsable.includes('Saptiva')) return '/logos/economia.png';
  return '/logos/institucion.svg'; // Unknown institution: do not imply Presidency.
}
