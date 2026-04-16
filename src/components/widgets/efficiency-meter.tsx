"use client"

import { useI18n } from "@/lib/i18n"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"

interface EfficiencyMeterProps {
  efficiency: number
}

export function EfficiencyMeter({ efficiency }: EfficiencyMeterProps) {
  const { t } = useI18n()
  
  // Calculate stroke-dasharray for a circle with radius 40
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (efficiency / 100) * circumference

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
          {t("efficiency")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div className="relative h-40 w-40">
          {/* Background Track */}
          <svg className="h-full w-full -rotate-90">
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Progress Bar */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#efficiencyGradient)"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="efficiencyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tighter">{efficiency}%</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Performance</span>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 w-full">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Baseline</p>
            <p className="text-sm font-bold">80%</p>
          </div>
          <div className="text-center border-l dark:border-slate-800">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Delta</p>
            <p className={`text-sm font-bold ${efficiency >= 80 ? "text-emerald-500" : "text-rose-500"}`}>
              {efficiency >= 80 ? "+" : ""}{efficiency - 80}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
