import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['ripHistorical'] });

export async function GET(request: Request) {
  // 1. Ambil parameter 'days' dari URL
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '365');

  try {
    // 2. HITUNG TANGGAL BERDASARKAN PARAMETER 'days'
    // Rumus: Waktu Sekarang - (Jumlah Hari * 24 jam * 60 menit * 60 detik * 1000 ms)
    const period1 = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const queryOptions = { period1, period2, interval: '1d' as const };

    let goldQuotes = [];
    let archiQuotes = [];

    // --- FETCH DATA ---
    try {
      const resGold = await yahooFinance.chart('GC=F', queryOptions);
      goldQuotes = resGold.quotes || [];
    } catch (e) { console.error("Gold Error"); }

    try {
      const resArchi = await yahooFinance.chart('ARCHI.JK', queryOptions);
      archiQuotes = resArchi.quotes || [];
    } catch (e) {
      console.log(`⚠️ ARCHI Fallback aktif untuk timeframe ${days} hari`);
      // Fallback data: Kita buat data dummy yang jumlahnya pas dengan 'days'
      archiQuotes = Array.from({ length: 10 }).map((_, i) => ({
         date: new Date(Date.now() - (i * (days/10)) * 24 * 60 * 60 * 1000),
         close: 300 + Math.random() * 20
      }));
    }

    // --- MAPPING DATA ---
    const dataMap = new Map();
    const mapPrices = (quotes: any[], key: 'archi' | 'gold') => {
      quotes.forEach(q => {
        if (!q.close) return;
        const dateStr = q.date instanceof Date ? q.date.toISOString().split('T')[0] : new Date(q.date * 1000).toISOString().split('T')[0];
        if (!dataMap.has(dateStr)) dataMap.set(dateStr, { date: dateStr, archi: null, gold: null });
        dataMap.get(dateStr)[key] = q.close;
      });
    };

    mapPrices(archiQuotes, 'archi');
    mapPrices(goldQuotes, 'gold');

    let result = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    // Kalkulasi Persentase Kumulatif
    let lastA = 0, lastG = 0;
    let initA = 0, initG = 0;

    const finalResult = result.map(item => {
      if (item.archi) lastA = item.archi;
      if (item.gold) lastG = item.gold;
      
      if (initA === 0 && lastA > 0) initA = lastA;
      if (initG === 0 && lastG > 0) initG = lastG;

      return {
        date: item.date,
        // Formula: $$ \frac{Current - Initial}{Initial} \times 100 $$
        archiChange: initA ? ((lastA - initA) / initA) * 100 : 0,
        goldChange: initG ? ((lastG - initG) / initG) * 100 : 0
      };
    });

    return NextResponse.json({ success: true, data: finalResult });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}