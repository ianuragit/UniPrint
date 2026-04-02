import { v4 as uuidv4 } from 'uuid'
import type { ActivityEntry } from '../types/activity'
import { daysInMonth, toDateKey } from './dateUtils'

/** Tiny seeded LCG so results are deterministic and reproducible. */
function makePrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function timeFromHour(rng: () => number, hour: number): string {
  const min = Math.floor(rng() * 60)
  return `${pad(hour)}:${pad(min)}`
}

// ── Per-year personas ─────────────────────────────────────────────────────────

interface Persona {
  /** Probability of any given day having at least one activity (0–1) */
  baseDayProb: number
  /** Per-month multiplier on baseDayProb (index 0 = Jan) */
  monthMult: number[]
  /** Probability weights for time-of-day buckets: [morning, afternoon, evening, night] */
  todWeights: [number, number, number, number]
  /** Range of hour within each TOD bucket */
  todHours: [[number, number], [number, number], [number, number], [number, number]]
  /** If active yesterday, extra probability boost for today (streak simulation) */
  streakBoost: number
  /** Activity types this persona uses */
  activities: string[]
  /** Duration ranges [min, max] minutes */
  durationRange: [number, number]
  /** Chance of logging 2 activities on an active day */
  doubleProb: number
}

const PERSONAS: Record<number, Persona> = {
  // 2025 — "Early Bird / Fitness" persona
  // Amber-heavy, streaky, spikes in Jan & Sep
  2025: {
    baseDayProb: 0.62,
    monthMult:   [1.3, 1.1, 1.2, 1.0, 1.1, 0.7, 0.6, 0.7, 1.2, 1.3, 1.1, 0.8],
    todWeights:  [0.70, 0.18, 0.09, 0.03],
    todHours:    [[5, 11], [12, 16], [17, 21], [22, 23]],
    streakBoost: 0.22,
    activities:  ['Running', 'Cycling', 'Yoga', 'Gym', 'Walking', 'Swimming', 'HIIT'],
    durationRange: [20, 90],
    doubleProb:  0.18,
  },
  // 2024 — "Night Owl / Creative" persona
  // Violet/teal-heavy, more uniform spread, longer sessions
  2024: {
    baseDayProb: 0.55,
    monthMult:   [0.9, 0.8, 1.0, 1.1, 1.0, 1.1, 1.2, 1.1, 0.9, 1.0, 1.1, 0.9],
    todWeights:  [0.10, 0.20, 0.40, 0.30],
    todHours:    [[6, 10], [12, 16], [18, 21], [22, 23]],
    streakBoost: 0.12,
    activities:  ['Reading', 'Writing', 'Guitar', 'Meditation', 'Journaling', 'Chess', 'Sketching', 'Coding'],
    durationRange: [30, 150],
    doubleProb:  0.25,
  },
}

function weightedTodIndex(rng: () => number, weights: [number, number, number, number]): number {
  const r = rng()
  let acc = 0
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]
    if (r < acc) return i
  }
  return weights.length - 1
}

function generateEntryForDay(
  rng: () => number,
  dateKey: string,
  persona: Persona,
): ActivityEntry {
  const todIdx = weightedTodIndex(rng, persona.todWeights)
  const [hMin, hMax] = persona.todHours[todIdx]
  const hour = hMin + Math.floor(rng() * (hMax - hMin + 1))
  const [dMin, dMax] = persona.durationRange
  const duration = dMin + Math.floor(rng() * (dMax - dMin + 1))

  return {
    id: uuidv4(),
    activityType: pick(rng, persona.activities),
    date: dateKey,
    time: timeFromHour(rng, hour),
    duration,
    notes: '',
  }
}

export function generateDemoData(years: number[]): ActivityEntry[] {
  const all: ActivityEntry[] = []

  for (const year of years) {
    const persona = PERSONAS[year]
    if (!persona) continue
    const rng = makePrng(year * 31337)
    let wasActiveYesterday = false

    for (let m = 1; m <= 12; m++) {
      const days = daysInMonth(year, m)
      const monthProb = persona.baseDayProb * persona.monthMult[m - 1]

      for (let d = 1; d <= days; d++) {
        const prob = Math.min(0.95, wasActiveYesterday ? monthProb + persona.streakBoost : monthProb)
        const active = rng() < prob

        if (active) {
          const dateKey = toDateKey(year, m, d)
          all.push(generateEntryForDay(rng, dateKey, persona))
          // Possibly log a second activity
          if (rng() < persona.doubleProb) {
            all.push(generateEntryForDay(rng, dateKey, persona))
          }
          wasActiveYesterday = true
        } else {
          wasActiveYesterday = false
        }
      }
    }
  }

  return all
}
