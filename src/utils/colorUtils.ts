import type { TimeOfDay } from '../types/activity'

/**
 * Color palette per time-of-day and intensity.
 *
 * Hue families:
 *   morning   → amber/gold   (~38°)
 *   afternoon → sky blue     (~205°)
 *   evening   → violet       (~270°)
 *   night     → teal/cyan    (~185°)
 *
 * Intensity controls saturation and lightness.
 */

interface ColorSpec {
  fill: string
  glow: string
}

const PALETTE: Record<TimeOfDay, Record<'low' | 'medium' | 'high', ColorSpec>> = {
  morning: {
    low:    { fill: '#FDE68A', glow: 'rgba(251,191,36,0.4)' },
    medium: { fill: '#F59E0B', glow: 'rgba(245,158,11,0.5)' },
    high:   { fill: '#B45309', glow: 'rgba(180,83,9,0.6)'   },
  },
  afternoon: {
    low:    { fill: '#BAE6FD', glow: 'rgba(56,189,248,0.4)' },
    medium: { fill: '#0EA5E9', glow: 'rgba(14,165,233,0.5)' },
    high:   { fill: '#075985', glow: 'rgba(7,89,133,0.6)'   },
  },
  evening: {
    low:    { fill: '#DDD6FE', glow: 'rgba(167,139,250,0.4)' },
    medium: { fill: '#8B5CF6', glow: 'rgba(139,92,246,0.5)'  },
    high:   { fill: '#5B21B6', glow: 'rgba(91,33,182,0.6)'   },
  },
  night: {
    low:    { fill: '#A5F3FC', glow: 'rgba(34,211,238,0.4)' },
    medium: { fill: '#06B6D4', glow: 'rgba(6,182,212,0.5)'  },
    high:   { fill: '#155E75', glow: 'rgba(21,94,117,0.6)'  },
  },
}

export const TIME_OF_DAY_LABELS: Record<TimeOfDay, string> = {
  morning:   'Morning (5am–12pm)',
  afternoon: 'Afternoon (12pm–5pm)',
  evening:   'Evening (5pm–10pm)',
  night:     'Night (10pm–5am)',
}

export const TIME_OF_DAY_SAMPLE: Record<TimeOfDay, string> = {
  morning:   '#F59E0B',
  afternoon: '#0EA5E9',
  evening:   '#8B5CF6',
  night:     '#06B6D4',
}

export const EMPTY_DOT_COLOR = '#1F2937'       // dark gray for inactive days
export const EMPTY_DOT_STROKE = '#374151'

export function getDotColor(
  timeOfDay: TimeOfDay,
  intensity: 'low' | 'medium' | 'high',
): ColorSpec {
  return PALETTE[timeOfDay][intensity]
}

/**
 * Given multiple time-of-day values (one per entry), pick the dominant one
 * by weighted duration.
 */
export function dominantTimeOfDay(
  entries: { time: string; duration: number }[],
  getTimeOfDayFn: (t: string) => TimeOfDay,
): TimeOfDay {
  const totals: Record<TimeOfDay, number> = {
    morning: 0, afternoon: 0, evening: 0, night: 0,
  }
  for (const e of entries) {
    totals[getTimeOfDayFn(e.time)] += e.duration || 1
  }
  return (Object.keys(totals) as TimeOfDay[]).reduce((a, b) =>
    totals[a] >= totals[b] ? a : b,
  )
}
