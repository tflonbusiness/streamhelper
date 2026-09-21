import { Button, Card, CardContent, Stack } from '@mui/material'
import MonitorIcon from '@mui/icons-material/Monitor'
import SettingsIcon from '@mui/icons-material/Settings'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { ChatRollWidgetSettingsDialog } from '@/components/chat-roll/chat-roll-page/ChatRollWidgetSettingsDialog'
import { SectionHeader } from '@/components/SectionHeader'

type ChatRollStreamWidgetSectionProps = {
  accountId: number
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

export const ChatRollStreamWidgetSection = (
  props: ChatRollStreamWidgetSectionProps,
) => {
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title="Stream Widget"
            description="OBS overlay dimensions for your chat roll widget"
            icon={MonitorIcon}
            iconVariant="info"
            action={
              <Button
                type="button"
                variant="outlined"
                startIcon={<SettingsIcon fontSize="small" aria-hidden />}
                onClick={() => setWidgetDialogOpen(true)}
              >
                Widget settings
              </Button>
            }
          />
          <Stack spacing={1}>
            {/* Public overlay route is deferred; widget dimensions are configured here. */}
          </Stack>
        </StyledCardContent>
      </StyledCard>
      <ChatRollWidgetSettingsDialog
        accountId={props.accountId}
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
      />
    </>
  )
}
