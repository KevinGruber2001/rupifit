import { useState } from 'react'
import { Link } from 'react-router'
import { useSession } from '../context/SessionContext'
import { useEntries } from '../hooks/useEntries'
import CalendarGrid from '../components/CalendarGrid'
import type { DailyEntry, EntryStatus } from '../lib/types'

const currentMonth = new Date().toISOString().slice(0, 7)
const todayStr = new Date().toISOString().slice(0, 10)

const STATUS_CONFIG: Record<EntryStatus, { label: string; dot: string; bg: string; color: string }> = {
  done:   { label: 'Workout',   dot: 'bg-done',   bg: 'bg-done/20',   color: 'text-green-700' },
  cheat:  { label: 'Cheat day', dot: 'bg-cheat',  bg: 'bg-cheat/20',  color: 'text-yellow-700' },
  sick:   { label: 'Sick day',  dot: 'bg-sick',   bg: 'bg-sick/20',   color: 'text-blue-700' },
  missed: { label: 'Missed',    dot: 'bg-missed', bg: 'bg-missed/20', color: 'text-red-700' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  running: '🏃', cycling: '🚴', gym: '🏋️', padel: '🎾', other: '✏️',
}

function PhotoCard({ entry }: { entry: DailyEntry }) {
  const [imgFailed, setImgFailed] = useState(false)
  const cfg = STATUS_CONFIG[entry.status]

  const badge = (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-btn ${cfg.bg}`}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
      <span className={`text-sm font-semibold ${cfg.color}`}>
        {cfg.label}
        {entry.category && (
          <span className="font-normal ml-1">
            · {CATEGORY_EMOJI[entry.category] ?? ''} {entry.category}
          </span>
        )}
      </span>
    </div>
  )

  if (entry.photo_url && !imgFailed) {
    return (
      <div className="bg-surface border border-border rounded-card overflow-hidden">
        <div className="relative aspect-square">
          <img
            src={entry.photo_url}
            alt=""
            className="w-full h-full object-cover"
            onError={() => { console.error('Photo load failed:', entry.photo_url); setImgFailed(true) }}
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            {badge}
          </div>
        </div>
        {entry.notes && (
          <p className="text-sm text-muted leading-relaxed px-4 py-3">{entry.notes}</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-card p-4 flex flex-col gap-3">
      {badge}
      {entry.photo_url && imgFailed && (
        <div className="aspect-square rounded-btn bg-border/40 flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">📷</span>
          <span className="text-xs text-muted">Photo unavailable</span>
        </div>
      )}
      {entry.notes && (
        <p className="text-sm text-muted leading-relaxed">{entry.notes}</p>
      )}
    </div>
  )
}

function DayDetail({ date, entry }: { date: string; entry: DailyEntry | undefined }) {
  const isToday = date === todayStr
  const isFuture = date > todayStr

  const label = new Date(date + 'T00:00:00').toLocaleDateString('default', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="px-4 mt-6">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">{label}</p>

      {entry ? (
        <PhotoCard entry={entry} />
      ) : isFuture ? (
        <div className="bg-surface border border-border rounded-card px-4 py-6 flex items-center justify-center">
          <p className="text-sm text-muted">Future day</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-card px-4 py-8 flex flex-col items-center gap-4">
          <p className="text-sm text-muted text-center">
            {isToday ? 'Nothing logged yet today.' : 'Nothing was logged for this day.'}
          </p>
          {isToday && (
            <Link
              to="/record"
              className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-btn"
            >
              Log today
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { session } = useSession()
  const [selectedDay, setSelectedDay] = useState(todayStr)

  const { data: entries, isLoading } = useEntries(session?.user?.id, currentMonth)
  const selectedEntry = entries?.find((e) => e.date === selectedDay)

  const [year, monthNum] = currentMonth.split('-').map(Number)
  const monthLabel = new Date(year, monthNum - 1).toLocaleString('default', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-foreground">RupiFit</h1>
        <p className="text-sm text-muted">{monthLabel}</p>
      </header>

      <div className="px-4">
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="aspect-square rounded-full bg-border/60 animate-pulse" />
            ))}
          </div>
        ) : (
          <CalendarGrid
            month={currentMonth}
            entries={entries ?? []}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />
        )}
      </div>

      <DayDetail date={selectedDay} entry={selectedEntry} />
    </div>
  )
}
