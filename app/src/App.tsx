import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import {
  AccountActiveRoute,
  GuestRoute,
  OwnerRoute,
  ProtectedRoute,
} from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { LocaleProvider } from './context/LocaleProvider'
import { NotificationProvider } from './context/NotificationContext'
import { DashboardHomePage } from './pages/DashboardHomePage'
import { LoginPage } from './pages/LoginPage'
import { BonusBuyPage } from './pages/BonusBuyPage'
import { BonusBuySessionPage } from './pages/BonusBuySessionPage'
import { BonusBuyStreamWidgetPage } from './pages/BonusBuyStreamWidgetPage'
import { ModulesPage } from './pages/ModulesPage'
import { ChatRollPage } from './pages/ChatRollPage'
import { ChatRollSessionPage } from './pages/ChatRollSessionPage'
import { PrizeSpinPage } from './pages/PrizeSpinPage'
import { PrizeSpinSessionPage } from './pages/PrizeSpinSessionPage'
import { PrizeSpinStreamWidgetPage } from './pages/PrizeSpinStreamWidgetPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { TeamPage } from './pages/TeamPage'
import { queryClient } from './queries/query-client'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LocaleProvider>
      <NotificationProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/" element={<LoginPage />} />
          </Route>

          <Route
            path="/modules/bonus-buy/:id/widget"
            element={<BonusBuyStreamWidgetPage />}
          />

          <Route
            path="/modules/prize-spin/:id/widget"
            element={<PrizeSpinStreamWidgetPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardHomePage />} />
              <Route element={<AccountActiveRoute />}>
                <Route path="/modules" element={<ModulesPage />} />
                <Route path="/modules/bonus-buy" element={<BonusBuyPage />} />
                <Route path="/modules/bonus-buy/:id" element={<BonusBuySessionPage />} />
                <Route path="/modules/prize-spin" element={<PrizeSpinPage />} />
                <Route path="/modules/prize-spin/:id" element={<PrizeSpinSessionPage />} />
                <Route path="/modules/chat-roll" element={<ChatRollPage />} />
                <Route path="/modules/chat-roll/:id" element={<ChatRollSessionPage />} />
                <Route element={<OwnerRoute />}>
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </NotificationProvider>
      </LocaleProvider>
    </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
