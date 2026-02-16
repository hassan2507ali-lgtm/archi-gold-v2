"use client";

import { useEffect, useState, useMemo } from "react";
import InteractiveChart from "../../components/InteractiveChart";

type Timeframe = '1W' | '1M' | '1Y';

export default function AnalystPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y'); 
  
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  const [report, setReport] = useState<any | null>(null);

  // 1. Fetch Data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const daysMap = { '1W': 7, '1M': 30, '1Y': 365 };
      try {
        const res = await fetch(`/api/stock-data?days=${daysMap[timeframe]}`);
        const json = await res.json();
        if (json.success) {
            setChartData(json.data);
            setSelectedPoint(null); 
            setReport(null);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    }
    fetchData();
  }, [timeframe]);

  // 2. Handle Klik dari Chart
  const handleChartClick = (point: any) => {
    if (!point) return;

    console.log("⚡ Analysing:", point.date);
    setSelectedPoint(point);

    if (!chartData.length) return;

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

    // Fallback
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

  const correlation = useMemo(() => {
    if (!report) return { status: "WAITING FOR CLICK...", color: "text-slate-500", bg: "bg-slate-500/10", desc: "Silakan klik chart di atas untuk melihat analisis." };
    
    const g = report.goldGrowth;
    const a = report.archiGrowth;

    if (g > 0 && a < 0) return { status: "NEGATIVE DIVERGENCE", color: "text-red-400", bg: "bg-red-500/10", desc: "Bahaya: Emas naik, tapi saham ARCI malah turun." };
    if (g < 0 && a > 0) return { status: "OUTPERFORMANCE", color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "Kuat: ARCI mampu naik meski harga Emas turun." };
    if ((g > 0 && a > 0) || (g < 0 && a < 0)) return { status: "POSITIVE CORRELATION", color: "text-blue-400", bg: "bg-blue-500/10", desc: "Normal: Saham selaras dengan komoditas." };
    return { status: "NEUTRAL", color: "text-slate-400", bg: "bg-slate-500/10", desc: "Flat." };
  }, [report]);

  return (
    <div className="min-h-screen bg-[#020617] px-8 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-800 pb-6 gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                    🧠 Archi <span className="text-purple-500">Analyst AI</span>
                </h1>
                <p className="text-slate-400 text-sm">
                    Klik grafik (menggunakan posisi mouse) untuk analisis.
                </p>
            </div>
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['1W', '1M', '1Y'] as Timeframe[]).map((tf) => (
                    <button key={tf} onClick={() => setTimeframe(tf)} className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${timeframe === tf ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>{tf}</button>
                ))}
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative min-h-[500px]">
             <div className="flex justify-between items-center mb-4 ml-2">
                 <h2 className="text-lg font-bold">👆 Tap Chart to Analyze</h2>
                 <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700">Mode: {timeframe}</span>
             </div>

            {loading ? (
                <div className="h-[400px] flex items-center justify-center">Loading...</div>
            ) : (
                <InteractiveChart 
                    data={chartData} 
                    onPointClick={handleChartClick} 
                    selectedPoint={selectedPoint} 
                />
            )}
        </div>

        {/* Anomaly Table */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-yellow-500">🟡 Gold</h4>
                        {report && <span className={`text-xl font-black ${report.goldGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.goldGrowth.toFixed(2)}%</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{report ? `${formatUSD(report.startGold)} ➔ ${formatUSD(report.endGold)}` : '-'}</div>
                </div>
                <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-blue-500">🔵 ARCI</h4>
                        {report && <span className={`text-xl font-black ${report.archiGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>{report.archiGrowth.toFixed(2)}%</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-2">{report ? `${formatIDR(report.startArchi)} ➔ ${formatIDR(report.endArchi)}` : '-'}</div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                <h3 className="text-lg font-bold text-white mb-6">🕵️ Correlation & Anomaly Detector</h3>
                <div className="overflow-hidden rounded-xl border border-slate-800">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-bold">
                            <tr><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Insight</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                            <tr>
                                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-lg text-xs font-black border ${correlation.color} ${correlation.bg} border-transparent`}>{correlation.status}</span></td>
                                <td className="px-6 py-4 text-right text-slate-300 italic">"{correlation.desc}"</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}