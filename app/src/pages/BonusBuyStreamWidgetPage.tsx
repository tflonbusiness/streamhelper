import { Box } from '@mui/material'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { BonusBuyWidgetNotFoundError } from '@/api/bonus-buy'
import { BonusBuyWidgetCard } from '@/components/bonus-buy/widget/BonusBuyWidgetCard'
import { StreamWidgetMessage } from '@/components/widget/StreamWidgetMessage'
import { deriveBonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'
import { publicWidgetUnavailableMessage } from '@/lib/public-widget'
import { usePinWidgetUiEnglish, widgetUiCopy } from '@/i18n/widget-ui'
import { usePublicBonusBuyWidget } from '@/queries/use-bonus-buy'

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function BonusBuyStreamWidgetPage() {
  usePinWidgetUiEnglish()
  const { ucid } = useParams<{ ucid: string }>()

  const accountUcid = useMemo(() => {
    if (!ucid || !UUID_REGEX.test(ucid)) {
      return null
    }
    return ucid
  }, [ucid])

  const { data: view, isPending, isError, error } =
    usePublicBonusBuyWidget(accountUcid)

  const cardProps = useMemo(() => {
    if (!view || view.status !== 'active') {
      return null
    }

    return deriveBonusBuyWidgetCardProps(
      {
        id: view.record.id,
        name: view.record.name,
        startBalance: view.record.startBalance,
        currencyCode: view.record.currencyCode,
      },
      view.slots,
      view.settings,
    )
  }, [view])

  if (accountUcid === null) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
  }

  if (isPending) {
    return null
  }

  if (error instanceof BonusBuyWidgetNotFoundError || isError) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
  }

  if (!view) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
  }

  if (view.status === 'unavailable') {
    return (
      <StreamWidgetMessage
        message={publicWidgetUnavailableMessage('bonusBuy', view.reason)}
      />
    )
  }

  if (!cardProps) {
    return <StreamWidgetMessage message={widgetUiCopy.accountNotFound} />
  }

  const theme = view.settings

  return (
    <Box
      sx={{
        width: theme.width,
        height: theme.height,
        minWidth: theme.width,
        minHeight: theme.height,
        maxWidth: theme.width,
        maxHeight: theme.height,
        bgcolor: 'transparent',
        overflow: 'hidden',
        fontFamily: theme.fontFamily,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      <BonusBuyWidgetCard {...cardProps} />
    </Box>
  )
}
