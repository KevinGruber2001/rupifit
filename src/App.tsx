import { useSession } from './hooks/useSession'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const { session, loading } = useSession()

  if (loading) return <p>Loading...</p>

  return session ? <Dashboard /> : <Login />
}

export default App
