import { useQuery } from '@tanstack/react-query'
import { fetchCurrentUser } from '@/api/auth'
import { authKeys } from '@/queries/keys'

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
  })
}
