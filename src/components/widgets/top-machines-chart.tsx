import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { useI18n } from "@/lib/i18n"

interface TopMachinesProps {
  data: { machine: string; produced: number }[]
  title?: string
  description?: string
}

export function TopMachinesChart({ 
  data, 
  title, 
  description 
}: TopMachinesProps) {
  const { t } = useI18n()

  const displayTitle = title || t("byMachine")
  const displayDesc = description || t("industrialAnalyticsEngine")

  const chartData = data.map((d) => ({
    name: d.machine.replace("MAQUINA ", "M-"),
    produced: d.produced,
  }))

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary rounded-sm" />
          <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{displayTitle}</CardTitle>
        </div>
        <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-3">
          {displayDesc}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center min-h-[240px]">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{t("noTelemetry")}</p>
          </div>
        ) : (
          <div className="h-[240px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: -10, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  width={40} 
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 'bold' }} 
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)", opacity: 0.1 }}
                  formatter={(v: number) => [v.toLocaleString(), t("producedTitle")]}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    borderRadius: 12, 
                    border: "1px solid var(--border)", 
                    fontSize: 10,
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    color: "var(--foreground)"
                  }}
                />
                <Bar 
                  dataKey="produced" 
                  radius={[0, 10, 10, 0]} 
                  barSize={12}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? "#0ea5e9" : "var(--muted-foreground)"} 
                      fillOpacity={index === 0 ? 1 : 0.6}
                      style={{ filter: index === 0 ? "drop-shadow(0 0 8px rgba(14,165,233,0.4))" : "none" }}
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
