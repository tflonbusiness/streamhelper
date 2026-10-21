import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { FirstReactionWidgetCard } from '@/components/first-reaction/widget/FirstReactionWidgetCard'
import { useFirstReactionWidgetPreviewView } from '@/hooks/use-first-reaction-widget-preview-view'

type FirstReactionWidgetPreviewProps = {
  accountUcid: string
  open: boolean
  width: number
  height: number
}

export function FirstReactionWidgetPreview({
  accountUcid,
  open,
  width,
  height,
}: FirstReactionWidgetPreviewProps) {
  const { t } = useTranslation()
  const { view, isLive } = useFirstReactionWidgetPreviewView(accountUcid, open, {
    width,
    height,
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'baseline' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {t('firstReaction.widgetPreviewLabel')} · {width} × {height}
        </Typography>
        {!isLive ? (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            {t('firstReaction.widgetPreviewDemoHint')}
          </Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          position: 'relative',
          minHeight: 280,
          maxHeight: 520,
          bgcolor: '#050506',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          p: 1.5,
        }}
      >
        <Box
          sx={{
            width,
            height,
            flexShrink: 0,
            mx: 'auto',
          }}
        >
          <FirstReactionWidgetCard view={view} width={width} height={height} />
        </Box>
      </Box>
    </Box>
  )
}
