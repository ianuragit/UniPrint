import type { ActivityEntry } from '../types/activity'
import { formatDate } from '../utils/dateUtils'

interface Props {
  entries: ActivityEntry[]
  onDelete: (id: string) => void
}

export default function ActivityFeed({ entries, onDelete }: Props) {
  const sorted = [...entries].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`),
  )
  const recent = sorted.slice(0, 30)

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Recent Activity
        </h3>
        <p className="text-xs text-slate-600">Nothing logged yet. Click a dot or use the form above.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <h3 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
        Recent Activity
      </h3>
      <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {recent.map(entry => (
          <li
            key={entry.id}
            className="group flex items-start justify-between gap-2 rounded-lg border border-slate-800 bg-slate-800/50 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{entry.activityType}</p>
              <p className="text-xs text-slate-500">
                {formatDate(entry.date)} · {entry.time}
                {entry.duration > 0 && ` · ${entry.duration} min`}
              </p>
              {entry.notes && (
                <p className="text-xs text-slate-500 italic mt-0.5 truncate">{entry.notes}</p>
              )}
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              className="flex-shrink-0 text-slate-700 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 text-xs mt-0.5"
              title="Delete"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
