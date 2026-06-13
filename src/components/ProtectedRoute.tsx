import { Navigate, Outlet } from 'react-router'
import { useSession } from '../context/SessionContext'

export default function ProtectedRoute() {
  const { session, loading } = useSession()
  if (loading) return <p>Loading...</p>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}