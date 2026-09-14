import Box from '@mui/material/Box'

type PageShellProps = {
  children: React.ReactNode
  wide?: boolean
  className?: string
}

export function PageShell({ children, wide = false, className }: PageShellProps) {
  return (
    <Box
      component="main"
      className={className}
      sx={{
        display: 'flex',
        minHeight: '100svh',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: wide ? 576 : 448 }}>
        {children}
      </Box>
    </Box>
  )
}
