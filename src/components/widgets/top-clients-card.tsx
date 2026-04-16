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
    <Card className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col relative group">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
         <Users className="h-24 w-24 text-primary" />
      </div>
      
      <CardHeader className="pb-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-foreground">{displayTitle}</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
                  <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80 group-hover/item:text-primary transition-colors">
                    {idx + 1}. {item.client}
                  </span>
                  <span className="text-[10px] font-black tabular-nums text-muted-foreground">
                    {item.produced.toLocaleString()} <span className="opacity-50 ml-0.5">{t("unitsDay")}</span>
                  </span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-1000"
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
      
      <div className="p-4 border-t border-border bg-muted/30 mt-auto">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{t("globalEfficiency")}</span>
           </div>
           <span className="text-[10px] font-black text-foreground">TOP %5</span>
         </div>
      </div>
    </Card>
  )
}
