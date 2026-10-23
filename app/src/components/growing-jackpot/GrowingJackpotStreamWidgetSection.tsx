import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GrowingJackpotStreamWidgetSettingsDialog } from '@/components/growing-jackpot/growing-jackpot-page/GrowingJackpotStreamWidgetSettingsDialog'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { useNotification } from '@/context/NotificationContext'
import {
  buildGrowingJackpotObsOverlayUrl,
  buildGrowingJackpotOverlayPath,
} from '@/lib/growing-jackpot-overlay-url'

type GrowingJackpotStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

export function GrowingJackpotStreamWidgetSection(
  props: GrowingJackpotStreamWidgetSectionProps,
) {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const overlayHref = buildGrowingJackpotOverlayPath(props.accountUcid)
  const obsOverlayUrl = buildGrowingJackpotObsOverlayUrl(props.accountUcid)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StreamWidgetSection
        title={t('growingJackpot.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('growingJackpot.streamWidgetSettingsButton')}
        onOpenSettings={() => setSettingsOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('growingJackpot.openOverlay')}
        obsLinkLabel={t('growingJackpot.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      <GrowingJackpotStreamWidgetSettingsDialog
        accountId={props.accountId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
