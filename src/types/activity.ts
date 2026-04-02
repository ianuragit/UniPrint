export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night'

export interface ActivityEntry {
  id: string
  activityType: string
  date: string     // 'YYYY-MM-DD'
  time: string     // 'HH:MM' 24h
  duration: number // minutes
  notes: string
}

export interface DayData {
  date: string       // 'YYYY-MM-DD'
  month: number      // 1–12
  day: number        // 1–31
  entries: ActivityEntry[]
  dominantTimeOfDay: TimeOfDay | null
  totalDuration: number  // minutes
  intensity: 'none' | 'low' | 'medium' | 'high'
}
