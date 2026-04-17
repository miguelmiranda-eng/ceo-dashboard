"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const chartConfig = {
  value: {
    label: "Units",
    color: "#1E5BFF",
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
    <Card className="rounded-md border border-border bg-card overflow-hidden flex flex-col h-full shadow-sm relative group hover:shadow-md transition-all duration-300">
      <CardHeader className="pb-0 z-10 px-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 bg-primary rounded-none" />
              <CardTitle className="text-sm font-extrabold uppercase tracking-[0.1em] text-foreground">{title}</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-3.5 mt-1">
              {description}
            </CardDescription>
          </div>
          <div className="py-1 px-3 rounded-none bg-primary text-white flex items-center gap-1.5 shadow-[0_4px_10px_rgba(30,91,255,0.3)]">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[11px] font-bold uppercase tracking-[0.05em]">{t("unitsDay")}</span>
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
                <linearGradient id="fillRoyalGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E5BFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#1E5BFF" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }}
                dy={12}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.toLocaleString()}
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 600 }}
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
                stroke="#1E5BFF"
                strokeWidth={3}
                fill="url(#fillRoyalGlow)"
                style={{ filter: "drop-shadow(0px 0px 10px rgba(30,91,255,0.5))" }}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
