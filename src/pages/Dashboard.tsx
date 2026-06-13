import { useSession } from '../hooks/useSession'
import { useParticipants } from '../hooks/useParticipants'
import { useEntries } from '../hooks/useEntries'
import CalendarGrid from '../components/CalendarGrid'
import { supabase } from '../lib/supabaseClient'

const currentMonth = new Date().toISOString().slice(0, 7) // 'YYYY-MM'

export default function Dashboard() {
  const { session } = useSession()
  const { data: participants, isLoading: loadingParticipants } = useParticipants()
  const { data: entries, isLoading: loadingEntries } = useEntries(
    session?.user?.id,
    currentMonth,
  )

  if (loadingParticipants || loadingEntries) return <p>Loading...</p>

  return (
    <div>
      <header>
        <h1>RupiFit</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>

      <h2>This month</h2>
      <CalendarGrid month={currentMonth} entries={entries ?? []} />

      <h2>Participants</h2>
      <ul>
        {participants?.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  )
}
