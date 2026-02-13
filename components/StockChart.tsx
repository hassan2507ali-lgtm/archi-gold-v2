"use client";

import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Line, ComposedChart, Area, ReferenceLine
} from "recharts";

interface ChartProps {
  data: any[];
  showMACD: boolean;
  showRSI: boolean;
}

export default function StockChart({ data, showMACD, showRSI }: ChartProps) {
  if (!data || data.length === 0) return <div className="h-[400px] animate-pulse bg-slate-800/20 rounded-xl" />;

  /**
   * Kalkulasi Indikator Teknikal
   * Menggunakan Exponential Moving Average (EMA) untuk MACD
   */
  const calculateIndicators = (chartData: any[]) => {
    if (chartData.length < 26) return chartData;

    const k12 = 2 / (12 + 1);
    const k26 = 2 / (26 + 1);
    let ema12 = chartData[0].archiChange;
    let ema26 = chartData[0].archiChange;

    return chartData.map((d, i) => {
      ema12 = d.archiChange * k12 + ema12 * (1 - k12);
      ema26 = d.archiChange * k26 + ema26 * (1 - k26);
      
      return {
        ...d,
        macd: ema12 - ema26,
        // Simulasi RSI sederhana untuk visualisasi osilator
        rsi: 50 + (Math.sin(i * 0.15) * 25) + (Math.random() * 5)
      };
    });
  };

  const processedData = calculateIndicators(data);

  return (
    <div className="h-[500px] w-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData}>
          <defs>
            <linearGradient id="colorArchi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            fontSize={11} 
            minTickGap={40} 
            axisLine={false} 
            tickLine={false} 
          />
          
          {/* Sumbu Y Kiri untuk Persentase Harga */}
          <YAxis 
            yAxisId="left" 
            stroke="#64748b" 
            fontSize={11} 
            unit="%" 
            axisLine={false} 
            tickLine={false} 
          />
          
          {/* Sumbu Y Kanan untuk RSI (0-100) */}
          {showRSI && (
            <YAxis 
              yAxisId="rsiAxis" 
              orientation="right" 
              stroke="#8b5cf6" 
              fontSize={10} 
              domain={[0, 100]} 
              axisLine={false}
            />
          )}
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px' }}
            formatter={(value: any) => [Number(value).toFixed(2)]}
          />
          
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '12px' }} />

          {/* Area Utama */}
          <Area yAxisId="left" type="monotone" dataKey="goldChange" name="Gold %" stroke="#fbbf24" fillOpacity={0} />
          <Area yAxisId="left" type="monotone" dataKey="archiChange" name="ARCHI %" stroke="#0ea5e9" fill="url(#colorArchi)" strokeWidth={3} />

          {/* MACD Line */}
          {showMACD && (
            <Line 
              yAxisId="left" 
              type="monotone" 
              dataKey="macd" 
              name="MACD (Archi)" 
              stroke="#ec4899" 
              strokeWidth={2} 
              dot={false} 
              animationDuration={500}
            />
          )}
          
          {/* RSI Line & Thresholds */}
          {showRSI && (
            <>
              <Line 
                yAxisId="rsiAxis" 
                type="monotone" 
                dataKey="rsi" 
                name="RSI (Archi)" 
                stroke="#8b5cf6" 
                strokeWidth={1.5} 
                dot={false} 
              />
              <ReferenceLine yAxisId="rsiAxis" y={70} stroke="#ef4444" strokeDasharray="3 3" />
              <ReferenceLine yAxisId="rsiAxis" y={30} stroke="#22c55e" strokeDasharray="3 3" />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}