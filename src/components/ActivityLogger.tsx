import { useState, useEffect } from 'react'
import type { ActivityEntry } from '../types/activity'
import { todayDateKey, nowTimeString, formatDate } from '../utils/dateUtils'

interface Props {
  initialDate?: string
  activityTypes: string[]
  onSubmit: (entry: Omit<ActivityEntry, 'id'>) => void
  onCancel: () => void
}

export default function ActivityLogger({ initialDate, activityTypes, onSubmit, onCancel }: Props) {
  const [activityType, setActivityType] = useState('')
  const [customType, setCustomType] = useState('')
  const [date, setDate] = useState(initialDate ?? todayDateKey())
  const [time, setTime] = useState(nowTimeString())
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (initialDate) setDate(initialDate)
  }, [initialDate])

  const resolvedType = activityType === '__custom__' ? customType : activityType

  const filtered = activityTypes.filter(t =>
    t.toLowerCase().includes(activityType.toLowerCase()) && activityType.length > 0,
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const type = resolvedType.trim()
    if (!type) return
    onSubmit({
      activityType: type,
      date,
      time,
      duration: Math.max(0, parseInt(duration || '0', 10)),
      notes: notes.trim(),
    })
    // Reset
    setActivityType('')
    setCustomType('')
    setDate(todayDateKey())
    setTime(nowTimeString())
    setDuration('')
    setNotes('')
  }

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
      <h2 className="mb-4 text-base font-semibold text-slate-200 tracking-wide">
        Log Activity
        {initialDate && (
          <span className="ml-2 text-sm font-normal text-slate-400">
            — {formatDate(initialDate)}
          </span>
        )}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Activity type */}
        <div className="relative">
          <label className="mb-1 block text-xs text-slate-400 uppercase tracking-widest">
            Activity
          </label>
          <input
            type="text"
            value={activityType}
            placeholder="e.g. Running, Reading, Meditation…"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            onChange={e => {
              setActivityType(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            required
          />
          {showSuggestions && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 shadow-xl overflow-hidden">
              {filtered.slice(0, 6).map(t => (
                <li
                  key={t}
                  className="cursor-pointer px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  onMouseDown={() => {
                    setActivityType(t)
                    setShowSuggestions(false)
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-400 uppercase tracking-widest">
              Date
            </label>
            <input
              type="date"
              value={date}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400 uppercase tracking-widest">
              Time
            </label>
            <input
              type="time"
              value={time}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              onChange={e => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="mb-1 block text-xs text-slate-400 uppercase tracking-widest">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="0"
            value={duration}
            placeholder="0"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            onChange={e => setDuration(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-1 block text-xs text-slate-400 uppercase tracking-widest">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            placeholder="Quick note…"
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
          >
            Log Activity
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
