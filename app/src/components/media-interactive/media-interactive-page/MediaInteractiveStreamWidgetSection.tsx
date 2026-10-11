import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { MediaInteractiveSettingsDialog } from '@/components/media-interactive/media-interactive-page/MediaInteractiveSettingsDialog'
import { useNotification } from '@/context/NotificationContext'
import {
  buildMediaInteractiveObsOverlayUrl,
  buildMediaInteractiveOverlayPath,
} from '@/lib/media-interactive-overlay-url'

type MediaInteractiveStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

export function MediaInteractiveStreamWidgetSection({
  accountId,
  accountUcid,
}: MediaInteractiveStreamWidgetSectionProps) {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const overlayHref = buildMediaInteractiveOverlayPath(accountUcid)
  const obsOverlayUrl = buildMediaInteractiveObsOverlayUrl(accountUcid)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StreamWidgetSection
        title={t('mediaInteractive.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('mediaInteractive.streamWidgetSettingsButton')}
        onOpenSettings={() => setSettingsOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('mediaInteractive.openOverlay')}
        obsLinkLabel={t('mediaInteractive.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      <MediaInteractiveSettingsDialog
        accountId={accountId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
