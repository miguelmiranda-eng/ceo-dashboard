import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CalendarDays } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface ShiftsDonutProps {
  title?: string
  description?: string
}

export function ShiftsDonut({ title, description }: ShiftsDonutProps) {
  const { t } = useI18n()
  
  const displayTitle = title || t("shiftsTitle")
  const displayDescription = description || t("opShiftBalancer")

  // Data for operational shift balancer
  const data = [
    { name: t("dayShift"), value: 75, color: "#0ea5e9" }, // Prosper Sky
    { name: t("nightShift"), value: 25, color: "#64748b" } // Slate 500
  ]

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col relative group">
      <CardHeader className="pb-0 z-10">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <CalendarDays className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{displayTitle}</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {displayDescription}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 mt-4 flex items-center justify-center">
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{ filter: `drop-shadow(0px 0px 6px ${entry.color}80)` }} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, t("load")]}
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
