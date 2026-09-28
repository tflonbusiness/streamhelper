import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LocaleProvider } from './context/LocaleProvider'
import { NotificationProvider } from './context/NotificationContext'
import { queryClient } from './queries/query-client'
import { appRouter } from './router'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocaleProvider>
          <NotificationProvider>
            <RouterProvider router={appRouter} />
          </NotificationProvider>
        </LocaleProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
