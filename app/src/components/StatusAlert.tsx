import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import type { SxProps, Theme } from '@mui/material/styles'

export type StatusAlertTone = 'success' | 'info' | 'warning' | 'error'

type StatusAlertProps = {
  tone: StatusAlertTone
  title?: string
  children: React.ReactNode
  sx?: SxProps<Theme>
}

export function StatusAlert({ tone, title, children, sx }: StatusAlertProps) {
  return (
    <Alert severity={tone} sx={{ py: 2, ...sx }}>
      {title ? (
        <>
          <AlertTitle>{title}</AlertTitle>
          {children}
        </>
      ) : (
        children
      )}
    </Alert>
  )
}
