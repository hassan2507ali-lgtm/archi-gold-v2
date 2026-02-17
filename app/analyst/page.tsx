"use client";

import { useEffect, useState, useMemo } from "react";
import InteractiveChart from "../../components/InteractiveChart";
import MarketNews from "../../components/MarketNews"; // IMPORT KOMPONEN BARU

type Timeframe = '1W' | '1M' | '1Y';

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

  const analysis = useMemo(() => {
    if (!report) return { status: "WAITING FOR CLICK...", color: "text-slate-500", bg: "bg-slate-500/10", desc: "Silakan klik chart di atas untuk memulai analisis." };
    
    const g = report.goldGrowth;
    const a = report.archiGrowth;
    const gStr = Math.abs(g).toFixed(2) + "%";
    const aStr = Math.abs(a).toFixed(2) + "%";

    let status = "NEUTRAL";
    let color = "text-slate-400";
    let bg = "bg-slate-500/10";
    let desc = "Pergerakan harga relatif datar.";

    if (g > 0 && a < 0) {
        status = "NEGATIVE DIVERGENCE";
        color = "text-red-400";
        bg = "bg-red-500/10";
        desc = `Anomaly Terdeteksi: Emas Global naik ${gStr}, namun saham ARCI terkoreksi ${aStr}. Sentimen negatif internal mendominasi.`;
    } else if (g < 0 && a > 0) {
        status = "OUTPERFORMANCE";
        color = "text-emerald-400";
        bg = "bg-emerald-500/10";
        desc = `Kinerja Impresif: Saham ARCI naik ${aStr} meskipun Emas dunia turun ${gStr}.`;
    } else if ((g > 0 && a > 0) || (g < 0 && a < 0)) {
        status = "POSITIVE CORRELATION";
        color = "text-blue-400";
        bg = "bg-blue-500/10";
        desc = `Normal: Pergerakan ARCI (${a > 0 ? '+' : '-'}${aStr}) selaras dengan Emas (${g > 0 ? '+' : '-'}${gStr}).`;
    }

    return { status, color, bg, desc };
  }, [report]);

  return (
    <div className="min-h-screen bg-[#020617] px-8 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    🧠 Archi <span className="text-purple-500">Analyst




                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
                    </span>
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                    Monitoring pasar saham & komoditas real-time. 
                    <span className="text-xs text-slate-600 border-l border-slate-700 pl-2">Updated: {lastUpdate}</span>
                </p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button key={tf} onClick={() => setTimeframe(tf)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{tf}</button>
                ))}
            </div>
        </div>

        {/* --- GRID UTAMA: CHART + NEWS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI (CHART - LEBAR 2 KOLOM) */}
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

            {/* KOLOM KANAN (NEWS FEED - LEBAR 1 KOLOM) */}
            <div className="lg:col-span-1 h-full">
                <MarketNews />
            </div>

        </div>

        {/* Anomaly Table (Bawah) */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-yellow-500">🟡 Gold</h4>
                        {report && <span className={`text-xl font-black ${report.goldGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.goldGrowth > 0 ? '+' : ''}{report.goldGrowth.toFixed(2)}%</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{report ? `${formatUSD(report.startGold)} ➔ ${formatUSD(report.endGold)}` : '-'}</div>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-blue-500">🔵 ARCI</h4>
                        {report && <span className={`text-xl font-black ${report.archiGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.archiGrowth > 0 ? '+' : ''}{report.archiGrowth.toFixed(2)}%</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{report ? `${formatIDR(report.startArchi)} ➔ ${formatIDR(report.endArchi)}` : '-'}</div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">🕵️ Correlation & Anomaly Detector</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-4 space-y-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-black border ${analysis.color} ${analysis.bg} border-transparent`}>
                            {analysis.status}
                        </span>
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                            <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider"> ANALYSIS SUMMARY</h4>
                            <p className="text-slate-200 text-sm leading-relaxed italic">"{analysis.desc}"</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}