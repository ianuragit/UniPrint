import { TIME_OF_DAY_LABELS, TIME_OF_DAY_SAMPLE } from '../utils/colorUtils'
import type { TimeOfDay } from '../types/activity'

const TIME_ORDER: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night']

const INTENSITY_EXAMPLES = [
  { label: 'No activity', bg: '#1F2937', border: '#374151', opacity: 0.35, size: 8 },
  { label: '< 30 min or 1 entry', bg: '#DDD6FE', border: '#DDD6FE', opacity: 1, size: 10 },
  { label: '30–120 min or 2–3 entries', bg: '#8B5CF6', border: '#8B5CF6', opacity: 1, size: 14 },
  { label: '> 120 min or 4+ entries', bg: '#5B21B6', border: '#5B21B6', opacity: 1, size: 18 },
]

export default function Legend() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 space-y-4">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Legend
      </h3>

      {/* Time of day */}
      <div>
        <p className="mb-2 text-xs text-slate-500">Dot color → time of day</p>
        <ul className="space-y-1.5">
          {TIME_ORDER.map(tod => (
            <li key={tod} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full flex-shrink-0"
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: TIME_OF_DAY_SAMPLE[tod],
                }}
              />
              <span className="text-xs text-slate-300">{TIME_OF_DAY_LABELS[tod]}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Intensity */}
      <div>
        <p className="mb-2 text-xs text-slate-500">Dot size → activity intensity</p>
        <ul className="space-y-1.5">
          {INTENSITY_EXAMPLES.map(ex => (
            <li key={ex.label} className="flex items-center gap-2">
              <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 20, height: 20 }}>
                <span
                  className="inline-block rounded-full"
                  style={{
                    width: ex.size,
                    height: ex.size,
                    backgroundColor: ex.bg,
                    border: `1px solid ${ex.border}`,
                    opacity: ex.opacity,
                  }}
                />
              </span>
              <span className="text-xs text-slate-300">{ex.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rings */}
      <div>
        <p className="mb-1 text-xs text-slate-500">Rings</p>
        <p className="text-xs text-slate-400">
          Inner → outer = Jan → Dec.
          Each dot = one day of the month.
        </p>
      </div>
    </div>
  )
}
