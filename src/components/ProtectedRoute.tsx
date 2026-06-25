import { Navigate, Outlet } from 'react-router'
import { useSession } from '../context/SessionContext'
import { supabase } from '../lib/supabaseClient'

export default function ProtectedRoute() {
  const { session, loading } = useSession()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  )

  if (!session) return <Navigate to="/login" replace />

  // Session exists but email not yet confirmed
  if (!session.user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 bg-background">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            ✉️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Verify your email</h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              Check your inbox for{' '}
              <span className="font-medium text-foreground">{session.user.email}</span>{' '}
              and click the verification link.
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.resend({ type: 'signup', email: session.user.email! })
            }}
            className="text-sm text-primary font-medium"
          >
            Resend email
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-muted"
          >
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <Outlet />
}
