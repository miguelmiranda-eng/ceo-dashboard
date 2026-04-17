import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface EfficiencyRadialProps {
  efficiency: number
  title?: string
  description?: string
}

export function EfficiencyRadialChart({ 
  efficiency, 
  title, 
  description 
}: EfficiencyRadialProps) {
  const { t } = useI18n()
  
  const displayTitle = title || t("globalEfficiencyTitle")
  const displayDesc = description || t("globalEfficiencyDesc")

  // We'll create a single data point for the radial bar
  const data = [
    {
      name: t("efficiency"),
      value: efficiency > 100 ? 100 : efficiency,
      fill: "#1E5BFF",
    }
  ]

  return (
    <Card className="rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center relative h-full">
      <CardHeader className="pb-0 w-full text-center z-10 px-6 mt-2">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">{displayTitle}</CardTitle>
          </div>
          <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
            {displayDesc}
          </CardDescription>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 w-full flex items-center justify-center p-0 relative">
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
             <RadialBarChart 
               cx="50%" 
               cy="50%" 
               innerRadius="70%" 
               outerRadius="100%" 
               barSize={20} 
               data={data}
               startAngle={225}
               endAngle={-45}
             >
               <PolarAngleAxis
                 type="number"
                 domain={[0, 100]}
                 angleAxisId={0}
                 tick={false}
               />
               <RadialBar
                 background={{ fill: 'var(--muted)', opacity: 0.2 }}
                 dataKey="value"
                 cornerRadius={0}
                 style={{ filter: "drop-shadow(0 0 12px rgba(30,91,255,0.4))" }}
               />
             </RadialBarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8 pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-extrabold tracking-tight text-foreground">
              {efficiency}
            </span>
            <span className="text-xl font-bold text-muted-foreground">%</span>
          </div>
          <div className={`mt-2 px-4 py-1.5 rounded-none border text-[11px] font-extrabold uppercase tracking-[0.05em] ${
            efficiency >= 80 ? 'bg-primary text-white border-primary shadow-[0_4px_10px_rgba(30,91,255,0.4)]' : 'bg-background border-primary text-primary'
          }`}>
            {efficiency >= 80 ? t("statusOptimal") : t("statusRecovery")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
