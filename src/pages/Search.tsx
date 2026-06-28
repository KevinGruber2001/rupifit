import { useRef, useEffect } from 'react'
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

function calcStreak(statusMap: Record<number, EntryStatus>, todayDay: number): number {
  let streak = 0
  for (let d = todayDay; d >= 1; d--) {
    if (statusMap[d] === 'done') {
      streak++
    } else {
      break
    }
  }
  return streak
}

function calcMonthlyDone(statusMap: Record<number, EntryStatus>): number {
  return Object.values(statusMap).filter((s) => s === 'done').length
}

const RANK_STYLES: Record<number, { label: string; className: string }> = {
  0: { label: '🥇', className: 'text-yellow-500' },
  1: { label: '🥈', className: 'text-slate-400' },
  2: { label: '🥉', className: 'text-amber-600' },
}

export default function Overview() {
  const { data: participants, isLoading: loadingP } = useParticipants()
  const { data: entries, isLoading: loadingE } = useAllEntries(currentMonth)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [year, monthNum] = currentMonth.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const today = new Date().toISOString().slice(0, 10)
  const todayDay = new Date().getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const statusMap: Record<string, Record<number, EntryStatus>> = {}
  entries?.forEach((e) => {
    const day = Number(e.date.slice(8, 10))
    if (!statusMap[e.participant_id]) statusMap[e.participant_id] = {}
    statusMap[e.participant_id][day] = e.status
  })

  const isLoading = loadingP || loadingE

  const CELL_WIDTH = 36

  useEffect(() => {
    if (!scrollRef.current) return
    const container = scrollRef.current
    const containerWidth = container.clientWidth
    const targetScroll = (todayDay - 1) * CELL_WIDTH - (containerWidth - 2 * CELL_WIDTH)
    container.scrollLeft = Math.max(0, targetScroll)
  }, [todayDay, isLoading])

  const leaderboard = participants
    ? [...participants]
        .map((p) => ({
          ...p,
          count: calcMonthlyDone(statusMap[p.id] ?? {}),
        }))
        .sort((a, b) => b.count - a.count)
    : []

  const monthLabel = new Date(year, monthNum - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="px-4 py-5">
        <h1 className="text-2xl font-bold text-foreground">Overview</h1>
        <p className="text-sm text-muted mt-0.5">{monthLabel}</p>
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
        <>
          {/* ── Calendar grid ── */}
          <div className="flex">
            {/* Names column */}
            <div className="shrink-0 pl-4 border-r border-border">
              <div className="h-7 mb-1" />
              {participants?.map((p) => (
                <div key={p.id} className="h-8 mb-1 flex items-center pr-3">
                  <span className="text-xs font-medium text-foreground" style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Streak column */}
            <div className="shrink-0 border-r border-border">
              <div className="h-7 mb-1" />
              {participants?.map((p) => {
                const streak = calcStreak(statusMap[p.id] ?? {}, todayDay)
                return (
                  <div key={p.id} className="h-8 mb-1 flex items-center px-2.5">
                    {streak > 0 ? (
                      <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {streak}x 🔥
                      </span>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Scrollable days */}
            <div ref={scrollRef} className="overflow-x-auto flex-1 px-2">
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

          {/* ── Leaderboard ── */}
          <div className="px-4 mt-8">
            <h2 className="text-base font-bold text-foreground mb-1">Leaderboard</h2>
            <p className="text-xs text-muted mb-4">{monthLabel}</p>

            <div className="flex flex-col gap-2">
              {leaderboard.map((p, i) => {
                const rank = RANK_STYLES[i]
                const topCount = leaderboard[0]?.count ?? 1
                const barWidth = topCount > 0 ? (p.count / topCount) * 100 : 0

                return (
                  <div key={p.id} className="flex items-center gap-3">
                    {/* Rank */}
                    <div className="w-6 flex justify-center shrink-0">
                      {rank ? (
                        <span className={`text-base ${rank.className}`}>{rank.label}</span>
                      ) : (
                        <span className="text-xs text-muted font-medium">{i + 1}</span>
                      )}
                    </div>

                    {/* Name */}
                    <span className="text-xs font-medium text-foreground shrink-0" style={{ width: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.name}
                    </span>

                    {/* Bar */}
                    <div className="flex-1 h-5 bg-border/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-done rounded-full transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* Count */}
                    <span className="text-xs font-semibold text-foreground shrink-0 w-8 text-right">
                      {p.count}x
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}