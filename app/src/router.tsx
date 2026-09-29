import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import {
  AccountActiveRoute,
  GuestRoute,
  OwnerRoute,
  ProtectedRoute,
} from './components/ProtectedRoute'
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

export const appRouter = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/', element: <LoginPage /> }],
  },
  {
    path: '/modules/bonus-buy/widget/:ucid',
    element: <BonusBuyStreamWidgetPage />,
  },
  {
    path: '/modules/prize-spin/widget/:ucid',
    element: <PrizeSpinStreamWidgetPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardHomePage /> },
          {
            element: <AccountActiveRoute />,
            children: [
              { path: '/modules', element: <ModulesPage /> },
              { path: '/modules/bonus-buy', element: <BonusBuyPage /> },
              {
                path: '/modules/bonus-buy/:id',
                element: <BonusBuySessionPage />,
              },
              { path: '/modules/prize-spin', element: <PrizeSpinPage /> },
              {
                path: '/modules/prize-spin/:id',
                element: <PrizeSpinSessionPage />,
              },
              { path: '/modules/chat-roll', element: <ChatRollPage /> },
              {
                path: '/modules/chat-roll/:id',
                element: <ChatRollSessionPage />,
              },
              {
                element: <OwnerRoute />,
                children: [
                  { path: '/team', element: <TeamPage /> },
                  { path: '/subscription', element: <SubscriptionPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
