"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Trophy, TrendingUp, Target, Zap } from "lucide-react"

interface ProductionInsightCardProps {
  topMachine: string
  topClient: string
  avgEfficiency: number
}

export function ProductionInsightCard({ topMachine, topClient, avgEfficiency }: ProductionInsightCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="rounded-[24px] border-none shadow-sm bg-gradient-to-br from-indigo-500/10 to-transparent border-l-4 border-l-indigo-500 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-indigo-500 tracking-wider">Top Performer</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {topMachine || "Calculando..."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-none shadow-sm bg-gradient-to-br from-emerald-500/10 to-transparent border-l-4 border-l-emerald-500 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-600">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-emerald-500 tracking-wider">Top Client</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {topClient || "Calculando..."}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-none shadow-sm bg-gradient-to-br from-amber-500/10 to-transparent border-l-4 border-l-amber-500 overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-500 tracking-wider">Status</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize">
              {avgEfficiency >= 85 ? "Optimal" : avgEfficiency >= 75 ? "Stable" : "Needs Review"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
