"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

interface TimelineData {
  date: string
  revenue: number
}

interface PipelineChartProps {
  data: TimelineData[]
}

export function PipelineChart({ data }: PipelineChartProps) {
  const { theme } = useTheme()

  if (!data || data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground font-bold uppercase tracking-wider text-xs">
        No forecast data yet
      </div>
    )
  }

  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }}
            className="text-muted-foreground/50"
          />
          <YAxis 
            hide 
            domain={['dataMin - 1000', 'dataMax + 2000']}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const val = payload[0].value as number
                return (
                  <div className="bg-[#0B1F3A] border border-[#F5F7FA]/20 px-3 py-2 rounded-md shadow-xl">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">{payload[0].payload.date}</p>
                    <p className="text-sm font-black text-[#F5F7FA] tracking-tighter">
                      ${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )
              }
              return null
            }}
            cursor={{ stroke: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0B1F3A' }}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
