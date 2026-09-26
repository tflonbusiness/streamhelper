import { Button, Card, CardContent, Stack } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import MonitorIcon from '@mui/icons-material/Monitor'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SettingsIcon from '@mui/icons-material/Settings'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PrizeSpinWidgetSettingsDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinWidgetSettingsDialog'
import { SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import {
  buildPrizeSpinObsOverlayUrl,
  buildPrizeSpinOverlayPath,
} from '@/lib/prize-spin-overlay-url'

type PrizeSpinStreamWidgetSectionProps = {
  accountId: number
  prizeSpinId: number
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

const StyledActionsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  alignItems: 'stretch',
  width: '100%',
}))

const ActionButton = styled(Button)(() => ({
  minHeight: 36.5,
}))

const FullWidthActionButton = styled(ActionButton)({
  width: '100%',
  justifyContent: 'flex-start',
})

export const PrizeSpinStreamWidgetSection = (
  props: PrizeSpinStreamWidgetSectionProps,
) => {
  const { showSuccess } = useNotification()
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const overlayHref = buildPrizeSpinOverlayPath(props.prizeSpinId)
  const obsOverlayUrl = buildPrizeSpinObsOverlayUrl(props.prizeSpinId)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess('OBS link copied.')
  }

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title="Stream Widget"
            description="OBS overlay settings and links for this prize spin session"
            icon={MonitorIcon}
            iconVariant="info"
          />
          <StyledActionsStack direction="column">
            <FullWidthActionButton
              type="button"
              variant="outlined"
              startIcon={<SettingsIcon fontSize="small" aria-hidden />}
              onClick={() => setWidgetDialogOpen(true)}
            >
              Widget settings
            </FullWidthActionButton>
            <FullWidthActionButton
              variant="outlined"
              disabled={!overlayHref}
              startIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
              {...(overlayHref
                ? {
                    component: Link,
                    to: overlayHref,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                  }
                : { type: 'button' })}
            >
              Open overlay
            </FullWidthActionButton>
            <FullWidthActionButton
              type="button"
              variant="outlined"
              startIcon={<LinkIcon fontSize="small" aria-hidden />}
              disabled={!obsOverlayUrl}
              onClick={() => void handleCopyObsLink()}
            >
              OBS link
            </FullWidthActionButton>
          </StyledActionsStack>
        </StyledCardContent>
      </StyledCard>
      <PrizeSpinWidgetSettingsDialog
        accountId={props.accountId}
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
      />
    </>
  )
}
