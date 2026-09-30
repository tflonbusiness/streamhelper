import { useQueryClient } from '@tanstack/react-query'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import {
  logout as logoutRequest,
  setLoginSurface as setLoginSurfaceRequest,
  type AuthUser,
  type LoginSurface,
} from '../api/auth'
import { authKeys } from '@/queries/keys'
import { useCurrentUser } from '@/queries/use-auth'

type AuthContextValue = {
  user: AuthUser | null
  loginSurface: LoginSurface
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
  switchSurface: (surface: LoginSurface) => Promise<LoginSurface>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: session = null, isLoading: loading } = useCurrentUser()
  const user = session?.user ?? null
  const loginSurface = session?.loginSurface ?? 'streamer'

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: authKeys.currentUser() })
  }, [queryClient])

  const logout = useCallback(async () => {
    await logoutRequest()
    queryClient.setQueryData(authKeys.currentUser(), null)
  }, [queryClient])

  const switchSurface = useCallback(
    async (surface: LoginSurface) => {
      const next = await setLoginSurfaceRequest(surface)
      await refresh()
      return next
    },
    [refresh],
  )

  const value = useMemo(
    () => ({
      user,
      loginSurface,
      loading,
      logout,
      refresh,
      switchSurface,
    }),
    [user, loginSurface, loading, logout, refresh, switchSurface],
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
