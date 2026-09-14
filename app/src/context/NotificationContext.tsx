import Alert from '@mui/material/Alert'
import Slide, { type SlideProps } from '@mui/material/Slide'
import Snackbar from '@mui/material/Snackbar'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type NotificationTone = 'success' | 'info' | 'warning' | 'error'

type Notification = {
  message: string
  tone: NotificationTone
}

type NotificationContextValue = {
  showNotification: (message: string, tone?: NotificationTone) => void
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

function SnackbarSlideUp(props: SlideProps) {
  return <Slide {...props} direction="up" />
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null)
  const [open, setOpen] = useState(false)

  const closeNotification = useCallback(() => {
    setOpen(false)
  }, [])

  const showNotification = useCallback(
    (message: string, tone: NotificationTone = 'success') => {
      setNotification({ message, tone })
      setOpen(true)
    },
    [],
  )

  const showSuccess = useCallback(
    (message: string) => {
      showNotification(message, 'success')
    },
    [showNotification],
  )

  const showError = useCallback(
    (message: string) => {
      showNotification(message, 'error')
    },
    [showNotification],
  )

  const value = useMemo(
    () => ({
      showNotification,
      showSuccess,
      showError,
    }),
    [showNotification, showSuccess, showError],
  )

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={(_, reason) => {
          if (reason === 'clickaway') {
            return
          }
          closeNotification()
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ bottom: { xs: 16, sm: 24 }, right: { xs: 16, sm: 24 } }}
        slots={{ transition: SnackbarSlideUp }}
        slotProps={{
          transition: {
            onExited: () => setNotification(null),
          },
        }}
      >
        {notification ? (
          <Alert
            severity={notification.tone}
            onClose={closeNotification}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }

  return context
}
