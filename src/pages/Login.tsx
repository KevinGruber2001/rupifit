import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      alert(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return <p>Check your email for a login link!</p>
  }

  return (
    <form onSubmit={handleLogin}>
      <h1>RupiFit Login</h1>
      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Send magic link</button>
    </form>
  )
}
