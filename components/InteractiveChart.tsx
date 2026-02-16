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
  
  // SOLUSI: Ganti useState jadi useRef
  // useRef menyimpan data secara 'diam-diam' tapi instan & selalu up-to-date
  const hoverDataRef = useRef<any | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Saat data baru masuk (ganti timeframe), reset ref ke data terakhir
  useEffect(() => {
    if (data && data.length > 0) {
        hoverDataRef.current = data[data.length - 1];
    }
  }, [data]);

  if (!isMounted || !data || data.length === 0) {
    return <div className="h-[500px] w-full animate-pulse bg-slate-800/20 rounded-[2rem]" />;
  }

  return (
    <div 
      className="h-[500px] w-full p-2 select-none relative z-10 cursor-crosshair"
      // EVENT CLICK DI CONTAINER UTAMA
      onClick={() => {
        // Ambil langsung dari Ref (Pasti data terbaru yang ditunjuk mouse)
        const currentData = hoverDataRef.current;
        
        if (currentData) {
          console.log("🎯 ACCURATE CLICK:", currentData.date); // Cek console
          onPointClick(currentData);
        }
      }}
    >
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
            data={data}
            // UPDATE REF SECARA INSTAN SAAT MOUSE GERAK
            onMouseMove={(e: any) => {
                if (e && e.activePayload && e.activePayload.length > 0) {
                    // Langsung simpan ke Ref tanpa re-render (Sangat Cepat)
                    hoverDataRef.current = e.activePayload[0].payload;
                }
            }}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} minTickGap={40} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />

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
                activeDot={{ r: 8, strokeWidth: 2, stroke: "white" }} 
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
                activeDot={{ r: 8, strokeWidth: 2, stroke: "white" }} 
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
        *Klik area grafik untuk melihat analisis detail.
      </p>
    </div>
  );
}