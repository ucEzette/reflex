import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parameters for dynamic generation
    const title = searchParams.get('title') || 'Reflex Protection Market';
    const apy = searchParams.get('apy') || '14.2%';
    const sector = searchParams.get('sector') || 'DeFi Insurance';

    return new ImageResponse(
      (
        <div 
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#0B0E14',
            backgroundImage: 'radial-gradient(circle at 50% -20%, rgba(128,0,32,0.4), rgba(11,14,20,1))',
            padding: '80px',
            borderTop: '10px solid #800020'
          }}
        >
          {/* Header/Logo Line */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: '#800020', borderRadius: '8px', marginRight: '20px' }}></div>
            <span style={{ color: 'white', fontSize: 40, fontFamily: 'sans-serif', fontWeight: 900, letterSpacing: '4px' }}>REFLEX</span>
            <span style={{ color: '#00F0FF', fontSize: 30, marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '2px' }}>{sector}</span>
          </div>
          
          {/* Main Title */}
          <h1 style={{ color: 'white', fontSize: 80, fontFamily: 'sans-serif', fontWeight: 'black', lineHeight: 1.1, marginBottom: '20px' }}>
            {title}
          </h1>
          
          {/* Stats Bar */}
          <div style={{ display: 'flex', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', marginRight: '80px' }}>
              <span style={{ color: '#888', fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px' }}>Historic APY</span>
              <span style={{ color: '#22c55e', fontSize: 48, fontWeight: 'bold' }}>{apy}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#888', fontSize: 24, textTransform: 'uppercase', letterSpacing: '2px' }}>Settlement</span>
              <span style={{ color: 'white', fontSize: 48, fontWeight: 'bold' }}>Instant (0.4s)</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
