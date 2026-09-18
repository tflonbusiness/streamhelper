import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SendIcon from '@mui/icons-material/Send'
import { alpha, useTheme } from '@mui/material/styles'
import {
  getTelegramSupportUrl,
  getTelegramSupportUsername,
} from '@/lib/subscription-plan'

export function TelegramActivationNotice() {
  const theme = useTheme()
  const username = getTelegramSupportUsername()
  const telegramUrl = getTelegramSupportUrl()

  return (
    <Card
      sx={{
        borderColor: alpha(theme.palette.primary.main, 0.2),
        bgcolor: alpha(theme.palette.primary.main, 0.05),
      }}
    >
      <CardContent sx={{ pb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              width: 40,
              height: 40,
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            }}
          >
            <SendIcon sx={{ fontSize: 20 }} aria-hidden />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="subtitle1" component="h3">
              Subscription activation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact us on Telegram to upgrade to a paid plan
            </Typography>
          </Box>
        </Box>
      </CardContent>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Message our support team — we will help you choose a plan and activate
          a subscription for your team.
        </Typography>
        <Button
          component="a"
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          variant="contained"
          endIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
          sx={{ alignSelf: 'flex-start', width: 'auto' }}
        >
          Message @{username}
        </Button>
      </CardContent>
    </Card>
  )
}
