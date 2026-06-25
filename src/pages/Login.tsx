import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabaseClient'

type Mode = 'login' | 'register'

const INPUT = 'w-full bg-surface border border-border rounded-btn px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()

  const switchMode = (m: Mode) => {
    setMode(m)
    setError(null)
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!username.trim()) {
      setError('Username is required.')
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: username.trim() } },
    })

    if (error) {
      setError(error.message)
    } else if (data.user && !data.session) {
      // Email confirmation required
      setVerifyEmail(email)
    } else {
      // Auto-confirmed (email confirmation disabled in Supabase)
      navigate('/dashboard')
    }
    setLoading(false)
  }

  // ── Verification sent screen ──────────────────────────────────────────
  if (verifyEmail) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 bg-background">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
            ✉️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            <p className="text-sm text-muted mt-2 leading-relaxed">
              We sent a verification link to{' '}
              <span className="font-medium text-foreground">{verifyEmail}</span>.
              <br />Click it to activate your account.
            </p>
          </div>
          <button
            onClick={() => { setVerifyEmail(null); switchMode('login') }}
            className="mt-2 text-sm text-primary font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  // ── Login / Register form ─────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">RupiFit</h1>
        <p className="text-sm text-muted mt-1">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-surface border border-border rounded-btn p-1 mb-6">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => switchMode(m)}
            className={`flex-1 py-2 rounded-[0.5rem] text-sm font-medium transition-colors
              ${mode === m ? 'bg-foreground text-surface' : 'text-muted'}`}
          >
            {m === 'login' ? 'Sign in' : 'Register'}
          </button>
        ))}
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={INPUT}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={INPUT}
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-surface rounded-btn py-3 text-sm font-medium disabled:opacity-50 mt-1"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={INPUT}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            maxLength={30}
            className={INPUT}
          />
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={INPUT}
          />
          {error && <p className="text-error text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-surface rounded-btn py-3 text-sm font-medium disabled:opacity-50 mt-1"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
          <p className="text-xs text-muted text-center">
            Your username is shown to other participants.
          </p>
        </form>
      )}
    </div>
  )
}
