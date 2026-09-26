import { ImageResponse } from 'next/og';

export const alt = 'iShowNet — Internet Speed Test';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          background: '#07070a',
          color: '#f3f1ec',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, color: '#ef233c', fontWeight: 700 }}>iShowNet</div>
        <div style={{ marginTop: 22, fontSize: 72, fontWeight: 700, letterSpacing: -3 }}>
          Internet Speed Test
        </div>
        <div style={{ marginTop: 22, fontSize: 34, color: '#b7b5bd' }}>
          Download · Upload · Ping · Jitter · Packet Loss · Bufferbloat
        </div>
        <div style={{ marginTop: 44, fontSize: 24, color: '#77757e' }}>
          Free browser-based connection quality test
        </div>
      </div>
    ),
    size,
  );
}
