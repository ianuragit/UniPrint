import { useState, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ActivityEntry, DayData } from '../types/activity'
import { daysInMonth, toDateKey, getTimeOfDay } from '../utils/dateUtils'
import { dominantTimeOfDay } from '../utils/colorUtils'

const STORAGE_KEY = 'uniprint_activities'

function loadFromStorage(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}

function saveToStorage(entries: ActivityEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function useActivities(year: number) {
  const [entries, setEntries] = useState<ActivityEntry[]>(loadFromStorage)

  const addEntry = useCallback((entry: Omit<ActivityEntry, 'id'>) => {
    const newEntry: ActivityEntry = { ...entry, id: uuidv4() }
    setEntries(prev => {
      const updated = [...prev, newEntry]
      saveToStorage(updated)
      return updated
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      saveToStorage(updated)
      return updated
    })
  }, [])

  /** All known activity type names (for autocomplete) */
  const activityTypes = useMemo((): string[] => {
    const seen = new Set<string>()
    for (const e of entries) seen.add(e.activityType)
    return Array.from(seen).sort()
  }, [entries])

  /**
   * Build a map of dateKey → DayData for the given year.
   * Includes every calendar day so the viz always has data to render.
   */
  const yearData = useMemo((): Map<string, DayData> => {
    const map = new Map<string, DayData>()

    // Seed all days
    for (let m = 1; m <= 12; m++) {
      const days = daysInMonth(year, m)
      for (let d = 1; d <= days; d++) {
        const key = toDateKey(year, m, d)
        map.set(key, {
          date: key,
          month: m,
          day: d,
          entries: [],
          dominantTimeOfDay: null,
          totalDuration: 0,
          intensity: 'none',
        })
      }
    }

    // Fill in activities
    for (const entry of entries) {
      if (!entry.date.startsWith(String(year))) continue
      const day = map.get(entry.date)
      if (!day) continue
      day.entries.push(entry)
    }

    // Compute derived fields
    for (const day of map.values()) {
      if (day.entries.length === 0) continue
      day.totalDuration = day.entries.reduce((s, e) => s + (e.duration || 0), 0)
      day.dominantTimeOfDay = dominantTimeOfDay(day.entries, getTimeOfDay)
      if (day.totalDuration >= 120 || day.entries.length >= 4) {
        day.intensity = 'high'
      } else if (day.totalDuration >= 30 || day.entries.length >= 2) {
        day.intensity = 'medium'
      } else {
        day.intensity = 'low'
      }
    }

    return map
  }, [entries, year])

  return { entries, addEntry, deleteEntry, activityTypes, yearData }
}
