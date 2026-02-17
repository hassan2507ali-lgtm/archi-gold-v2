"use client";

import { useState, useEffect } from "react";

// Kumpulan Database Berita (Simulasi)
const NEWS_DATABASE = [
  { title: "The Fed Isyaratkan Pemangkasan Suku Bunga Agresif Tahun Ini", category: "GOLD", sentiment: "positive" },
  { title: "Produksi Emas Archi Indonesia (ARCI) Meningkat 15% di Q3", category: "ARCI", sentiment: "positive" },
  { title: "Konflik Geopolitik Timur Tengah Memanas, Investor Buru Safe Haven", category: "GOLD", sentiment: "positive" },
  { title: "Dolar AS Menguat Tajam Pasca Rilis Data NFP", category: "GOLD", sentiment: "negative" },
  { title: "ARCI Umumkan Pembagian Dividen Tunai Rp 50 per Lembar", category: "ARCI", sentiment: "positive" },
  { title: "Harga Emas Terkoreksi Akibat Aksi Profit Taking Global", category: "GOLD", sentiment: "negative" },
  { title: "Ekspansi Tambang Baru, ARCI Targetkan Kenaikan Cadangan Emas", category: "ARCI", sentiment: "positive" },
  { title: "Inflasi AS Masih Tinggi, Harapan Cut Rate Memudar", category: "GOLD", sentiment: "negative" },
  { title: "Analisa Teknikal: ARCI Berpotensi Breakout Resistance 450", category: "ARCI", sentiment: "positive" },
  { title: "Permintaan Emas Fisik China Melambat Bulan Ini", category: "GOLD", sentiment: "negative" },
  { title: "Laba Bersih ARCI Melonjak Didorong Efisiensi Biaya", category: "ARCI", sentiment: "positive" },
  { title: "Bank Sentral Dunia Borong Emas, Cadangan Devisa Naik", category: "GOLD", sentiment: "positive" },
];

export default function MarketNews() {
  const [newsFeed, setNewsFeed] = useState<any[]>([]);

  // 1. Initial Load
  useEffect(() => {
    // Ambil 4 berita acak pertama
    const initialNews = NEWS_DATABASE.sort(() => 0.5 - Math.random()).slice(0, 4).map(addTimestamp);
    setNewsFeed(initialNews);
  }, []);

  // 2. Real-time Simulator (Nambah berita baru tiap 5 detik)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomNews = NEWS_DATABASE[Math.floor(Math.random() * NEWS_DATABASE.length)];
      const newEntry = addTimestamp(randomNews);
      
      setNewsFeed(prev => {
        const updated = [newEntry, ...prev];
        return updated.slice(0, 6); // Keep only latest 6 items
      });
    }, 5000); // Update setiap 5 detik

    return () => clearInterval(interval);
  }, []);

  // Helper: Tambah jam saat ini biar terlihat real-time
  const addTimestamp = (item: any) => {
    const now = new Date();
    return {
      ...item,
      time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      id: Math.random().toString(36).substr(2, 9)
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          📰 Live Market News
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        </h3>
        <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">Auto-Update</span>
      </div>

      {/* News List */}
      <div className="space-y-3">
        {newsFeed.map((news) => (
          <div 
            key={news.id} 
            className="group flex items-start gap-4 p-3 rounded-xl bg-slate-950/50 border border-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800/50 transition-all animate-in slide-in-from-top-2 duration-500 cursor-pointer"
            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(news.title + " berita terkini")}`, '_blank')}
          >
            {/* Time */}
            <div className="text-xs text-slate-500 font-mono mt-0.5 whitespace-nowrap">
              {news.time}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 rounded ${news.category === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                  {news.category}
                </span>
                <span className={`text-[10px] font-bold px-1.5 rounded ${news.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {news.sentiment === 'positive' ? 'BULLISH ▲' : 'BEARISH ▼'}
                </span>
              </div>
              <h4 className="text-sm text-slate-200 font-medium group-hover:text-purple-400 transition-colors line-clamp-2">
                {news.title}
              </h4>
            </div>

            {/* Link Icon */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
              ↗
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}