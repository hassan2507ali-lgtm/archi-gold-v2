"use client";

import { useEffect, useState, useMemo } from "react";
import StockChart from "../components/StockChart";

export default function Home() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(365);
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);

  // 1. Fetch Data dari Backend
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stock-data?days=${timeframe}`);
        const json = await res.json();
        if (json.success) setChartData(json.data);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeframe]);

  // 2. Kalkulasi Korelasi Pearson (Data Analysis Skill)
  const correlation = useMemo(() => {
    if (chartData.length < 2) return 0;
    
    const x = chartData.map(d => d.archiChange);
    const y = chartData.map(d => d.goldChange);
    const n = chartData.length;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const num = (n * sumXY) - (sumX * sumY);
    const den = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

    return den === 0 ? 0 : num / den;
  }, [chartData]);

  const latest = chartData.length > 0 ? chartData[chartData.length - 1] : { archiChange: 0, goldChange: 0 };

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header & Controls Section */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              ArchiGold Terminal <span className="text-blue-500 text-2xl font-black">v2</span>
            </h1>
            <p className="text-slate-400 font-medium italic">
              Integrated Dashboard for Informatics Graduate Portfolio
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              {[{l:'1M',d:30}, {l:'6M',d:180}, {l:'1Y',d:365}].map((tf) => (
                <button
                  key={tf.l}
                  onClick={() => setTimeframe(tf.d)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                    timeframe === tf.d ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tf.l}
                </button>
              ))}
            </div>

            {/* Technical Toggles */}
            <div className="flex gap-2">
              <IndicatorBtn active={showMACD} label="MACD" onClick={() => setShowMACD(!showMACD)} color="pink" />
              <IndicatorBtn active={showRSI} label="RSI" onClick={() => setShowRSI(!showRSI)} color="purple" />
            </div>
          </div>
        </header>

        {/* Analytics Grid: Price Cards & Correlation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="ARCHI Perf." value={latest.archiChange} color="text-blue-400" />
          <StatCard title="Gold Perf." value={latest.goldChange} color="text-yellow-500" />
          
          {/* Correlation Score Card */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:bg-slate-900/60 transition-all">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Pearson Correlation (r)</p>
            <div className="flex items-baseline gap-3">
              <h3 className={`text-4xl font-black ${Math.abs(correlation) > 0.6 ? 'text-green-400' : 'text-slate-400'}`}>
                {correlation.toFixed(3)}
              </h3>
              <span className="text-[10px] font-black text-slate-500 uppercase px-2 py-0.5 bg-slate-800 rounded-md">
                {Math.abs(correlation) > 0.7 ? 'Strong' : 'Moderate'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Chart Visualization */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-slate-200">Comparative Performance Visualization</h2>
            <div className="text-[10px] font-bold text-slate-500 flex gap-4 uppercase tracking-tighter">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> Archi (Equity)</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Gold (Commodity)</span>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            {loading && (
              <div className="absolute inset-0 bg-[#020617]/40 backdrop-blur-sm z-30 flex items-center justify-center rounded-3xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-500 font-black text-xs uppercase tracking-widest">Processing Data...</p>
                </div>
              </div>
            )}
            <StockChart data={chartData} showMACD={showMACD} showRSI={showRSI} />
          </div>
        </div>
      </div>
    </main>
  );
}

// Reusable UI Components
function StatCard({ title, value, color }: any) {
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] group hover:border-slate-700 transition-all">
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">{title}</p>
      <h3 className={`text-5xl font-black ${color} tracking-tighter`}>
        {value >= 0 ? '+' : ''}{value.toFixed(2)}%
      </h3>
    </div>
  );
}

function IndicatorBtn({ active, label, onClick, color }: any) {
  const activeStyles = {
    pink: 'bg-pink-600 border-pink-500 text-white shadow-lg shadow-pink-900/20',
    purple: 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/20'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
        active ? activeStyles[color as keyof typeof activeStyles] : 'border-slate-800 text-slate-500 hover:border-slate-600'
      }`}
    >
      {label}
    </button>
  );
}