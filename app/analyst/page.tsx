"use client";

import { useEffect, useState } from "react";
import InteractiveChart from "../../components/InteractiveChart";

type Timeframe = '1W' | '1M' | '1Y';

export default function AnalystPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Kontrol
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y'); // Default 1 Tahun
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);

  // Fetch Data saat Timeframe berubah
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Mapping timeframe ke hari API
      const daysMap = { '1W': 7, '1M': 30, '1Y': 365 };
      
      try {
        const res = await fetch(`/api/stock-data?days=${daysMap[timeframe]}`);
        const json = await res.json();
        if (json.success) {
            setChartData(json.data);
            setSelectedPoint(null); // Reset pilihan saat ganti timeframe
            setReport(null);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, [timeframe]);

  // LOGIKA PINTAR: Analisis Naratif
  const handleChartClick = (point: any) => {
    setSelectedPoint(point);
    if (!chartData.length) return;

    const clickDate = new Date(point.date);
    let comparisonPoint: any;
    let periodLabel = "";

    // Logika Pencarian Data Pembanding (Reference Point)
    if (timeframe === '1Y') {
        // Mode Year: Bandingkan dengan Awal Tahun dari titik yang diklik
        const startOfYear = new Date(clickDate.getFullYear(), 0, 1); // 1 Jan
        // Cari data terdekat dengan 1 Jan
        comparisonPoint = chartData.find(d => new Date(d.date) >= startOfYear) || chartData[0];
        periodLabel = `Sejak Awal Tahun (${clickDate.getFullYear()})`;
    } 
    else if (timeframe === '1M') {
        // Mode Month: Bandingkan dengan Awal Bulan dari titik yang diklik
        const startOfMonth = new Date(clickDate.getFullYear(), clickDate.getMonth(), 1); // Tgl 1 Bulan itu
        comparisonPoint = chartData.find(d => new Date(d.date) >= startOfMonth) || chartData[0];
        periodLabel = `Sejak Awal Bulan (${clickDate.toLocaleString('default', { month: 'long' })})`;
    } 
    else {
        // Mode Week: Bandingkan dengan awal periode grafik (7 hari lalu)
        comparisonPoint = chartData[0]; 
        periodLabel = "Dalam 7 Hari Terakhir";
    }

    // Hitung Growth
    const calcGrowth = (current: number, base: number) => ((current - base) / base) * 100;

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

  return (
    <div className="min-h-screen bg-[#020617] px-8 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    🧠 Archi <span className="text-purple-500">Analyst AI</span>
                </h1>
                <p className="text-slate-400 text-sm">
                    Klik pada grafik untuk melihat performa dari awal periode (YTD/MTD/Week).
                </p>
            </div>
            
            {/* Timeframe Selector */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                            timeframe === tf 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                            : 'text-slate-500 hover:text-white'
                        }`}
                    >
                        {tf}
                    </button>
                ))}
            </div>
        </div>

        {/* 1. Interactive Chart */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative min-h-[500px]">
            {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-4 ml-2">
                         <h2 className="text-lg font-bold">👆 Tap-to-Report Playground</h2>
                         <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">
                            Mode: {timeframe === '1Y' ? 'Yearly Analysis' : timeframe === '1M' ? 'Monthly Analysis' : 'Weekly Analysis'}
                         </span>
                    </div>
                    <InteractiveChart 
                        data={chartData} 
                        onPointClick={handleChartClick} 
                        selectedPoint={selectedPoint} 
                    />
                </>
            )}
        </div>

        {/* 2. Smart Narrative Report (Muncul setelah diklik) */}
        {selectedPoint && report && (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-purple-500/30 p-8 rounded-[2rem] shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    {/* Report Header */}
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-2xl">📑</span>
                                <h3 className="text-xl font-black text-white">Laporan Kinerja {timeframe}</h3>
                            </div>
                            <p className="text-slate-400 text-sm">
                                Periode: <span className="text-purple-400 font-bold">{report.startDate}</span> s/d <span className="text-purple-400 font-bold">{report.endDate}</span>
                            </p>
                        </div>
                        <div className="px-4 py-2 bg-purple-900/20 border border-purple-500/50 rounded-xl">
                            <span className="text-purple-300 font-bold text-xs uppercase tracking-wider">{report.periodLabel}</span>
                        </div>
                    </div>

                    {/* Report Cards Grid */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* GOLD Report */}
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-yellow-500/50 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <h4 className="font-bold text-slate-200">Gold (Emas)</h4>
                                </div>
                                <span className={`text-xl font-black ${report.goldGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.goldGrowth > 0 ? '▲' : '▼'} {Math.abs(report.goldGrowth).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Harga Awal</span>
                                    <span className="text-slate-300 font-mono">{formatUSD(report.startGold)}</span>
                                </div>
                                <div className="text-right flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Harga Akhir</span>
                                    <span className="text-yellow-500 font-mono font-bold">{formatUSD(report.endGold)}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-slate-400 italic border-t border-slate-800 pt-3">
                                "Pada periode ini, harga emas bergerak dari {formatUSD(report.startGold)} menjadi {formatUSD(report.endGold)}."
                            </p>
                        </div>

                        {/* ARCI Report */}
                        <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-colors group">
                             <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <h4 className="font-bold text-slate-200">Archi Indonesia</h4>
                                </div>
                                <span className={`text-xl font-black ${report.archiGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.archiGrowth > 0 ? '▲' : '▼'} {Math.abs(report.archiGrowth).toFixed(2)}%
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Harga Awal</span>
                                    <span className="text-slate-300 font-mono">{formatIDR(report.startArchi)}</span>
                                </div>
                                <div className="text-right flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Harga Akhir</span>
                                    <span className="text-blue-400 font-mono font-bold">{formatIDR(report.endArchi)}</span>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-slate-400 italic border-t border-slate-800 pt-3">
                                "Saham ARCI tercatat {report.archiGrowth >= 0 ? 'tumbuh' : 'koreksi'} sebesar {Math.abs(report.archiGrowth).toFixed(2)}% dari harga awal periode."
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}