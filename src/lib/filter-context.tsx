"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"
import { DashboardFilters, DashboardData } from "@/lib/api"
import { useI18n } from "./i18n"

interface FilterContextType {
  filters: DashboardFilters
  setFilters: (filters: DashboardFilters) => void
  exportData: DashboardData | null
  setExportData: (data: DashboardData | null) => void
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const { language } = useI18n()
  const [filters, setFiltersState] = useState<DashboardFilters>({ 
    preset: "week",
    lang: language 
  })
  const [exportData, setExportData] = useState<DashboardData | null>(null)

  const setFilters = (newFilters: DashboardFilters) => {
    setFiltersState(prev => ({ 
      ...prev, 
      ...newFilters,
      lang: language // Ensure lang stays sync'd
    }))
  }

  // Effect to sync language if it changes in i18n
  React.useEffect(() => {
    setFiltersState(prev => ({ ...prev, lang: language }))
  }, [language])

  return (
    <FilterContext.Provider value={{ filters, setFilters, exportData, setExportData }}>
      {children}
    </FilterContext.Provider>
  )
}

export function useDashboardFilters() {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error("useDashboardFilters must be used within a FilterProvider")
  }
  return context
}
