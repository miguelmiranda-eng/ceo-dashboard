"use client"

import { useState, useEffect, useCallback } from "react"
import { fetchDashboardData, DashboardData } from "@/lib/api"

export interface Notification {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  machineId?: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const checkAlerts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchDashboardData()
      const newNotifications: Notification[] = []

      // 1. Check for red machines
      data.machinery.machines.forEach(m => {
        if (m.loadStatus === 'red') {
          newNotifications.push({
            id: `machine-${m.id}-${Date.now()}`,
            type: 'critical',
            title: 'Critical Machine Load',
            message: `${m.name} is at critical capacity (${m.capacity}%)`,
            timestamp: new Date(),
            read: false,
            machineId: m.id
          })
        }
      })

      // 2. Check efficiency
      if (data.efficiency < 80) {
        newNotifications.push({
          id: `eff-${Date.now()}`,
          type: 'warning',
          title: 'Low Efficiency',
          message: `Current weekly efficiency is at ${data.efficiency}%`,
          timestamp: new Date(),
          read: false
        })
      }

      setNotifications(prev => {
        // Simple deduplication based on type and machine (could be more robust)
        const existingMessages = new Set(prev.map(n => n.message))
        const uniqueNew = newNotifications.filter(n => !existingMessages.has(n.message))
        return [...uniqueNew, ...prev].slice(0, 20) // Keep last 20
      })
    } catch (err) {
      console.error("Failed to fetch alerts", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAlerts()
    // Check every 5 minutes (reduced from 2m to protect MOS load)
    const interval = setInterval(checkAlerts, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [checkAlerts])

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAll = () => {
    setNotifications([])
  }

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.read).length,
    loading,
    markAsRead,
    clearAll,
    refresh: checkAlerts
  }
}
