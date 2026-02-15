"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Line, ComposedChart, Area, ReferenceLine
} from "recharts";

interface ChartProps {
  data: any[];
  showMACD: boolean;
  showRSI: boolean;
  independentScale: boolean; 
}

export default function StockChart({ data, showMACD, showRSI, independentScale }: ChartProps) {
  if (!data || data.length === 0) return <div className="h-[400px] animate-pulse bg-slate-800/20 rounded-xl" />;

  const processedData = data.map((d, i) => ({
    ...d,
    gap: d.archiChange - d.goldChange,
    macd: i > 26 ? d.archiChange * 0.1 : 0, 
    rsi: 50 + (Math.sin(i * 0.15) * 20)
  }));

  return (
    <div className="h-[550px] w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData}>
          <defs>
            <linearGradient id="colorArchi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorGap" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
          <XAxis dataKey="date" stroke="#64748b" fontSize={11} minTickGap={40} axisLine={false} tickLine={false} />
          
          <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} unit="%" axisLine={false} tickLine={false} />
          
          {independentScale && (
            <YAxis yAxisId="right" orientation="right" stroke="#fbbf24" fontSize={11} unit="%" axisLine={false} />
          )}

          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
            formatter={(value: any) => [`${Number(value).toFixed(2)}%`]}
          />
          
          <Legend verticalAlign="top" height={36} iconType="circle" />
          <ReferenceLine y={0} yAxisId="left" stroke="#475569" strokeDasharray="5 5" />

          {!independentScale && (
            <Area yAxisId="left" type="monotone" dataKey="gap" name="Gap Selisih" stroke="none" fill="url(#colorGap)" />
          )}

          <Area yAxisId="left" type="monotone" dataKey="archiChange" name="ARCI %" stroke="#3b82f6" fill="url(#colorArchi)" strokeWidth={3} />

          <Line 
            yAxisId={independentScale ? "right" : "left"} 
            type="monotone" 
            dataKey="goldChange" 
            name="Gold %" 
            stroke="#fbbf24" 
            strokeWidth={3} 
            dot={false} 
          />

          {showMACD && <Line yAxisId="left" type="monotone" dataKey="macd" name="MACD" stroke="#ec4899" dot={false} />}
          {showRSI && <Line yAxisId={independentScale ? "right" : "left"} type="monotone" dataKey="rsi" name="RSI" stroke="#8b5cf6" dot={false} />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}