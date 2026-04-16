"use client"

import { Bell, AlertTriangle, Info, AlertCircle, Trash2, Check, ExternalLink } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useNotifications, Notification } from "@/hooks/use-notifications"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming it exists, if not I'll use div
import { cn } from "@/lib/utils"
import Link from "next/link"

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, clearAll, loading } = useNotifications()
  const { t } = useI18n()

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-rose-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default: return <Info className="h-5 w-5 text-[#0ea5e9]" />
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-xl relative">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#0ea5e9] rounded-full border-2 border-white dark:border-slate-950 animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 border-l border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl">
        <SheetHeader className="p-6 border-b border-slate-100 dark:border-slate-900 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              {t("notifications")}
              {unreadCount > 0 && (
                <Badge variant="secondary" className="rounded-full px-2 h-5 bg-[#0ea5e9]/10 text-[#0ea5e9] border-none">
                  {unreadCount} new
                </Badge>
              )}
            </SheetTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="text-slate-500 hover:text-[#0ea5e9] transition-colors h-8 px-2"
          >
            <Trash2 className="h-4 w-4 mr-1.5" />
            <span className="text-xs font-bold uppercase tracking-wider">{t("clearAll")}</span>
          </Button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center p-8 opacity-50">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-slate-300" />
              </div>
              <p className="font-medium text-slate-500">{t("noNotifications")}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-900">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-6 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 group relative",
                    !n.read && "bg-primary/5 dark:bg-primary/10"
                  )}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <p className={cn("font-bold", !n.read ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                          {n.title}
                        </p>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                          {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{n.message}</p>
                      
                      <div className="pt-3 flex items-center gap-2">
                        {n.machineId && (
                          <Link href="/dashboard/machinery">
                            <Button variant="outline" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider gap-1.5 rounded-lg">
                              <ExternalLink className="h-3 w-3" />
                              {t("viewMachine")}
                            </Button>
                          </Link>
                        )}
                        {!n.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(n.id)}
                            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/10 rounded-lg"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
