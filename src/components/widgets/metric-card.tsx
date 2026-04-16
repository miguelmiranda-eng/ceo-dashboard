"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: "green" | "blue" | "orange" | "red"
  topRightBadge?: string
  description?: string
  delta?: string | number
}

const colorMap = {
  emerald: "text-emerald-500 border-emerald-500/50 bg-emerald-500/10",
  sky: "text-[#0ea5e9] border-[#0ea5e9]/50 bg-[#0ea5e9]/10",
  orange: "text-orange-500 border-orange-500/50 bg-orange-500/10",
  red: "text-rose-500 border-rose-500/50 bg-rose-500/10",
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "emerald",
  topRightBadge,
}: MetricCardProps) {
  // Use a fallback for iconColor if it's not in our map
  const colorKey = (iconColor as any) in colorMap ? iconColor : "emerald"

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:border-primary/20">
      {/* Subtle top glow line based on color - themed */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          {/* Icon Circle */}
          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${colorMap[colorKey]}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Top Right Badge / Metric */}
          {topRightBadge && (
            <div className="py-1 px-3 rounded-full bg-muted/50 border border-border flex items-center gap-1.5 shadow-sm">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{topRightBadge}</span>
              <div className="h-3 w-3 rounded-full border border-muted-foreground/30 flex items-center justify-center">
                <span className="text-[6px] text-muted-foreground">i</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/70">{title}</h3>
          <div className="text-3xl font-black text-foreground tracking-tighter">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
