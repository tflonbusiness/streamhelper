import { Button, Card, CardContent, Stack } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import MonitorIcon from '@mui/icons-material/Monitor'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SettingsIcon from '@mui/icons-material/Settings'
import { styled } from '@mui/material/styles'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChatRollStreamWidgetSettingsDialog } from '@/components/chat-roll/chat-roll-page/ChatRollStreamWidgetSettingsDialog'
import { SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import {
  buildChatRollObsOverlayUrl,
  buildChatRollOverlayPath,
} from '@/lib/chat-roll-overlay-url'

type ChatRollStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  width: '100%',
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

const StyledActionsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  alignItems: 'flex-start',
}))

const ActionButton = styled(Button)(() => ({
  minHeight: 36.5,
}))

export const ChatRollStreamWidgetSection = (
  props: ChatRollStreamWidgetSectionProps,
) => {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const overlayHref = buildChatRollOverlayPath(props.accountUcid)
  const obsOverlayUrl = buildChatRollObsOverlayUrl(props.accountUcid)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title={t('chatRoll.streamWidgetTitle')}
            description={t('chatRoll.streamWidgetDescription')}
            icon={MonitorIcon}
            iconVariant="info"
            showDivider={false}
          />
          <StyledActionsStack>
            <ActionButton
              type="button"
              variant="outlined"
              startIcon={<SettingsIcon fontSize="small" aria-hidden />}
              onClick={() => setSettingsOpen(true)}
            >
              {t('chatRoll.streamWidgetSettingsButton')}
            </ActionButton>
            <ActionButton
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
              {t('chatRoll.openOverlay')}
            </ActionButton>
            <ActionButton
              type="button"
              variant="outlined"
              startIcon={<LinkIcon fontSize="small" aria-hidden />}
              disabled={!obsOverlayUrl}
              onClick={() => void handleCopyObsLink()}
            >
              {t('chatRoll.obsLink')}
            </ActionButton>
          </StyledActionsStack>
        </StyledCardContent>
      </StyledCard>
      <ChatRollStreamWidgetSettingsDialog
        accountId={props.accountId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
