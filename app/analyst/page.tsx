"use client";

import { useEffect, useState, useMemo } from "react";
import InteractiveChart from "../../components/InteractiveChart";
import MarketNews from "../../components/MarketNews";

type Timeframe = '1W' | '1M' | '1Y';

// --- SIMULASI DATA BROKER (BANDARMOLOGI) ---
const BROKER_DATA = {
  buyers: [
    { code: "AK", name: "UBS Sekuritas", type: "Foreign", vol: "152,400", avg: "Rp 1.680", net: "+25.4B" },
    { code: "YU", name: "CGS-CIMB", type: "Foreign", vol: "98,200", avg: "Rp 1.685", net: "+16.5B" },
    { code: "BK", name: "J.P. Morgan", type: "Foreign", vol: "75,000", avg: "Rp 1.675", net: "+12.6B" },
  ],
  sellers: [
    { code: "CC", name: "Mandiri Sekuritas", type: "Domestic", vol: "110,100", avg: "Rp 1.690", net: "-18.6B" },
    { code: "ZP", name: "Maybank Sekuritas", type: "Foreign", vol: "85,400", avg: "Rp 1.688", net: "-14.4B" },
    { code: "PD", name: "Indo Premier", type: "Domestic", vol: "62,000", avg: "Rp 1.680", net: "-10.4B" },
  ]
};

export default function AnalystPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y'); 
  
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const daysMap = { '1W': 7, '1M': 30, '1Y': 365 };
    let isCancelled = false;

    const fetchData = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`/api/stock-data?days=${daysMap[timeframe]}&t=${timestamp}`);
        const json = await res.json();
        
        if (!isCancelled && json.success) {
            setChartData(json.data);
            const now = new Date();
            setLastUpdate(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      } catch (err) { console.error("Error fetching live data:", err); } finally { if (showLoading && !isCancelled) setLoading(false); }
    };

    fetchData(true);
    setSelectedPoint(null);
    setReport(null);

    const intervalId = setInterval(() => { fetchData(false); }, 60000);
    return () => { isCancelled = true; clearInterval(intervalId); };
  }, [timeframe]); 

  const handleChartClick = (point: any) => {
    if (!point || !chartData.length) return;
    setSelectedPoint(point);

    const clickDate = new Date(point.date);
    let comparisonPoint: any;
    let periodLabel = "";

    if (timeframe === '1Y') {
        const startOfYear = new Date(clickDate.getFullYear(), 0, 1);
        comparisonPoint = chartData.find(d => new Date(d.date) >= startOfYear) || chartData[0];
        periodLabel = `YTD (${clickDate.getFullYear()})`;
    } else if (timeframe === '1M') {
        const startOfMonth = new Date(clickDate.getFullYear(), clickDate.getMonth(), 1);
        comparisonPoint = chartData.find(d => new Date(d.date) >= startOfMonth) || chartData[0];
        periodLabel = `MTD (${clickDate.toLocaleString('default', { month: 'long' })})`;
    } else {
        comparisonPoint = chartData[0]; 
        periodLabel = "7 Hari Terakhir";
    }

    if (!comparisonPoint) comparisonPoint = chartData[0];

    const calcGrowth = (curr: number, base: number) => {
        if (!base || base === 0) return 0;
        return ((curr - base) / base) * 100;
    };

    setReport({
        periodLabel,
        startDate: comparisonPoint.date,
        endDate: point.date,
        startGold: comparisonPoint.rawGold,
        endGold: point.rawGold,
        startArchi: comparisonPoint.rawArchi,
        endArchi: point.rawArchi,
        goldGrowth: calcGrowth(point.rawGold, comparisonPoint.rawGold),
        archiGrowth: calcGrowth(point.rawArchi, comparisonPoint.rawArchi)
    });
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // LOGIKA AI: Anomaly & Prediction
  const analysis = useMemo(() => {
    if (!report) return { 
      status: "WAITING FOR CLICK...", color: "text-slate-500", bg: "bg-slate-500/10", 
      desc: "Silakan klik chart di atas untuk memulai analisis.",
      forecastPrice: "-", forecastTrend: "neutral",
      forecastLogic: "Membutuhkan data harga dari chart untuk memproses proyeksi masa depan."
    };
    
    const g = report.goldGrowth;
    const a = report.archiGrowth;
    const gStr = Math.abs(g).toFixed(2) + "%";
    const aStr = Math.abs(a).toFixed(2) + "%";

    let status = "NEUTRAL"; let color = "text-slate-400"; let bg = "bg-slate-500/10";
    let desc = "Pergerakan harga relatif datar.";
    
    // Prediksi Variabel
    let fPrice = report.endArchi;
    let fTrend = "neutral";
    let fLogic = "";

    // Skenario Anomali & Prediksi
    if (g > 0 && a < 0) {
        status = "NEGATIVE DIVERGENCE"; color = "text-red-400"; bg = "bg-red-500/10";
        desc = `Anomaly: Emas naik ${gStr}, namun ARCI terkoreksi ${aStr}. Ada tekanan jual domestik.`;
        
        // Logika Prediksi Turun
        fPrice = report.endArchi * 0.95; // Prediksi turun 5%
        fTrend = "bearish";
        fLogic = `Distribusi masif oleh broker asing (CC, ZP) mengalahkan sentimen positif kenaikan harga emas global. Model memproyeksikan ARCI akan menguji level support di sekitar ${formatIDR(fPrice)} dalam 7 hari ke depan.`;
    } 
    else if (g < 0 && a > 0) {
        status = "OUTPERFORMANCE"; color = "text-emerald-400"; bg = "bg-emerald-500/10";
        desc = `Kuat: ARCI naik ${aStr} meskipun Emas dunia turun ${gStr}. Big fund sedang akumulasi.`;
        
        // Logika Prediksi Naik Kuat
        fPrice = report.endArchi * 1.08; // Prediksi naik 8%
        fTrend = "bullish";
        fLogic = `Terdeteksi akumulasi agresif oleh Foreign Broker (AK, YU) di harga rata-rata Rp 1.680, mengabaikan pelemahan emas global. AI memproyeksikan momentum ini akan memecah resistance menuju target ${formatIDR(fPrice)}.`;
    } 
    else if (g > 0 && a > 0) {
        status = "POSITIVE CORRELATION"; color = "text-blue-400"; bg = "bg-blue-500/10";
        desc = `Normal: ARCI (+${aStr}) selaras dengan tren Emas (+${gStr}).`;
        
        // Logika Prediksi Naik Wajar
        fPrice = report.endArchi * 1.04; // Prediksi naik 4%
        fTrend = "bullish";
        fLogic = `Kondisi makro yang mendukung (Emas naik) ditambah net buy asing sebesar +Rp 25M dari broker AK memperkuat tren. Target kenaikan moderat ke level ${formatIDR(fPrice)}.`;
    }
    else {
        status = "POSITIVE CORRELATION"; color = "text-blue-400"; bg = "bg-blue-500/10";
        desc = `Normal: ARCI (-${aStr}) melemah mengikuti tren Emas (-${gStr}).`;
        
        fPrice = report.endArchi * 0.97; // Turun 3%
        fTrend = "bearish";
        fLogic = `Sejalan dengan pelemahan komoditas global, aksi profit taking retail membebani harga. Prediksi konsolidasi melemah di area ${formatIDR(fPrice)}.`;
    }

    return { status, color, bg, desc, forecastPrice: formatIDR(fPrice), forecastTrend: fTrend, forecastLogic: fLogic };
  }, [report]);

  return (
    <div className="min-h-screen bg-[#020617] px-8 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    🧠 Archi <span className="text-purple-500">Analyst AI</span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
                    </span>
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                    Monitoring pasar, bandarmologi & prediksi AI. 
                    <span className="text-xs text-slate-600 border-l border-slate-700 pl-2">Updated: {lastUpdate}</span>
                </p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button key={tf} onClick={() => setTimeframe(tf)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{tf}</button>
                ))}
            </div>
        </div>

        {/* --- BAGIAN ATAS: CHART + NEWS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative min-h-[500px]">
                 <div className="flex justify-between items-center mb-4 ml-2">
                     <h2 className="text-lg font-bold">👆 Tap Chart to Analyze</h2>
                     <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">Mode: {timeframe}</span>
                 </div>
                {loading ? (
                    <div className="h-[400px] flex items-center justify-center"><span className="animate-pulse text-purple-400 font-bold">Connecting...</span></div>
                ) : (
                    <InteractiveChart data={chartData} onPointClick={handleChartClick} selectedPoint={selectedPoint} />
                )}
            </div>
            <div className="lg:col-span-1 h-full">
                <MarketNews />
            </div>
        </div>

        {/* --- SCORECARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-yellow-500 mb-1 flex items-center gap-2">🟡 Gold Trend</h4>
                    <div className="text-xs text-slate-500">{report ? `${formatUSD(report.startGold)} ➔ ${formatUSD(report.endGold)}` : 'Waiting data...'}</div>
                </div>
                {report && <span className={`text-2xl font-black ${report.goldGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.goldGrowth > 0 ? '+' : ''}{report.goldGrowth.toFixed(2)}%</span>}
            </div>
            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-blue-500 mb-1 flex items-center gap-2">🔵 ARCI Trend</h4>
                    <div className="text-xs text-slate-500">{report ? `${formatIDR(report.startArchi)} ➔ ${formatIDR(report.endArchi)}` : 'Waiting data...'}</div>
                </div>
                {report && <span className={`text-2xl font-black ${report.archiGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.archiGrowth > 0 ? '+' : ''}{report.archiGrowth.toFixed(2)}%</span>}
            </div>
        </div>

        {/* --- BAGIAN BAWAH: ANOMALY, BROKER SUMMARY & AI FORECAST --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* KOLOM KIRI (LEBAR 2): Anomaly + Broker Summary */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Anomaly Detector */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem]">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">🕵️ Correlation Anomaly</h3>
                    <div className="flex items-start gap-4">
                        <span className={`shrink-0 px-3 py-1 rounded-lg text-xs font-black border ${analysis.color} ${analysis.bg} border-transparent`}>
                            {analysis.status}
                        </span>
                        <p className="text-slate-300 text-sm leading-relaxed">"{analysis.desc}"</p>
                    </div>
                </div>

                {/* 2. Bandarmologi / Broker Summary */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] overflow-hidden relative">
                    <h3 className="text-md font-bold text-white mb-4 flex items-center gap-2">🏢 Broker Summary (Bandarmologi) Today</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        {/* Top Buyers */}
                        <div>
                            <div className="text-[10px] font-bold text-green-400 uppercase mb-2 border-b border-green-900/30 pb-1">Top Buyers (Accumulation)</div>
                            <div className="space-y-2">
                                {BROKER_DATA.buyers.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-slate-200 w-6">{b.code}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{b.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-green-400">{b.vol} Lot</div>
                                            <div className="text-[10px] text-slate-500">Avg: {b.avg}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Sellers */}
                        <div>
                            <div className="text-[10px] font-bold text-red-400 uppercase mb-2 border-b border-red-900/30 pb-1">Top Sellers (Distribution)</div>
                            <div className="space-y-2">
                                {BROKER_DATA.sellers.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-950/50 p-2 rounded-lg border border-slate-800/50">
                                        <div className="flex gap-2 items-center">
                                            <span className="text-xs font-bold text-slate-200 w-6">{b.code}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{b.type}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-mono text-red-400">{b.vol} Lot</div>
                                            <div className="text-[10px] text-slate-500">Avg: {b.avg}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* KOLOM KANAN (LEBAR 1): AI Prediction Card */}
            <div className="lg:col-span-1">
                <div className="bg-gradient-to-b from-purple-900/20 to-slate-900 border border-purple-500/30 p-6 rounded-[2rem] h-full relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full group-hover:bg-purple-500/20 transition-all"></div>
                    
                    <h3 className="text-md font-bold text-white mb-6 flex items-center gap-2">
                        🔮 AI Price Forecast <span className="text-[10px] text-purple-300 font-normal border border-purple-500/50 px-2 py-0.5 rounded-full">T+7 Days</span>
                    </h3>

                    {!report ? (
                        <div className="flex flex-col items-center justify-center h-48 opacity-50">
                            <div className="w-10 h-10 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                            <span className="text-xs text-slate-400">Waiting for chart data...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Target Box */}
                            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center shadow-inner">
                                <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Target Price (ARCI)</div>
                                <div className={`text-4xl font-black font-mono ${analysis.forecastTrend === 'bullish' ? 'text-green-400' : 'text-red-400'}`}>
                                    {analysis.forecastPrice}
                                </div>
                                <div className="text-xs text-slate-500 mt-2 flex justify-center items-center gap-2">
                                    Confidence Level: <span className="text-purple-400 font-bold">87%</span>
                                </div>
                            </div>

                            {/* Reasoning Box */}
                            <div>
                                <h4 className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">AI Reasoning</h4>
                                <p className="text-xs text-slate-300 leading-relaxed text-justify">
                                    {analysis.forecastLogic}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}