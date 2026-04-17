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
import { Machine } from "@/lib/api"

interface MachineLoadProps {
  data: Machine[]
  title?: string
  description?: string
}

const BRAND = "#0ea5e9"
const BRAND_GLOW = "#38bdf8"

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div
      style={{
        background: "#0c1a2e",
        border: "1px solid #0ea5e944",
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily: "inherit",
        minWidth: 160,
      }}
    >
      <p style={{ color: "#38bdf8", fontWeight: 900, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 700, margin: "2px 0" }}>
        remaining:{" "}
        <span style={{ color: "#e0f2fe" }}>{d?.remaining?.toLocaleString() ?? "—"}</span>
      </p>
      <p style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700, margin: "2px 0" }}>
        setup:{" "}
        <span style={{ color: "#fde68a" }}>
          {d?.avgSetup ? `${Number(d.avgSetup).toFixed(1)} min` : "—"}
        </span>
      </p>
      {d?.orders?.length > 0 && (
        <p style={{ color: "#64748b", fontSize: 10, fontWeight: 600, marginTop: 5 }}>
          {d.orders.join(" · ")}
        </p>
      )}
    </div>
  )
}

export function MachineLoadBars({ data, title, description }: MachineLoadProps) {
  const { t } = useI18n()

  const displayTitle = title || t("machineLoadTitle")
  const displayDesc = description || t("plantResourceView")

  const chartData = data
    .filter(m => m.status === "active")
    .map(m => ({
      name: m.id.replace(/MAQUINA\s?/i, "M"),
      remaining: m.remainingPieces ?? 0,
      avgSetup: m.avgSetup ?? 0,
      orders: m.activeOrders ?? [],
    }))
    .sort((a, b) => b.remaining - a.remaining)

  const maxVal = Math.max(...chartData.map(d => d.remaining), 1)

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded-sm" />
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
          <div className="h-[380px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barCategoryGap="30%"
              >
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
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                  }
                  domain={[0, Math.ceil(maxVal * 1.15)]}
                  width={36}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#7c3aed18" }}
                />
                <Bar dataKey="remaining" radius={[4, 4, 0, 0]} maxBarSize={52}>
                  {chartData.map((_, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={BRAND}
                      fillOpacity={0.9}
                      style={{ filter: `drop-shadow(0 0 8px ${BRAND_GLOW}99)` }}
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
