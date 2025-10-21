import { ImageResponse } from 'next/og'

// Configuración de la imagen
export const alt = 'Ferretería Pro - Sistema de Gestión e Inventario'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Generador de imagen
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: 100,
              height: 100,
              background: '#3b82f6',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🔧
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 72, fontWeight: 'bold' }}>Ferretería Pro</div>
            <div style={{ fontSize: 36, opacity: 0.8, marginTop: '-10px' }}>
              Sistema de Gestión e Inventario
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
