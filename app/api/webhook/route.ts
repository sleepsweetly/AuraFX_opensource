import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('[API/WEBHOOK] Isteği aldi');
  try {
    const body = await request.json();
    console.log('[API/WEBHOOK] Body:', JSON.stringify(body).substring(0, 200));
    
    const { url, payload } = body;

    if (!url || !payload) {
      console.log('[API/WEBHOOK] HATA: Eksik url veya payload');
      return NextResponse.json({ error: 'Missing url or payload' }, { status: 400 });
    }

    console.log(`[API/WEBHOOK] Discord'a istek atiliyor: ${url}`);
    
    // Güvenlik: Sadece Discord webhook adreslerine izin ver
    if (!url.startsWith('https://discord.com/api/webhooks/')) {
      console.log('[API/WEBHOOK] HATA: Gecersiz URL');
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 403 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API/WEBHOOK] Discord API Error (${response.status}):`, errorText);
      return NextResponse.json({ error: `Discord API Error: ${response.status}` }, { status: response.status });
    }

    console.log('[API/WEBHOOK] Discord istegi basarili!');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API/WEBHOOK] Sistem Hatasi:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
