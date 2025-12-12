import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Observatorio IA México';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Logo/Icon */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              marginBottom: 24,
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>

          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 9999,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#22c55e',
              }}
            />
            <span
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: 14,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Monitoreo Activo
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 300,
              color: 'white',
              margin: 0,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Observatorio{' '}
            <span style={{ color: '#818cf8', fontStyle: 'italic' }}>IA</span>{' '}
            México
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 24,
              color: 'rgba(255,255,255,0.7)',
              margin: 0,
              marginBottom: 40,
              textAlign: 'center',
              maxWidth: 700,
            }}
          >
            Seguimiento integral de la IA en el estado mexicano
          </p>

          {/* Stats */}
          <div
            style={{
              display: 'flex',
              gap: 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 'bold', color: '#60a5fa' }}>📢</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Anuncios</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 'bold', color: '#34d399' }}>⚖️</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Legislación</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 24px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 32, fontWeight: 'bold', color: '#a78bfa' }}>🏛️</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Casos</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
            observatorio-ia-mexico.vercel.app
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
