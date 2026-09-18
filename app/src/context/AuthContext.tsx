import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { logout as logoutRequest, type AuthUser } from '../api/auth'
import { authKeys } from '@/queries/keys'
import { useCurrentUser } from '@/queries/use-auth'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: user = null, isLoading: loading } = useCurrentUser()

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
  }, [queryClient])

  const logout = useCallback(async () => {
    await logoutRequest()
    queryClient.setQueryData(authKeys.currentUser(), null)
  }, [queryClient])

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      refresh,
    }),
    [user, loading, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
