'use client';

// Badge del folio de expediente (ANU/LEG/CAS-AAAA-NNN). Identificador estable
// y legible por proyecto, para que no se revuelvan. Clases Tailwind literales.

interface Props {
  folio?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FolioBadge({ folio, size = 'md', className = '' }: Props) {
  if (!folio) return null;
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-50 font-mono font-medium tracking-tight text-gray-600 ${pad} ${className}`}
      title={`Folio de expediente: ${folio}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
      {folio}
    </span>
  );
}
