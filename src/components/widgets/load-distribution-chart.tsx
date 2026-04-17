import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

interface LoadDistributionProps {
  machines: { loadStatus?: string }[]
  title?: string
  description?: string
}

const COLORS = {
  primary: "#1E5BFF",   // Royal Blue (Normal)
  secondary: "#6B7280", // Gray (High)
  active: "#FFFFFF",    // White (Critical - High Contrast)
  muted: "#1A1A1A",     // Dark Gray (Idle)
}

export function LoadDistributionChart({ 
  machines, 
  title, 
  description 
}: LoadDistributionProps) {
  const { t } = useI18n()

  const displayTitle = title || t("loadDistributionTitle")
  const displayDesc = description || t("loadDistributionDesc")

  const chartData = useMemo(() => {
    let green = 0, yellow = 0, red = 0, idle = 0
    machines.forEach((m) => {
      if (m.loadStatus === "green") green++
      else if (m.loadStatus === "yellow") yellow++
      else if (m.loadStatus === "red") red++
      else idle++
    })

    const total = machines.length
    if (total === 0) return []

    return [
      { name: t("statusNormal"), value: green, color: COLORS.primary },
      { name: t("statusHigh"), value: yellow, color: COLORS.secondary },
      { name: t("statusCritical"), value: red, color: COLORS.active },
      { name: t("statusIdle"), value: idle, color: COLORS.muted },
    ].filter(d => d.value > 0)
  }, [machines, t])

  return (
    <Card className="rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2 px-6 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-6 bg-primary rounded-none" />
          <CardTitle className="text-xs font-extrabold uppercase tracking-[0.1em] text-foreground">{displayTitle}</CardTitle>
        </div>
        <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground ml-3.5 mt-1">
          {displayDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4 flex flex-col justify-center">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center min-h-[250px]">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("noTelemetry")}</p>
          </div>
        ) : (
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ filter: `drop-shadow(0 0 6px ${entry.color}44)` }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [(value as number).toLocaleString(), t("units")]}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    borderRadius: 12, 
                    border: "1px solid var(--border)", 
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)", 
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    color: "var(--foreground)"
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="square"
                  formatter={(value) => <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground px-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
