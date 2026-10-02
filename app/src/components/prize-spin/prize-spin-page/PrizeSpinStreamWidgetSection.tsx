import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { PrizeSpinWidgetSettingsDialog } from '@/components/prize-spin/prize-spin-page/PrizeSpinWidgetSettingsDialog'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { useNotification } from '@/context/NotificationContext'
import {
  buildPrizeSpinObsOverlayUrl,
  buildPrizeSpinOverlayPath,
} from '@/lib/prize-spin-overlay-url'

type PrizeSpinStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

export const PrizeSpinStreamWidgetSection = (
  props: PrizeSpinStreamWidgetSectionProps,
) => {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const overlayHref = buildPrizeSpinOverlayPath(props.accountUcid)
  const obsOverlayUrl = buildPrizeSpinObsOverlayUrl(props.accountUcid)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StreamWidgetSection
        title={t('prizeSpin.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('prizeSpin.widgetSettingsTitle')}
        onOpenSettings={() => setWidgetDialogOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('chatRoll.openOverlay')}
        obsLinkLabel={t('chatRoll.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      <PrizeSpinWidgetSettingsDialog
        accountId={props.accountId}
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
      />
    </>
  )
}
