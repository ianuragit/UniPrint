import { useState, useCallback } from 'react'
import type { DayData } from '../types/activity'
import { getDotColor, EMPTY_DOT_COLOR, EMPTY_DOT_STROKE } from '../utils/colorUtils'
import { MONTH_SHORT, daysInMonth } from '../utils/dateUtils'
import { formatDate } from '../utils/dateUtils'

// ── Layout constants ──────────────────────────────────────────────────────────
const CX = 460
const CY = 460
const INNER_RADIUS = 108   // January ring radius
const RING_GAP = 30        // px between rings
const DOT_BASE_RADIUS = 4  // px, scaled by intensity
const SVG_SIZE = 920
// ─────────────────────────────────────────────────────────────────────────────

interface TooltipState {
  x: number
  y: number
  day: DayData
}

interface Props {
  year: number
  yearData: Map<string, DayData>
  onDayClick: (dateKey: string) => void
}

function dotRadius(intensity: DayData['intensity']): number {
  switch (intensity) {
    case 'low':    return DOT_BASE_RADIUS + 1
    case 'medium': return DOT_BASE_RADIUS + 3
    case 'high':   return DOT_BASE_RADIUS + 5
    default:       return DOT_BASE_RADIUS
  }
}

export default function FingerprintViz({ year, yearData, onDayClick }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGCircleElement>, day: DayData) => {
      const rect = (e.currentTarget.closest('svg') as SVGSVGElement).getBoundingClientRect()
      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        day,
      })
    },
    [],
  )

  const handleMouseLeave = useCallback(() => setTooltip(null), [])

  const rings = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const radius = INNER_RADIUS + i * RING_GAP
    const days = daysInMonth(year, month)
    return { month, radius, days }
  })

  return (
    <div className="relative select-none">
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        className="w-full max-w-[640px] mx-auto"
        style={{ filter: 'drop-shadow(0 0 40px rgba(139,92,246,0.08))' }}
      >
        {/* Background */}
        <rect width={SVG_SIZE} height={SVG_SIZE} fill="#0F172A" rx="16" />

        {/* Faint guide circles for each ring */}
        {rings.map(({ month, radius }) => (
          <circle
            key={`guide-${month}`}
            cx={CX}
            cy={CY}
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="1"
          />
        ))}

        {/* Month labels */}
        {rings.map(({ month, radius }) => {
          // Label sits just outside the ring at the 12-o'clock position
          const labelY = CY - radius - 6
          return (
            <text
              key={`label-${month}`}
              x={CX}
              y={labelY}
              textAnchor="middle"
              fill="#475569"
              fontSize="9"
              fontFamily="ui-monospace, monospace"
              letterSpacing="0.05em"
            >
              {MONTH_SHORT[month - 1]}
            </text>
          )
        })}

        {/* Day dots */}
        {rings.map(({ month, radius, days }) =>
          Array.from({ length: days }, (_, d) => {
            const day = d + 1
            const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const data = yearData.get(dateKey)

            // Angle: start at top (-π/2), go clockwise
            const angle = ((d / days) * 2 * Math.PI) - Math.PI / 2
            const x = CX + radius * Math.cos(angle)
            const y = CY + radius * Math.sin(angle)

            const hasActivity = data && data.intensity !== 'none'
            let fill = EMPTY_DOT_COLOR
            let stroke = EMPTY_DOT_STROKE
            let glowId: string | null = null

            if (hasActivity && data.dominantTimeOfDay) {
              const colors = getDotColor(data.dominantTimeOfDay, data.intensity as 'low' | 'medium' | 'high')
              fill = colors.fill
              stroke = colors.fill
              glowId = `glow-${dateKey}`
              // Store glow color in data attribute via a filter approach below
              void colors.glow
            }

            const r = hasActivity ? dotRadius(data.intensity) : DOT_BASE_RADIUS

            return (
              <circle
                key={dateKey}
                cx={x}
                cy={y}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={hasActivity ? 0 : 0.5}
                opacity={hasActivity ? 1 : 0.35}
                style={{ cursor: 'pointer', transition: 'r 0.15s ease, opacity 0.15s ease' }}
                data-glow-id={glowId}
                onMouseEnter={e => handleMouseEnter(e, data ?? {
                  date: dateKey, month, day,
                  entries: [], dominantTimeOfDay: null,
                  totalDuration: 0, intensity: 'none',
                })}
                onMouseLeave={handleMouseLeave}
                onClick={() => onDayClick(dateKey)}
              />
            )
          }),
        )}

        {/* Center label */}
        <text
          x={CX}
          y={CY - 14}
          textAnchor="middle"
          fill="#94A3B8"
          fontSize="13"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.08em"
        >
          UNI
        </text>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          fill="#64748B"
          fontSize="22"
          fontFamily="ui-monospace, monospace"
          fontWeight="bold"
          letterSpacing="0.12em"
        >
          PRINT
        </text>
        <text
          x={CX}
          y={CY + 24}
          textAnchor="middle"
          fill="#475569"
          fontSize="11"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.05em"
        >
          {year}
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 rounded-lg border border-slate-700 bg-slate-900/95 px-3 py-2 text-xs shadow-xl backdrop-blur"
          style={{
            left: Math.min(tooltip.x + 12, 560),
            top: tooltip.y - 8,
            transform: 'translateY(-100%)',
            minWidth: '160px',
          }}
        >
          <p className="font-semibold text-slate-200 mb-1">
            {formatDate(tooltip.day.date)}
          </p>
          {tooltip.day.intensity === 'none' ? (
            <p className="text-slate-500">No activity logged</p>
          ) : (
            <>
              <p className="text-slate-400">
                {tooltip.day.entries.length} {tooltip.day.entries.length === 1 ? 'entry' : 'entries'}
                {tooltip.day.totalDuration > 0 && ` · ${tooltip.day.totalDuration} min`}
              </p>
              <ul className="mt-1 space-y-0.5">
                {tooltip.day.entries.slice(0, 3).map(e => (
                  <li key={e.id} className="text-slate-300 truncate max-w-[180px]">
                    {e.time} · {e.activityType}
                    {e.duration > 0 && ` (${e.duration}m)`}
                  </li>
                ))}
                {tooltip.day.entries.length > 3 && (
                  <li className="text-slate-500">+{tooltip.day.entries.length - 3} more</li>
                )}
              </ul>
            </>
          )}
          <p className="mt-1.5 text-slate-600 text-[10px]">Click to log activity</p>
        </div>
      )}
    </div>
  )
}
