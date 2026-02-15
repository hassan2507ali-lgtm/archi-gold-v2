"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, ReferenceLine, ReferenceDot
} from "recharts";

interface ChartProps {
  data: any[];
  onPointClick: (dataPoint: any) => void; // Fungsi callback saat diklik
  selectedPoint: any | null; // Data titik yang sedang dipilih
}

export default function InteractiveChart({ data, onPointClick, selectedPoint }: ChartProps) {
  if (!data || data.length === 0) return <div className="h-[400px] animate-pulse bg-slate-800/20 rounded-xl" />;

  return (
    <div className="h-[500px] w-full p-2 select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data}
          onClick={(e: any) => {
            // Logika untuk menangkap data saat chart diklik
            if (e && e.activePayload && e.activePayload.length > 0) {
              onPointClick(e.activePayload[0].payload);
            }
          }}
          className="cursor-crosshair" // Cursor jadi tanda tambah (+)
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
          
          {/* Dual Axis: Kiri Archi, Kanan Gold (Supaya pergerakan terlihat jelas) */}
          <YAxis yAxisId="left" stroke="#8b5cf6" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
          <YAxis yAxisId="right" orientation="right" stroke="#eab308" fontSize={11} axisLine={false} tickLine={false} domain={['auto', 'auto']} />

          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
            cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Legend verticalAlign="top" height={36} />

          <Area yAxisId="left" type="monotone" dataKey="rawArchi" name="Archi Price (IDR)" stroke="#8b5cf6" fill="url(#colorArchi)" strokeWidth={2} />
          <Area yAxisId="right" type="monotone" dataKey="rawGold" name="Gold Price (USD)" stroke="#eab308" fill="url(#colorGold)" strokeWidth={2} />

          {/* VISUALISASI KLIK: Garis Vertikal & Titik di tempat yang diklik */}
          {selectedPoint && (
            <>
              <ReferenceLine yAxisId="left" x={selectedPoint.date} stroke="white" strokeDasharray="3 3" />
              <ReferenceDot yAxisId="left" x={selectedPoint.date} y={selectedPoint.rawArchi} r={6} fill="#8b5cf6" stroke="white" />
              <ReferenceDot yAxisId="right" x={selectedPoint.date} y={selectedPoint.rawGold} r={6} fill="#eab308" stroke="white" />
            </>
          )}

        </AreaChart>
      </ResponsiveContainer>
      
      <p className="text-center text-[10px] text-slate-500 mt-2 italic">
        *Klik area grafik untuk melakukan analisis 'Point-in-Time'
      </p>
    </div>
  );
}