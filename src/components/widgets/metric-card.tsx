"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: keyof typeof colorMap
  topRightBadge?: string
  description?: string
  delta?: string | number
}

const colorMap = {
  primary: "text-white border-primary bg-primary shadow-[0_4px_10px_rgba(30,91,255,0.3)]",
  secondary: "text-primary border-primary/20 bg-primary/10",
  muted: "text-muted-foreground border-border bg-muted/50",
  dark: "text-white border-foreground bg-foreground",
  emerald: "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 shadow-[0_2px_10px_rgba(16,185,129,0.15)]",
  sky: "text-sky-500 border-sky-500/20 bg-sky-500/10 shadow-[0_2px_10px_rgba(14,165,233,0.15)]",
  orange: "text-orange-500 border-orange-500/20 bg-orange-500/10 shadow-[0_2px_10px_rgba(249,115,22,0.15)]",
  red: "text-rose-500 border-rose-500/20 bg-rose-500/10 shadow-[0_2px_10px_rgba(244,63,94,0.15)]",
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "emerald",
  topRightBadge,
}: MetricCardProps) {
  // Use a fallback for iconColor if it's not in our map
  const colorKey = (iconColor as any) in colorMap ? iconColor : "primary"

  return (
    <Card className="rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group hover:border-primary/40">
      {/* Subtle top glow line based on color - themed */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-opacity`} />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          {/* Icon Box */}
          <div className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-transform group-hover:scale-105 ${colorMap[colorKey as keyof typeof colorMap]}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Top Right Badge / Metric */}
          {topRightBadge && (
            <div className="py-1 px-3 rounded-full bg-muted border border-border flex items-center gap-1.5 shadow-sm">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">{topRightBadge}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground/70">{title}</h3>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
