import { Navigate, Outlet } from 'react-router-dom'
import { LoadingScreen } from '@/components/LoadingScreen'
import { accountHasSubscriptionAccess } from '@/lib/account-subscription'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export function AccountActiveRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user?.accountId) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

/** Blocks module and team routes when the account subscription has expired. */
export function SubscriptionAccessRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!accountHasSubscriptionAccess(user)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function OwnerRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user?.role !== 'owner') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user?.accountId) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
