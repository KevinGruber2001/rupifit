import { useState } from 'react'
import { Link } from 'react-router'
import { useSession } from '../context/SessionContext'
import { useParticipants } from '../hooks/useParticipants'
import { useTodayEntries } from '../hooks/useTodayEntries'
import type { DailyEntry, EntryStatus } from '../lib/types'

const STATUS_CONFIG: Record<EntryStatus, { label: string; bg: string; dot: string }> = {
  done:   { label: 'Workout',   bg: 'bg-done',   dot: 'bg-done' },
  cheat:  { label: 'Cheat day', bg: 'bg-cheat',  dot: 'bg-cheat' },
  sick:   { label: 'Sick day',  bg: 'bg-sick',   dot: 'bg-sick' },
  missed: { label: 'Missed',    bg: 'bg-missed', dot: 'bg-missed' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  running: '🏃', cycling: '🚴', gym: '🏋️', padel: '🎾', other: '✏️',
}

function EntryCard({
  entry,
  name,
  blurred,
}: {
  entry: DailyEntry
  name: string
  blurred: boolean
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const cfg = STATUS_CONFIG[entry.status]
  const hasPhoto = !!entry.photo_url && !imgFailed

  const nameLabel = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
        {name.slice(0, 1)}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{name}</p>
        <p className="text-xs text-white/80 leading-tight">
          {cfg.label}
          {entry.category ? ` · ${CATEGORY_EMOJI[entry.category] ?? ''} ${entry.category}` : ''}
        </p>
      </div>
    </div>
  )

  return (
    <div className="relative rounded-card overflow-hidden">
      {/* Content (possibly blurred) */}
      <div className={blurred ? 'blur-md scale-105' : ''}>
        {hasPhoto ? (
          <div className="relative aspect-square bg-border/40">
            <img
              src={entry.photo_url!}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImgFailed(true)}
            />
            {/* gradient + name overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent p-3">
              {nameLabel}
            </div>
          </div>
        ) : (
          /* No photo — colored status card */
          <div className={`aspect-square ${cfg.bg} flex flex-col justify-between p-4`}>
            <div>{nameLabel}</div>
            <p className="text-4xl self-center">
              {entry.status === 'done' ? '💪' : entry.status === 'cheat' ? '🍕' : '🤒'}
            </p>
            {entry.notes && (
              <p className="text-sm text-white/90 leading-snug line-clamp-3">{entry.notes}</p>
            )}
          </div>
        )}
      </div>

      {/* Lock overlay — not blurred, sits on top */}
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-foreground/75 backdrop-blur-sm text-white rounded-card px-5 py-4 flex flex-col items-center gap-1 text-center">
            <span className="text-2xl">🔒</span>
            <p className="text-sm font-semibold mt-1">Post to unlock</p>
            <p className="text-xs text-white/70">Share your day first</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BeReal() {
  const { session } = useSession()
  const { data: participants, isLoading: loadingP } = useParticipants()
  const { data: entries, isLoading: loadingE } = useTodayEntries()

  const today = new Date().toISOString().slice(0, 10)
  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('default', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const participantMap = Object.fromEntries(
    (participants ?? []).map((p) => [p.id, p]),
  )

  // Only show entries with an active status (not missed)
  const activeEntries = (entries ?? []).filter((e) =>
    ['done', 'cheat', 'sick'].includes(e.status),
  )

  const myEntry = activeEntries.find((e) => e.participant_id === session?.user?.id)
  const hasPosted = !!myEntry

  // My entry first, then others sorted by created_at
  const sorted = [
    ...activeEntries.filter((e) => e.participant_id === session?.user?.id),
    ...activeEntries.filter((e) => e.participant_id !== session?.user?.id),
  ]

  const isLoading = loadingP || loadingE

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="px-4 pt-5 pb-4">
        <h1 className="text-2xl font-bold text-foreground">BeReal</h1>
        <p className="text-sm text-muted">{todayLabel}</p>
      </header>

      {/* Post prompt if not yet logged */}
      {!isLoading && !hasPosted && (
        <div className="mx-4 mb-5 bg-primary/10 border border-primary/20 rounded-card px-4 py-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">You haven't posted yet</p>
            <p className="text-xs text-muted mt-0.5">Post to see your friends' entries</p>
          </div>
          <Link
            to="/record"
            className="shrink-0 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-btn"
          >
            Post
          </Link>
        </div>
      )}

      {isLoading ? (
        <div className="px-4 flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="aspect-square rounded-card bg-border animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="px-4 flex flex-col items-center gap-3 mt-12">
          <span className="text-4xl">👀</span>
          <p className="text-sm text-muted text-center">No one has posted yet today.</p>
        </div>
      ) : (
        <div className="px-4 flex flex-col gap-4">
          {sorted.map((entry) => {
            const participant = participantMap[entry.participant_id]
            const isMe = entry.participant_id === session?.user?.id
            return (
              <EntryCard
                key={entry.id}
                entry={entry}
                name={participant?.name ?? 'Unknown'}
                blurred={!hasPosted && !isMe}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
