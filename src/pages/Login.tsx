import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">RupiFit</h1>
        <p className="text-muted mt-1">Sign in to continue</p>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-surface border border-border rounded-btn px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-surface border border-border rounded-btn px-4 py-3 text-base text-foreground placeholder:text-muted outline-none focus:border-primary transition-colors"
        />

        {error && <p className="text-error text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-foreground text-surface rounded-btn py-3 text-sm font-medium disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
