import { Navigate, Outlet } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { useAuth } from '@/context/AuthContext'

export function ServicePortalRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.platformAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
