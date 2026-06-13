import { useSession } from '../context/SessionContext'
import { useParticipants } from '../hooks/useParticipants'
import { useEntries } from '../hooks/useEntries'
import CalendarGrid from '../components/CalendarGrid'

const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

export default function Dashboard() {
  const { session } = useSession()
  const { data: participants, isLoading: loadingParticipants } = useParticipants()
  const { data: entries, isLoading: loadingEntries } = useEntries(
    session?.user?.id,
    currentMonth,
  )

  return (
    <div className="min-h-screen bg-background pb-28 px-4">
      <header className="py-5">
        <h1 className="text-2xl font-bold text-foreground">RupiFit</h1>
      </header>

      <section className="mb-6">
        <h2 className="text-base font-semibold text-foreground mb-3">This month</h2>
        {loadingEntries
          ? <div className="grid grid-cols-7 gap-1">{Array.from({ length: 30 }, (_, i) => (
              <div key={i} className="aspect-square rounded-btn bg-border animate-pulse" />
            ))}</div>
          : <CalendarGrid month={currentMonth} entries={entries ?? []} />
        }
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Participants</h2>
        {loadingParticipants
          ? <div className="flex flex-col gap-2">{Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="h-11 rounded-card bg-border animate-pulse" />
            ))}</div>
          : <ul className="flex flex-col gap-2">
              {participants?.map((p) => (
                <li
                  key={p.id}
                  className="bg-surface border border-border rounded-card px-4 py-3 text-sm text-foreground"
                >
                  {p.name}
                </li>
              ))}
            </ul>
        }
      </section>
    </div>
  )
}
