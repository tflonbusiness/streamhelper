import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FirstReactionWidgetPreview } from '@/components/first-reaction/widget/FirstReactionWidgetPreview'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import { useNotification } from '@/context/NotificationContext'
import { FIRST_REACTION_WIDGET_DEFAULTS } from '@/lib/first-reaction-widget-defaults'
import {
  useFirstReactionWidget,
  usePatchFirstReactionStreamWidgetSettings,
} from '@/queries/use-first-reaction-stream-widget-settings'

type FirstReactionStreamWidgetSettingsDialogProps = {
  accountId: number
  accountUcid: string
  open: boolean
  onClose: () => void
}

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}))

const StyledField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export function FirstReactionStreamWidgetSettingsDialog({
  accountId,
  accountUcid,
  open,
  onClose,
}: FirstReactionStreamWidgetSettingsDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const { data: widget } = useFirstReactionWidget(open ? accountId : undefined)
  const patchMutation = usePatchFirstReactionStreamWidgetSettings(accountId)

  const [width, setWidth] = useState(FIRST_REACTION_WIDGET_DEFAULTS.width)
  const [height, setHeight] = useState(FIRST_REACTION_WIDGET_DEFAULTS.height)

  useEffect(() => {
    if (widget) {
      setWidth(widget.width)
      setHeight(widget.height)
    }
  }, [widget])

  const handleSave = () => {
    patchMutation.mutate(
      { width, height },
      {
        onSuccess: () => {
          showSuccess(t('firstReaction.widgetSettingsSaved'))
          onClose()
        },
        onError: (error) =>
          showError(
            error instanceof Error
              ? error.message
              : t('firstReaction.couldNotSaveWidgetSettings'),
          ),
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <WidgetSettingsDialogTitle>
        {t('firstReaction.streamWidgetSettingsTitle')}
      </WidgetSettingsDialogTitle>
      <DialogContent>
        <StyledFormStack>
          <StyledField
            type="number"
            label={t('common.width')}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
          <StyledField
            type="number"
            label={t('common.height')}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
          <FirstReactionWidgetPreview
            accountUcid={accountUcid}
            open={open}
            width={width}
            height={height}
          />
        </StyledFormStack>
      </DialogContent>
      <StyledDialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          disabled={patchMutation.isPending}
          onClick={handleSave}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
