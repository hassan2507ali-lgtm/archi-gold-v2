import { arEG } from 'date-fns/locale';
import { rename } from 'fs';
import { Variable } from 'lucide-react';
import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new (YahooFinance as any)({ suppressNotices: ['ripHistorical'] });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '365');

  try {
    const period1 = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
    const period2 = Math.floor(Date.now() / 1000);
    const queryOptions = { period1, period2, interval: '1d' as const };

    let goldQuotes: any[] = [];
    let archiQuotes: any[] = [];

    // Fetch Gold
    try {
      const resGold = await yahooFinance.chart('GC=F', queryOptions);
      goldQuotes = resGold.quotes || [];
    } catch (e) { console.error("Gold Error"); }

    // Fetch ARCI (Fixed Ticker)
    try {
      const resArchi = await yahooFinance.chart('ARCI.JK', queryOptions);
      archiQuotes = resArchi.quotes || [];
    } catch (e) {
      console.log("ARCI Fetch gagal, pakai dummy");
      archiQuotes = Array.from({ length: 20 }).map((_, i) => ({
         date: new Date(Date.now() - (i * (days/20)) * 24 * 60 * 60 * 1000),
         close: 320 + Math.random() * 20
      }));
    }

    const dataMap = new Map();
    const mapPrices = (quotes: any[], key: 'archi' | 'gold') => {
      quotes.forEach(q => {
        if (!q.close) return;
        const d = q.date instanceof Date ? q.date : new Date(q.date * 1000);
        const dateStr = d.toISOString().split('T')[0];
        if (!dataMap.has(dateStr)) dataMap.set(dateStr, { date: dateStr, archi: null, gold: null });
        dataMap.get(dateStr)[key] = q.close;
      });
    };

    mapPrices(archiQuotes, 'archi');
    mapPrices(goldQuotes, 'gold');

    let result = Array.from(dataMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    let lastA = 0, lastG = 0, initA = 0, initG = 0;
    const finalResult = result.map(item => {
      if (item.archi) lastA = item.archi;
      if (item.gold) lastG = item.gold;
      if (initA === 0 && lastA > 0) initA = lastA;
      if (initG === 0 && lastG > 0) initG = lastG;

      return {
        date: item.date,
        archiChange: initA ? ((lastA - initA) / initA) * 100 : 0,
        goldChange: initG ? ((lastG - initG) / initG) * 100 : 0,
        rawArchi: lastA,
        rawGold: lastG
      };
    });

    return NextResponse.json({ success: true, data: finalResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}


