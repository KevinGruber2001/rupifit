import type { DailyEntry, EntryStatus } from '../lib/types'

const STATUS_CLASSES: Record<EntryStatus, string> = {
  done:   'bg-done',
  cheat:  'bg-cheat',
  sick:   'bg-sick',
  missed: 'bg-missed',
}

interface CalendarGridProps {
  month: string // 'YYYY-MM'
  entries: DailyEntry[]
}

export default function CalendarGrid({ month, entries }: CalendarGridProps) {
  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  const entryByDate = Object.fromEntries(entries.map((e) => [e.date, e]))

  return (
    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1
        const dateStr = `${month}-${String(day).padStart(2, '0')}`
        const entry = entryByDate[dateStr]
        const isPast = dateStr < today
        const isToday = dateStr === today

        const colorClass = entry
          ? STATUS_CLASSES[entry.status]
          : isPast
          ? 'bg-missed'
          : 'bg-surface'

        return (
          <div
            key={dateStr}
            className={`
              ${colorClass}
              border border-border rounded-btn
              aspect-square flex items-center justify-center
              text-xs font-medium cursor-pointer
              ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
              ${entry || isPast ? 'text-foreground' : 'text-muted'}
            `}
            title={entry?.category ?? ''}
          >
            {day}
          </div>
        )
      })}
    </div>
  )
}
