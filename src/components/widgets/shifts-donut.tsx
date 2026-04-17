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
    { name: t("dayShift"), value: 75, color: "#1E5BFF" }, // Royal Blue
    { name: t("nightShift"), value: 25, color: "#1A1A1A" } // Dark Gray
  ]

  return (
    <Card className="rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col relative group">
      <CardHeader className="pb-0 z-10 px-6 mt-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-none bg-primary text-white shadow-[0_4px_10px_rgba(30,91,255,0.3)]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xs font-extrabold uppercase tracking-[0.1em] text-foreground">{displayTitle}</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
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
                   backgroundColor: '#0B1F3A',
                   borderRadius: 4, 
                   border: "1px solid #1E5BFF44", 
                   fontSize: 10,
                   fontWeight: "bold",
                   textTransform: "uppercase",
                   color: "#FFFFFF"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
