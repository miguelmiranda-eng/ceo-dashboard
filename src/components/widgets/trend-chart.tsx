"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const chartConfig = {
  value: {
    label: "Units",
    color: "#0ea5e9",
  },
}

interface TrendChartProps {
  data: { date: string; value: number }[]
  title?: string
  description?: string
}

export function TrendChart({ data, title = "PRODUCTION TREND", description = "INDUSTRIAL ANALYTICS ENGINE" }: TrendChartProps) {
  const { t } = useI18n()

  return (
    <Card className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-full shadow-sm relative group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-primary rounded-sm" />
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{title}</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-3">
              {description}
            </CardDescription>
          </div>
          <div className="py-1 px-3 rounded-full bg-primary/5 border border-primary/10 flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">{t("unitsDay")}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 mt-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-10 pointer-events-none" />
        <div className="h-[280px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillSkyGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                dy={10}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                dx={-10}
                orientation="left"
              />
              <ChartTooltip
                cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={3}
                fill="url(#fillSkyGlow)"
                style={{ filter: "drop-shadow(0px 0px 8px rgba(14,165,233,0.4))" }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
