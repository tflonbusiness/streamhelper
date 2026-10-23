import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import {
  AccountActiveRoute,
  GuestRoute,
  OwnerRoute,
  ProtectedRoute,
  SubscriptionAccessRoute,
} from './components/ProtectedRoute'
import { ServicePortalRoute } from './components/ServicePortalRoute'
import { ServiceShell } from './components/ServiceShell'
import { ContinueWorkspacePage } from './pages/ContinueWorkspacePage'
import { DashboardHomePage } from './pages/DashboardHomePage'
import { LoginPage } from './pages/LoginPage'
import { BonusBuyPage } from './pages/BonusBuyPage'
import { BonusBuySessionPage } from './pages/BonusBuySessionPage'
import { BonusBuyStreamWidgetPage } from './pages/BonusBuyStreamWidgetPage'
import { ModulesPage } from './pages/ModulesPage'
import { ChatRollPage } from './pages/ChatRollPage'
import { ChatRollSessionPage } from './pages/ChatRollSessionPage'
import { ChatRollStreamWidgetPage } from './pages/ChatRollStreamWidgetPage'
import { PrizeSpinPage } from './pages/PrizeSpinPage'
import { PrizeSpinSessionPage } from './pages/PrizeSpinSessionPage'
import { PrizeSpinStreamWidgetPage } from './pages/PrizeSpinStreamWidgetPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { SubscriptionAdminPage } from './pages/SubscriptionAdminPage'
import { TeamPage } from './pages/TeamPage'
import { MediaInteractivePage } from './pages/MediaInteractivePage'
import { MediaInteractiveStreamWidgetPage } from './pages/MediaInteractiveStreamWidgetPage'
import { FirstReactionPage } from './pages/FirstReactionPage'
import { FirstReactionSessionPage } from './pages/FirstReactionSessionPage'
import { FirstReactionStreamWidgetPage } from './pages/FirstReactionStreamWidgetPage'
import { GrowingJackpotPage } from './pages/GrowingJackpotPage'
import { GrowingJackpotSessionPage } from './pages/GrowingJackpotSessionPage'
import { GrowingJackpotStreamWidgetPage } from './pages/GrowingJackpotStreamWidgetPage'

export const appRouter = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    path: '/service/login',
    element: <Navigate to="/login" replace />,
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
    path: '/modules/chat-roll/widget/:ucid',
    element: <ChatRollStreamWidgetPage />,
  },
  {
    path: '/modules/media-interactive/widget/:ucid',
    element: <MediaInteractiveStreamWidgetPage />,
  },
  {
    path: '/modules/first-reaction/widget/:ucid',
    element: <FirstReactionStreamWidgetPage />,
  },
  {
    path: '/modules/growing-jackpot/widget/:ucid',
    element: <GrowingJackpotStreamWidgetPage />,
  },
  {
    path: '/internal/subscriptions',
    element: <Navigate to="/service/subscriptions" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/continue', element: <ContinueWorkspacePage /> },
      {
        element: <ServicePortalRoute />,
        children: [
          {
            element: <ServiceShell />,
            children: [
              {
                path: '/service',
                element: <Navigate to="/service/subscriptions" replace />,
              },
              {
                path: '/service/subscriptions',
                element: <SubscriptionAdminPage />,
              },
            ],
          },
        ],
      },
      {
        element: <AppShell />,
        children: [
          { path: '/dashboard', element: <DashboardHomePage /> },
          {
            element: <AccountActiveRoute />,
            children: [
              {
                element: <SubscriptionAccessRoute />,
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
                    path: '/modules/media-interactive',
                    element: <MediaInteractivePage />,
                  },
                  {
                    path: '/modules/first-reaction',
                    element: <FirstReactionPage />,
                  },
                  {
                    path: '/modules/first-reaction/:id',
                    element: <FirstReactionSessionPage />,
                  },
                  {
                    path: '/modules/growing-jackpot',
                    element: <GrowingJackpotPage />,
                  },
                  {
                    path: '/modules/growing-jackpot/:id',
                    element: <GrowingJackpotSessionPage />,
                  },
                  {
                    element: <OwnerRoute />,
                    children: [{ path: '/team', element: <TeamPage /> }],
                  },
                ],
              },
              {
                element: <OwnerRoute />,
                children: [
                  { path: '/subscription', element: <SubscriptionPage /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
