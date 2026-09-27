import { Box, Typography } from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { BonusBuySessionArchivedError } from '@/api/bonus-buy'
import { BonusBuyWidgetCard } from '@/components/bonus-buy/widget/BonusBuyWidgetCard'
import { deriveBonusBuyWidgetCardProps } from '@/lib/bonus-buy-widget-presentation'
import {
  readStoredLocale,
  resolveInitialLocale,
} from '@/i18n/app-locale'
import { applyDocumentLocale } from '@/i18n/init-i18n'
import { usePublicBonusBuyWidget } from '@/queries/use-bonus-buy'

function WidgetNotFound({ textMutedColor }: { textMutedColor?: string }) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <Typography sx={{ color: textMutedColor ?? '#9CA3AF', fontSize: '1rem' }}>
        {t('errors.sessionNotFound')}
      </Typography>
    </Box>
  )
}

function WidgetInactive() {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
        fontFamily: 'Inter, system-ui, sans-serif',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography sx={{ color: '#9CA3AF', fontSize: '1rem', maxWidth: 420 }}>
        {t('bonusBuy.widgetInactive')}
      </Typography>
    </Box>
  )
}

export function BonusBuyStreamWidgetPage() {
  const { i18n } = useTranslation()
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const initial = resolveInitialLocale(readStoredLocale())
    if (i18n.language !== initial) {
      void i18n.changeLanguage(initial)
      applyDocumentLocale(initial)
    }
  }, [i18n])
  const bonusBuyId = useMemo(() => {
    if (!id) {
      return null
    }
    const parsed = Number.parseInt(id, 10)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  const {
    data: view,
    isPending,
    isError,
    error,
  } = usePublicBonusBuyWidget(bonusBuyId)

  const cardProps = useMemo(() => {
    if (!view) {
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

  if (bonusBuyId === null) {
    return <WidgetNotFound />
  }

  if (isPending) {
    return null
  }

  if (error instanceof BonusBuySessionArchivedError) {
    return <WidgetInactive />
  }

  if (isError || !view || !cardProps) {
    return <WidgetNotFound />
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
