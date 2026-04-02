import { useState } from 'react'
import { useActivities } from './hooks/useActivities'
import FingerprintViz from './components/FingerprintViz'
import ActivityLogger from './components/ActivityLogger'
import Legend from './components/Legend'
import ActivityFeed from './components/ActivityFeed'

const CURRENT_YEAR = new Date().getFullYear()

export default function App() {
  const [year, setYear] = useState(CURRENT_YEAR)
  const [loggerOpen, setLoggerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const {
    entries, addEntry, deleteEntry, activityTypes, yearData,
    isDemoLoaded, loadDemoData, clearDemoData,
  } = useActivities(year)

  function handleDayClick(dateKey: string) {
    setSelectedDate(dateKey)
    setLoggerOpen(true)
  }

  function handleLogActivity() {
    setSelectedDate(undefined)
    setLoggerOpen(true)
  }

  function handleSubmit(entry: Parameters<typeof addEntry>[0]) {
    addEntry(entry)
    setLoggerOpen(false)
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-widest text-slate-100 font-mono">
            UNIPRINT
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Your unique activity fingerprint</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Year selector */}
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 focus:border-violet-500 focus:outline-none"
          >
            {yearOptions.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {isDemoLoaded ? (
            <button
              onClick={clearDemoData}
              className="rounded-lg border border-slate-600 px-4 py-1.5 text-sm text-slate-400 hover:border-rose-500 hover:text-rose-400 transition-colors focus:outline-none"
            >
              Clear Demo
            </button>
          ) : (
            <button
              onClick={loadDemoData}
              className="rounded-lg border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:border-violet-500 hover:text-violet-300 transition-colors focus:outline-none"
            >
              Load Demo
            </button>
          )}

          <button
            onClick={handleLogActivity}
            className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            + Log Activity
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: visualization */}
        <section>
          <FingerprintViz
            year={year}
            yearData={yearData}
            onDayClick={handleDayClick}
          />

          {/* Stats bar */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StatCard
              label="Days Active"
              value={Array.from(yearData.values()).filter(d => d.intensity !== 'none').length}
            />
            <StatCard
              label="Total Minutes"
              value={Array.from(yearData.values()).reduce((s, d) => s + d.totalDuration, 0)}
            />
            <StatCard
              label="Total Entries"
              value={entries.filter(e => e.date.startsWith(String(year))).length}
            />
          </div>
        </section>

        {/* Right: sidebar */}
        <aside className="space-y-4">
          {loggerOpen ? (
            <ActivityLogger
              initialDate={selectedDate}
              activityTypes={activityTypes}
              onSubmit={handleSubmit}
              onCancel={() => setLoggerOpen(false)}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Click any dot on the fingerprint to log activity for that day,
                or use the <span className="text-violet-400">+ Log Activity</span> button.
              </p>
            </div>
          )}

          <Legend />
          <ActivityFeed entries={entries} onDelete={deleteEntry} />
        </aside>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center">
      <p className="text-2xl font-bold text-slate-100 font-mono">{value.toLocaleString()}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
