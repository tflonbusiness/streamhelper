import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { alpha, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import type { AuthUser } from '@/api/auth'
import { IconTile } from '@/components/IconTile'
import { cardSx } from '@/theme/colors'

type DashboardSubscriptionExpiredStateProps = {
  user: AuthUser
}

function subscriptionExpiredBody(
  user: AuthUser,
  t: (key: string) => string,
): string {
  if (user.role === 'moderator') {
    return t('subscription.trialExpiredModeratorBody')
  }
  return t('subscription.trialExpiredBody')
}

export function DashboardSubscriptionExpiredState({
  user,
}: DashboardSubscriptionExpiredStateProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const isOwner = user.role === 'owner'

  return (
    <Card
      sx={{
        ...cardSx,
        overflow: 'hidden',
        background: `linear-gradient(145deg, ${alpha(theme.palette.error.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 1)} 48%)`,
        borderColor: alpha(theme.palette.error.main, 0.22),
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <IconTile icon={LockOutlinedIcon} variant="danger" size="lg" />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="h5"
                component="h2"
                sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 }}
              >
                {t('subscription.trialExpiredTitle')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, lineHeight: 1.55 }}
              >
                {subscriptionExpiredBody(user, t)}
              </Typography>
              {isOwner ? (
                <Button
                  component={RouterLink}
                  to="/subscription"
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{ mt: 2, alignSelf: 'flex-start' }}
                >
                  {t('subscription.manageSubscriptionCta')}
                </Button>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}
