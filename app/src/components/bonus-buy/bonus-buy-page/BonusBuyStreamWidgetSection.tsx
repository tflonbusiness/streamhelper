import { Button, Card, CardContent, Stack } from '@mui/material'
import { useTranslation } from 'react-i18next'
import LinkIcon from '@mui/icons-material/Link'
import MonitorIcon from '@mui/icons-material/Monitor'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PaletteIcon from '@mui/icons-material/Palette'
import { styled } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BonusBuyWidgetStyleDialog } from '@/components/bonus-buy/session/BonusBuyWidgetStyleDialog'
import { SectionHeader } from '@/components/SectionHeader'
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
      <StyledCard elevation={0}>
        <StyledCardContent>
          <SectionHeader
            title={t('bonusBuy.streamWidgetTitle')}
            description={t('bonusBuy.streamWidgetDescription')}
            icon={MonitorIcon}
            iconVariant="info"
            showDivider={false}
          />
          <StyledActionsStack>
            <ActionButton
              type="button"
              variant="outlined"
              startIcon={<PaletteIcon fontSize="small" aria-hidden />}
              onClick={() => setWidgetDialogOpen(true)}
            >
              {t('bonusBuy.widgetStyle')}
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
