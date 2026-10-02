import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { BonusBuyWidgetStyleDialog } from '@/components/bonus-buy/session/BonusBuyWidgetStyleDialog'
import { StreamWidgetSection } from '@/components/StreamWidgetSection'
import { useNotification } from '@/context/NotificationContext'
import { findLiveBonusBuyRecord } from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import {
  buildBonusBuyObsOverlayUrl,
  buildBonusBuyOverlayPath,
} from '@/lib/bonus-buy-overlay-url'
import { useBonusBuySession, useBonusBuys } from '@/queries/use-bonus-buy'

type BonusBuyStreamWidgetSectionProps = {
  accountId: number
  accountUcid: string
}

const LIVE_PEEK_LIMIT = 50

export const BonusBuyStreamWidgetSection = (
  props: BonusBuyStreamWidgetSectionProps,
) => {
  const { t } = useTranslation()
  const { showSuccess } = useNotification()
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)
  const overlayHref = buildBonusBuyOverlayPath(props.accountUcid)
  const obsOverlayUrl = buildBonusBuyObsOverlayUrl(props.accountUcid)

  const { data: activePeekResult } = useBonusBuys(
    widgetDialogOpen ? props.accountId : undefined,
    {
      archived: 'false',
      page: 1,
      limit: LIVE_PEEK_LIMIT,
    },
  )

  const previewRecord = useMemo(() => {
    const records = activePeekResult?.records ?? []
    const live = findLiveBonusBuyRecord(records)
    return live ?? records[0] ?? null
  }, [activePeekResult?.records])

  const { data: previewSession } = useBonusBuySession(
    props.accountId,
    widgetDialogOpen && previewRecord ? previewRecord.id : null,
  )

  const previewSlots = previewSession?.slots ?? []

  const handleCopyObsLink = async () => {
    await navigator.clipboard.writeText(obsOverlayUrl)
    showSuccess(t('bonusBuy.obsLinkCopied'))
  }

  return (
    <>
      <StreamWidgetSection
        title={t('bonusBuy.streamWidgetTitle')}
        description={t('common.streamWidgetDescription')}
        settingsLabel={t('bonusBuy.widgetStyle')}
        onOpenSettings={() => setWidgetDialogOpen(true)}
        overlayHref={overlayHref}
        openOverlayLabel={t('chatRoll.openOverlay')}
        obsLinkLabel={t('chatRoll.obsLink')}
        obsOverlayUrl={obsOverlayUrl}
        onCopyObsLink={() => void handleCopyObsLink()}
      />
      <BonusBuyWidgetStyleDialog
        accountId={props.accountId}
        accountUcid={props.accountUcid}
        record={previewRecord}
        slots={previewSlots}
        open={widgetDialogOpen}
        onClose={() => setWidgetDialogOpen(false)}
      />
    </>
  )
}
