"use client";

import { useState, useEffect, useRef } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine, ReferenceDot
} from "recharts";

interface ChartProps {
  data: any[];
  onPointClick: (dataPoint: any) => void;
  selectedPoint: any | null;
}

export default function InteractiveChart({ data, onPointClick, selectedPoint }: ChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null); // Ref untuk mengukur lebar container

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data || data.length === 0) {
    return <div className="h-[500px] w-full animate-pulse bg-slate-800/20 rounded-[2rem]" />;
  }

  // --- LOGIKA MATEMATIKA MURNI ---
  const handleManualClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !data.length) return;

    // 1. Ambil ukuran kotak grafik
    const rect = containerRef.current.getBoundingClientRect();
    
    // 2. Hitung posisi X mouse relatif terhadap kotak (0px sampai Lebarpx)
    const x = e.clientX - rect.left;
    const width = rect.width;

    // 3. Hindari pembagian nol
    if (width === 0) return;

    // 4. Hitung persentase posisi (0.0 sampai 1.0)
    // Kita kurangi sedikit margin kiri/kanan (sekitar 60px padding grafik)
    // agar akurasinya pas di tengah area gambar.
    const effectiveWidth = width - 60; // Kompensasi margin Recharts
    const effectiveX = x - 50; // Kompensasi YAxis kiri
    
    let percentage = effectiveX / effectiveWidth;

    // Clamp persentase antara 0 dan 1
    if (percentage < 0) percentage = 0;
    if (percentage > 1) percentage = 1;

    // 5. Konversi persentase ke Index Array Data
    const index = Math.floor(percentage * (data.length - 1));

    // 6. Ambil data
    const clickedItem = data[index];

    console.log(`📍 MANUAL CALC: x=${x}/${width} | idx=${index} | date=${clickedItem?.date}`);
    
    if (clickedItem) {
      onPointClick(clickedItem);
    }
  };

  return (
    // Pasang Ref dan OnClick di DIV Pembungkus
    <div 
      ref={containerRef}
      className="h-[500px] w-full p-2 select-none relative z-10 cursor-crosshair"
      onClick={handleManualClick} // KLIK PAKE MATEMATIKA
    >
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data}
            margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorArchi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
            
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              fontSize={11} 
              minTickGap={40} 
              axisLine={false} 
              tickLine={false} 
            />
            <YAxis 
              yAxisId="left" 
              stroke="#8b5cf6" 
              fontSize={11} 
              axisLine={false} 
              tickLine={false} 
              domain={['auto', 'auto']} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#eab308" 
              fontSize={11} 
              axisLine={false} 
              tickLine={false} 
              domain={['auto', 'auto']} 
            />

            {/* Tooltip tetap visual saja */}
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
              wrapperStyle={{ pointerEvents: 'none' }} 
            />
            
            <Legend verticalAlign="top" height={36} wrapperStyle={{ pointerEvents: 'none' }} />

            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="rawArchi" 
              name="Archi Price (IDR)" 
              stroke="#8b5cf6" 
              fill="url(#colorArchi)" 
              strokeWidth={2} 
              activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} 
              isAnimationActive={false} 
            />
            
            <Area 
              yAxisId="right" 
              type="monotone" 
              dataKey="rawGold" 
              name="Gold Price (USD)" 
              stroke="#eab308" 
              fill="url(#colorGold)" 
              strokeWidth={2} 
              activeDot={{ r: 6, strokeWidth: 2, stroke: "white" }} 
              isAnimationActive={false}
            />

            {selectedPoint && (
              <>
                <ReferenceLine yAxisId="left" x={selectedPoint.date} stroke="white" strokeDasharray="3 3" />
                <ReferenceDot yAxisId="left" x={selectedPoint.date} y={selectedPoint.rawArchi} r={6} fill="#8b5cf6" stroke="white" />
                <ReferenceDot yAxisId="right" x={selectedPoint.date} y={selectedPoint.rawGold} r={6} fill="#eab308" stroke="white" />
              </>
            )}

          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <p className="text-center text-[10px] text-slate-500 mt-2 italic">
        *Klik area grafik (kiri-kanan) untuk memilih tanggal.
      </p>
    </div>
  );
}