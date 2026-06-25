import type { DailyEntry, EntryStatus } from '../lib/types'

const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const STATUS_DOT: Record<EntryStatus, string> = {
  done:   'bg-done',
  cheat:  'bg-cheat',
  sick:   'bg-sick',
  missed: 'bg-missed',
}

interface CalendarGridProps {
  month: string
  entries: DailyEntry[]
  selectedDay: string
  onDaySelect: (date: string) => void
}

export default function CalendarGrid({ month, entries, selectedDay, onDaySelect }: CalendarGridProps) {
  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)

  // Monday-first offset
  const firstDay = new Date(year, monthNum - 1, 1)
  const startOffset = (firstDay.getDay() + 6) % 7

  const entryByDate = Object.fromEntries(entries.map((e) => [e.date, e]))

  const cells: (number | null)[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[11px] font-semibold text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />

          const dateStr = `${month}-${String(day).padStart(2, '0')}`
          const entry = entryByDate[dateStr]
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDay

          return (
            <button
              key={dateStr}
              onClick={() => onDaySelect(dateStr)}
              className="flex flex-col items-center py-1 gap-1"
            >
              <div
                className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors
                  ${isSelected ? 'bg-primary text-white font-semibold' : ''}
                  ${!isSelected && isToday ? 'ring-2 ring-primary text-primary font-semibold' : ''}
                  ${!isSelected && !isToday ? 'text-foreground' : ''}
                `}
              >
                {day}
              </div>
              <div
                className={`w-1.5 h-1.5 rounded-full ${entry ? STATUS_DOT[entry.status] : 'invisible'}`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
