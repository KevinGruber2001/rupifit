import { Navigate, Outlet } from 'react-router'
import { useSession } from '../hooks/useSession'

export default function ProtectedRoute() {
  const { session, loading } = useSession()
  if (loading) return <p>Loading...</p>
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}