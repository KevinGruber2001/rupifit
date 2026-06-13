import type { DailyEntry, EntryStatus } from '../lib/types'

// Renders a simple grid of days for the given month, colored by entry status.

const STATUS_COLORS: Record<EntryStatus, string> = {
  done: '#4ade80', // green
  cheat: '#facc15', // yellow
  sick: '#60a5fa', // blue
  missed: '#f87171', // red
}

interface CalendarGridProps {
  month: string // 'YYYY-MM'
  entries: DailyEntry[]
}

export default function CalendarGrid({ month, entries }: CalendarGridProps) {
  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()

  const entryByDate = Object.fromEntries(entries.map((e) => [e.date, e]))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dateStr = `${month}-${String(day).padStart(2, '0')}`
        const entry = entryByDate[dateStr]
        const color = entry ? STATUS_COLORS[entry.status] : '#e5e7eb'

        return (
          <div
            key={dateStr}
            style={{
              border: '1px solid #ccc',
              borderRadius: '4px',
              padding: '8px',
              textAlign: 'center',
              background: color,
              cursor: 'pointer',
            }}
            title={entry?.category ?? ''}
          >
            {day}
          </div>
        )
      })}
    </div>
  )
}
