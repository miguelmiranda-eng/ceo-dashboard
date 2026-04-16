"use client"

import { useI18n } from "@/lib/i18n"
import { 
  BarChart3, 
  Settings, 
  Box, 
  ArrowRight,
  ChevronRight,
  Layers,
  Zap
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const ACTIONS = [
  {
    title: "Production Deep Dive",
    description: "Detailed throughput and client performance",
    href: "/dashboard/production",
    icon: BarChart3,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Asset Monitoring",
    description: "Live machine status and capacity planning",
    href: "/dashboard/machinery",
    icon: Zap,
    color: "bg-emerald-500/10 text-emerald-500",
  },
  {
    title: "Inventory Control",
    description: "Warehouse status and stock levels",
    href: "#",
    icon: Box,
    color: "bg-purple-500/10 text-purple-500",
  },
]

export function QuickActions() {
  const { t } = useI18n()

  return (
    <Card className="rounded-[24px] border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          Quick Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ACTIONS.map((action) => (
          <Link 
            key={action.title}
            href={action.href}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-white/5"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate leading-none mb-1 group-hover:text-primary transition-colors">
                  {action.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{action.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
