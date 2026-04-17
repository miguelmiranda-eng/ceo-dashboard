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

const PURPLE = "#7c3aed"
const PURPLE_GLOW = "#a78bfa"

// Custom dark tooltip matching the reference image style
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div
      style={{
        background: "#1a1a2e",
        border: "1px solid #7c3aed44",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "inherit",
        minWidth: 140,
      }}
    >
      <p style={{ color: "#a78bfa", fontWeight: 900, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ color: "#a78bfa", fontSize: 11, fontWeight: 700, margin: "2px 0" }}>
        produced :{" "}
        <span style={{ color: "#a78bfa" }}>{d?.produced?.toLocaleString()}</span>
      </p>
      <p style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, margin: "2px 0" }}>
        setup :{" "}
        <span style={{ color: "#f59e0b" }}>{d?.avg_setup?.toFixed ? d.avg_setup.toFixed(1) : (d?.avg_setup ?? "—")}</span>
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
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-violet-500 rounded-sm" />
          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">
            {displayTitle}
          </CardTitle>
        </div>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-3">
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
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 700 }}
                  dy={6}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                  domain={[0, Math.ceil(maxVal * 1.15)]}
                  width={36}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#7c3aed18" }}
                />

                <Bar
                  dataKey="produced"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                >
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={PURPLE}
                      fillOpacity={0.9}
                      style={{
                        filter: `drop-shadow(0 0 6px ${PURPLE_GLOW}88)`,
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
