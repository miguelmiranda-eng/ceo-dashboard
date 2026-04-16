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
      value: efficiency > 100 ? 100 : efficiency, // Cap at 100% for the visual arc
      fill: efficiency >= 80 ? "#0ea5e9" : "#f59e0b", // Prosper Sky or Amber 500
    }
  ]

  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col items-center relative h-full">
      <CardHeader className="pb-0 w-full text-center z-10">
        <div className="flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{displayTitle}</CardTitle>
          </div>
          <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                 background={{ fill: 'var(--muted)', opacity: 0.1 }}
                 dataKey="value"
                 cornerRadius={12}
                 style={{ filter: `drop-shadow(0 0 10px ${efficiency >= 80 ? 'rgba(14,165,233,0.4)' : 'rgba(245,158,11,0.3)'})` }}
               />
             </RadialBarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Center Text overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8 pointer-events-none">
          <div className="flex items-baseline gap-0.5">
            <span className="text-5xl font-black tracking-tighter text-foreground">
              {efficiency}
            </span>
            <span className="text-xl font-bold text-muted-foreground">%</span>
          </div>
          <div className={`mt-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
            efficiency >= 80 ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
          }`}>
            {efficiency >= 80 ? t("statusOptimal") : t("statusRecovery")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
