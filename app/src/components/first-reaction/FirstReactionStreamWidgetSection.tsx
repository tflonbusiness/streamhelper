import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FirstReactionStreamWidgetSettingsDialog } from '@/components/first-reaction/first-reaction-page/FirstReactionStreamWidgetSettingsDialog'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { useNotification } from '@/context/NotificationContext'
import {
  buildFirstReactionObsOverlayUrl,
  buildFirstReactionOverlayPath,
} from '@/lib/first-reaction-overlay-url'

type FirstReactionStreamWidgetSectionProps = {
  accountId?: number
  accountUcid: string
}

export function FirstReactionStreamWidgetSection(
  props: FirstReactionStreamWidgetSectionProps,
) {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const overlayHref = buildFirstReactionOverlayPath(props.accountUcid)
  const obsOverlayUrl = buildFirstReactionObsOverlayUrl(props.accountUcid)

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StreamWidgetSection
        title={t('firstReaction.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('firstReaction.streamWidgetSettingsButton')}
        onOpenSettings={() => setSettingsOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('firstReaction.openOverlay')}
        obsLinkLabel={t('firstReaction.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      {props.accountId !== undefined ? (
        <FirstReactionStreamWidgetSettingsDialog
          accountId={props.accountId}
          accountUcid={props.accountUcid}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </>
  )
}
