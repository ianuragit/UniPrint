import { useState, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ActivityEntry, DayData } from '../types/activity'
import { daysInMonth, toDateKey, getTimeOfDay } from '../utils/dateUtils'
import { dominantTimeOfDay } from '../utils/colorUtils'
import { generateDemoData } from '../utils/seedData'

const STORAGE_KEY = 'uniprint_activities'
const DEMO_KEY = 'uniprint_demo_activities'

function load(key: string): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ActivityEntry[]) : []
  } catch {
    return []
  }
}

function save(key: string, entries: ActivityEntry[]) {
  localStorage.setItem(key, JSON.stringify(entries))
}

function loadAll(): ActivityEntry[] {
  return [...load(STORAGE_KEY), ...load(DEMO_KEY)]
}

export function useActivities(year: number) {
  // Real user entries
  const [entries, setEntries] = useState<ActivityEntry[]>(() => load(STORAGE_KEY))
  // Demo entries kept separate so clearing them never touches real data
  const [demoEntries, setDemoEntries] = useState<ActivityEntry[]>(() => load(DEMO_KEY))

  const allEntries = useMemo(() => [...entries, ...demoEntries], [entries, demoEntries])

  const isDemoLoaded = demoEntries.length > 0

  const addEntry = useCallback((entry: Omit<ActivityEntry, 'id'>) => {
    const newEntry: ActivityEntry = { ...entry, id: uuidv4() }
    setEntries(prev => {
      const updated = [...prev, newEntry]
      save(STORAGE_KEY, updated)
      return updated
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      save(STORAGE_KEY, updated)
      return updated
    })
    // Also allow deleting demo entries (e.g. from the feed)
    setDemoEntries(prev => {
      const updated = prev.filter(e => e.id !== id)
      save(DEMO_KEY, updated)
      return updated
    })
  }, [])

  const loadDemoData = useCallback(() => {
    const demo = generateDemoData([2024, 2025])
    setDemoEntries(demo)
    save(DEMO_KEY, demo)
  }, [])

  const clearDemoData = useCallback(() => {
    setDemoEntries([])
    localStorage.removeItem(DEMO_KEY)
  }, [])

  /** All known activity type names (for autocomplete) */
  const activityTypes = useMemo((): string[] => {
    const seen = new Set<string>()
    for (const e of allEntries) seen.add(e.activityType)
    return Array.from(seen).sort()
  }, [allEntries])

  /**
   * Build a map of dateKey → DayData for the given year.
   * Includes every calendar day so the viz always has data to render.
   */
  const yearData = useMemo((): Map<string, DayData> => {
    const map = new Map<string, DayData>()

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

    for (const entry of allEntries) {
      if (!entry.date.startsWith(String(year))) continue
      const day = map.get(entry.date)
      if (!day) continue
      day.entries.push(entry)
    }

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
  }, [allEntries, year])

  return {
    entries: allEntries,
    addEntry,
    deleteEntry,
    activityTypes,
    yearData,
    isDemoLoaded,
    loadDemoData,
    clearDemoData,
  }
}

// Keep loadAll available for future use (e.g. export)
export { loadAll }
