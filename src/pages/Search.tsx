import { useParticipants } from '../hooks/useParticipants'
import { useAllEntries } from '../hooks/useAllEntries'
import type { EntryStatus } from '../lib/types'

const currentMonth = new Date().toISOString().slice(0, 7)

const STATUS_BG: Record<EntryStatus, string> = {
  done:   'bg-done',
  cheat:  'bg-cheat',
  sick:   'bg-sick',
  missed: 'bg-missed',
}

const STATUS_LABEL: Record<EntryStatus, string> = {
  done:   'Sport',
  cheat:  'Cheat',
  sick:   'Sick',
  missed: 'Missed',
}

export default function Overview() {
  const { data: participants, isLoading: loadingP } = useParticipants()
  const { data: entries, isLoading: loadingE } = useAllEntries(currentMonth)

  const [year, monthNum] = currentMonth.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const statusMap: Record<string, Record<number, EntryStatus>> = {}
  entries?.forEach((e) => {
    const day = Number(e.date.slice(8, 10))
    if (!statusMap[e.participant_id]) statusMap[e.participant_id] = {}
    statusMap[e.participant_id][day] = e.status
  })

  const isLoading = loadingP || loadingE

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="px-4 py-5">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted mt-0.5">
          {new Date(year, monthNum - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
      </header>

      {/* Legend */}
      <div className="px-4 mb-5 flex items-center gap-3 flex-wrap">
        {(Object.entries(STATUS_LABEL) as [EntryStatus, string][]).map(([s, label]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${STATUS_BG[s]}`} />
            <span className="text-xs text-muted">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-border" />
          <span className="text-xs text-muted">No entry</span>
        </div>
      </div>

      {isLoading ? (
        <div className="px-4 flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-8 rounded-card bg-border animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex">
          {/* ── Names column ── */}
          <div className="shrink-0 pl-4 border-r border-border">
            {/* spacer for day-number header */}
            <div className="h-7 mb-1" />
            {participants?.map((p) => (
              <div
                key={p.id}
                className="h-8 mb-1 flex items-center pr-3"
              >
                <span className="text-xs font-medium text-foreground" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>

          {/* ── Scrollable days ── */}
          <div className="overflow-x-auto no-scrollbar flex-1 px-2">
            {/* Day number header */}
            <div className="flex gap-1 mb-1">
              {days.map((d) => {
                const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`
                const isToday = dateStr === today
                return (
                  <div
                    key={d}
                    className={`w-8 h-7 shrink-0 flex items-center justify-center text-[11px] font-semibold ${isToday ? 'text-primary' : 'text-muted'}`}
                  >
                    {d}
                  </div>
                )
              })}
            </div>

            {/* Rows */}
            {participants?.map((p) => (
              <div key={p.id} className="flex gap-1 mb-1">
                {days.map((d) => {
                  const dateStr = `${currentMonth}-${String(d).padStart(2, '0')}`
                  const status = statusMap[p.id]?.[d]
                  const isFuture = dateStr > today
                  const isToday = dateStr === today

                  const bgClass = status
                    ? STATUS_BG[status]
                    : isFuture
                    ? 'bg-surface border border-border'
                    : 'bg-border/60'

                  return (
                    <div
                      key={d}
                      className={`w-8 h-8 shrink-0 rounded-md ${bgClass} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}`}
                      title={status ? STATUS_LABEL[status] : ''}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
