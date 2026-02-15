"use client";

import { useEffect, useState, useMemo } from "react";
import StockChart from "../components/StockChart";

export default function Home() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(365);
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [independentScale, setIndependentScale] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // State Filter Tanggal
  const [startDate, setStartDate] = useState(""); // Filter Aktif
  const [endDate, setEndDate] = useState("");   // Filter Aktif
  const [tempStart, setTempStart] = useState(""); // Input User (Sementara)
  const [tempEnd, setTempEnd] = useState("");   // Input User (Sementara)

  useEffect(() => {
    setIsMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/stock-data?days=${timeframe}`);
        const json = await res.json();
        if (json.success) {
            setChartData(json.data);
            
            // Set default filter ke 30 hari terakhir saat data baru dimuat
            if (json.data.length > 0) {
                const lastDate = json.data[json.data.length - 1].date;
                const firstDate = json.data[Math.max(0, json.data.length - 30)].date;
                
                // Set Aktif & Temporary
                setEndDate(lastDate);
                setStartDate(firstDate);
                setTempEnd(lastDate);
                setTempStart(firstDate);
            }
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [timeframe]);

  const latest = chartData.length > 0
    ? chartData[chartData.length - 1]
    : { archiChange: 0, goldChange: 0, rawArchi: 0, rawGold: 0 };

  // Batasan Tanggal (Min/Max) berdasarkan data yang ada
  const minDateAvailable = chartData.length > 0 ? chartData[0].date : "";
  const maxDateAvailable = chartData.length > 0 ? chartData[chartData.length - 1].date : "";

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);
  const formatUSD = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  // Filter Logika: Hanya jalan kalau startDate/endDate berubah (saat tombol ditekan)
  const filteredTableData = useMemo(() => {
    if (!startDate || !endDate) return [];
    
    // Filter dan Reverse agar yang terbaru di atas
    return [...chartData].reverse().filter(row => {
        const rowDate = row.date;
        return rowDate >= startDate && rowDate <= endDate;
    });
  }, [chartData, startDate, endDate]);

  // Handler Tombol Filter
  const handleApplyFilter = () => {
    if (tempStart && tempEnd) {
        setStartDate(tempStart);
        setEndDate(tempEnd);
    }
  };

  // Handler Reset Filter (30 Hari Terakhir)
  const handleResetFilter = () => {
      if (chartData.length > 0) {
        const lastDate = chartData[chartData.length - 1].date;
        const firstDate = chartData[Math.max(0, chartData.length - 30)].date;
        setTempStart(firstDate);
        setTempEnd(lastDate);
        setStartDate(firstDate);
        setEndDate(lastDate);
      }
  };

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100 font-sans">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-center gap-6">
        
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setIndependentScale(false)} className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${!independentScale ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>MODE GAP</button>
             <button onClick={() => setIndependentScale(true)} className={`px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${independentScale ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>MODE TREN</button>
          </div>
        </header>

        {/* Cards Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem]">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-3">ARCI / Lot (100 Shares)</p>
            <h3 className={`text-4xl font-black ${latest.archiChange >= 0 ? 'text-blue-400' : 'text-red-400'}`}>{latest.archiChange.toFixed(2)}%</h3>
            {isMounted && <p className="text-xl font-bold mt-2">{formatIDR(latest.rawArchi * 100)}</p>}
          </div>
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem]">
            <p className="text-slate-500 text-[10px] font-black uppercase mb-3">Gold Spot / oz</p>
            <h3 className={`text-4xl font-black ${latest.goldChange >= 0 ? 'text-yellow-500' : 'text-red-400'}`}>{latest.goldChange.toFixed(2)}%</h3>
            {isMounted && <p className="text-xl font-bold mt-2">{formatUSD(latest.rawGold)}</p>}
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Comparative Visuals</h2>
            <div className="flex gap-2">
               <button onClick={() => setShowMACD(!showMACD)} className={`px-4 py-2 rounded-xl text-[10px] font-black border ${showMACD ? 'bg-pink-600' : 'text-slate-500'}`}>MACD</button>
               <button onClick={() => setShowRSI(!showRSI)} className={`px-4 py-2 rounded-xl text-[10px] font-black border ${showRSI ? 'bg-purple-600' : 'text-slate-500'}`}>RSI</button>
            </div>
          </div>
          <StockChart data={chartData} showMACD={showMACD} showRSI={showRSI} independentScale={independentScale} />
           
           <div className="flex justify-center mt-6">
                <div className="flex bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
                {[{l:'1M',d:30}, {l:'6M',d:180}, {l:'1Y',d:365}].map((tf) => (
                    <button key={tf.l} onClick={() => setTimeframe(tf.d)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${timeframe === tf.d ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>{tf.l}</button>
                ))}
                </div>
            </div>
        </div>

        {/* Tabel Historical Gap Analysis dengan FILTER MANUAL */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📊 Historical Gap Data
              </h3>
              
              {/* Kontrol Filter */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="flex flex-col">
                      <label className="text-[9px] text-slate-500 font-bold ml-2 uppercase">From</label>
                      <input 
                        type="date" 
                        value={tempStart}
                        min={minDateAvailable}
                        max={tempEnd || maxDateAvailable}
                        onChange={(e) => setTempStart(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold px-2 py-1 outline-none border-b border-slate-700 focus:border-blue-500 transition-colors"
                      />
                  </div>
                  <span className="text-slate-500 pt-3">→</span>
                  <div className="flex flex-col">
                      <label className="text-[9px] text-slate-500 font-bold ml-2 uppercase">To</label>
                       <input 
                        type="date" 
                        value={tempEnd}
                        min={tempStart || minDateAvailable}
                        max={maxDateAvailable}
                        onChange={(e) => setTempEnd(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold px-2 py-1 outline-none border-b border-slate-700 focus:border-blue-500 transition-colors"
                      />
                  </div>
                  
                  {/* Tombol Aksi */}
                  <div className="flex gap-1 ml-2">
                    <button 
                        onClick={handleApplyFilter}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black px-4 py-2 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        FILTER
                    </button>
                    <button 
                        onClick={handleResetFilter}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-bold px-3 py-2 rounded-lg transition-all"
                        title="Reset to last 30 days"
                    >
                        ↺
                    </button>
                  </div>
              </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 rounded-l-xl">Date</th>
                  <th className="px-6 py-4">Gold (USD)</th>
                  <th className="px-6 py-4">ARCI (IDR)</th>
                  <th className="px-6 py-4">Gold Growth</th>
                  <th className="px-6 py-4">ARCI Growth</th>
                  <th className="px-6 py-4 rounded-r-xl">Gap (Selisih)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTableData.length > 0 ? (
                    filteredTableData.map((row, i) => {
                    const gap = row.archiChange - row.goldChange;
                    return (
                        <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-300">{row.date}</td>
                        <td className="px-6 py-4 font-mono text-yellow-500">{formatUSD(row.rawGold)}</td>
                        <td className="px-6 py-4 font-mono text-blue-400">{formatIDR(row.rawArchi)}</td>
                        <td className={`px-6 py-4 font-bold ${row.goldChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {row.goldChange.toFixed(2)}%
                        </td>
                        <td className={`px-6 py-4 font-bold ${row.archiChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {row.archiChange.toFixed(2)}%
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${gap >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {gap > 0 ? '+' : ''}{gap.toFixed(2)}%
                            </span>
                        </td>
                        </tr>
                    )
                    })
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center flex flex-col items-center justify-center text-slate-500 italic gap-2">
                            <span className="text-2xl">📅</span>
                            No data found in this range. <br/>
                            <span className="text-xs not-italic">Try adjusting the filter or changing the main timeframe (1M/6M/1Y).</span>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}