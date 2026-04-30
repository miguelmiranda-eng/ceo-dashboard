"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  className?: string
}

export function LoadingOverlay({ isLoading, message = "Processing...", className }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className={cn(
      "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300",
      className
    )}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
        <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" strokeWidth={2.5} />
      </div>
      
      <div className="mt-6 flex flex-col items-center gap-2 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-foreground animate-pulse text-center pl-[0.5em]">
          {message}
        </p>
        <div className="w-48 h-[2px] bg-slate-800 overflow-hidden rounded-full">
          <div className="w-full h-full bg-primary origin-left animate-loading-bar" />
        </div>
      </div>
    </div>
  )
}
