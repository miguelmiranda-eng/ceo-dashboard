"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts"
import { useI18n } from "@/lib/i18n"

interface TopMachinesProps {
  data: { machine: string; produced: number; avg_setup?: number }[]
  title?: string
  description?: string
}

const ROYAL_BLUE = "#1E5BFF"
const DEEP_NAVY = "#0B1F3A"

// Custom dark tooltip matching the reference image style
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div
      style={{
        background: "#0B1F3A",
        border: "1px solid #1E5BFF44",
        borderRadius: 4,
        padding: "10px 14px",
        fontFamily: "inherit",
        minWidth: 140,
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
    >
      <p style={{ color: "#FFFFFF", fontWeight: 800, fontSize: 13, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ color: "#1E5BFF", fontSize: 11, fontWeight: 800, margin: "4px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {t("producedTitle")} :{" "}
        <span style={{ color: "#FFFFFF" }}>{d?.produced?.toLocaleString()}</span>
      </p>
      <p style={{ color: "#6B7280", fontSize: 11, fontWeight: 700, margin: "2px 0", textTransform: "uppercase", letterSpacing: "0.01em" }}>
        {t("averageSetup")} :{" "}
        <span style={{ color: "#F5F7FA" }}>{d?.avg_setup?.toFixed ? d.avg_setup.toFixed(1) : (d?.avg_setup ?? "—")} min</span>
      </p>
    </div>
  )
}

export function TopMachinesChart({
  data,
  title,
  description,
}: TopMachinesProps) {
  const { t } = useI18n()

  const displayTitle = title || t("byMachine")
  const displayDesc = description || t("industrialAnalyticsEngine")

  const chartData = data.map((d) => ({
    name: d.machine.replace(/MAQUINA\s?/i, "M"),
    produced: d.produced,
    avg_setup: d.avg_setup ?? 0,
  }))

  const maxVal = Math.max(...chartData.map((d) => d.produced), 1)

  return (
    <Card className="rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2 px-6 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-6 bg-primary rounded-none" />
          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">
            {displayTitle}
          </CardTitle>
        </div>
        <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-3.5 mt-1">
          {displayDesc}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center min-h-[260px]">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
              {t("noTelemetry")}
            </p>
          </div>
        ) : (
          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
                {/* Dotted grid matching reference */}
                <CartesianGrid
                  vertical={false}
                  stroke="#ffffff18"
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9ca3af", fontWeight: 700 }}
                  dy={10}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  domain={[0, Math.ceil(maxVal * 1.15)]}
                  width={40}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(30, 91, 255, 0.05)" }}
                />

                <Bar
                  dataKey="produced"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={48}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={ROYAL_BLUE}
                      style={{
                        filter: "drop-shadow(0 0 10px rgba(30,91,255,0.4))",
                      }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
