import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatRollStreamWidgetSettingsDialog } from '@/components/chat-roll/chat-roll-page/ChatRollStreamWidgetSettingsDialog'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { useNotification } from '@/context/NotificationContext'
import {
  buildChatRollObsOverlayUrl,
  buildChatRollOverlayPath,
} from '@/lib/chat-roll-overlay-url'

type ChatRollStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

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
      <StreamWidgetSection
        title={t('chatRoll.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('chatRoll.streamWidgetSettingsButton')}
        onOpenSettings={() => setSettingsOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('chatRoll.openOverlay')}
        obsLinkLabel={t('chatRoll.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      <ChatRollStreamWidgetSettingsDialog
        accountId={props.accountId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
