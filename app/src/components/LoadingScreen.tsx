import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
import { PageShell } from '@/components/PageShell'

export function LoadingScreen() {
  const { t } = useTranslation()

  return (
    <PageShell>
      <Box
        role="status"
        aria-live="polite"
        aria-label={t('common.loading')}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
          py: 8,
        }}
      >
        <CircularProgress size={24} thickness={4} sx={{ color: 'primary.main' }} />
        <Typography variant="caption" color="text.secondary">
          {t('common.loading')}
        </Typography>
      </Box>
    </PageShell>
  )
}
