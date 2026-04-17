"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, TrendingUp } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface TopClientsProps {
  data: { client: string; produced: number }[]
  title?: string
  description?: string
}

export function TopClientsCard({ data, title, description }: TopClientsProps) {
  const { t } = useI18n()
  
  const displayTitle = title || t("topClientsTitle")
  const displayDesc = description || t("clientPortfolioImpact")

  // Take top 5 clients
  const topData = [...data].sort((a, b) => b.produced - a.produced).slice(0, 5)

  return (
    <Card className="rounded-md border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col relative group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
         <Users className="h-24 w-24 text-primary" />
      </div>
      
      <CardHeader className="pb-0 z-10 px-6 mt-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-none bg-primary text-white shadow-[0_4px_10px_rgba(30,91,255,0.3)]">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xs font-extrabold uppercase tracking-[0.1em] text-foreground">{displayTitle}</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
              {displayDesc}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 mt-6 z-10">
        <div className="space-y-4">
          {topData.length === 0 ? (
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">{t("noTelemetry")}</p>
          ) : (
            topData.map((item, idx) => (
              <div key={item.client} className="group/item">
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-[11px] font-extrabold uppercase tracking-tight text-foreground/80 group-hover/item:text-primary transition-colors">
                    {idx + 1}. {item.client}
                  </span>
                  <span className="text-[10px] font-extrabold tabular-nums text-muted-foreground">
                    {item.produced.toLocaleString()} <span className="opacity-50 ml-0.5">{t("unitsDay")}</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-none transition-all duration-1000"
                    style={{ 
                      width: `${(item.produced / (topData[0]?.produced || 1)) * 100}%`,
                      opacity: 1 - (idx * 0.15)
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      
      <div className="p-4 border-t border-border bg-sidebar-accent/50 mt-auto">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-primary" />
              <span className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{t("globalEfficiency")}</span>
           </div>
           <span className="text-[10px] font-extrabold text-foreground">TOP PORTFOLIO</span>
         </div>
      </div>
    </Card>
  )
}
