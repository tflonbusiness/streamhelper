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
import type {
  FirstReactionWidget,
  FirstReactionWidgetStylePreset,
} from '@/api/first-reaction'
import { FirstReactionWidgetStyleForm } from '@/components/first-reaction/first-reaction-page/FirstReactionWidgetStyleForm'
import { FirstReactionWidgetThemePresetPicker } from '@/components/first-reaction/FirstReactionWidgetThemePresetPicker'
import { FirstReactionWidgetPreview } from '@/components/first-reaction/widget/FirstReactionWidgetPreview'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import { useNotification } from '@/context/NotificationContext'
import { useFirstReactionWidgetDraft } from '@/hooks/use-first-reaction-widget-draft'
import { FIRST_REACTION_WIDGET_PREVIEW_BACKDROP_DEFAULT } from '@/lib/first-reaction-widget-style-defaults'
import {
  extractFirstReactionWidgetStyleSettings,
  matchFirstReactionWidgetPresetFromList,
} from '@/lib/first-reaction-widget-presets'
import {
  useFirstReactionWidget,
  usePatchFirstReactionStreamWidgetSettings,
} from '@/queries/use-first-reaction-stream-widget-settings'
import {
  useFirstReactionWidgetPresets,
  useUpsertFirstReactionWidgetCustomPreset,
} from '@/queries/use-first-reaction-widget-presets'

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
  const { data: widget, isLoading: isLoadingWidget } = useFirstReactionWidget(
    open ? accountId : undefined,
  )
  const { data: widgetPresets = [] } = useFirstReactionWidgetPresets(
    open ? accountId : undefined,
  )
  const patchMutation = usePatchFirstReactionStreamWidgetSettings(
    accountId,
    accountUcid,
  )
  const upsertCustomPresetMutation = useUpsertFirstReactionWidgetCustomPreset(
    accountId,
  )

  const [previewBackdropColor, setPreviewBackdropColor] = useState(
    FIRST_REACTION_WIDGET_PREVIEW_BACKDROP_DEFAULT,
  )

  useEffect(() => {
    if (open) {
      setPreviewBackdropColor(FIRST_REACTION_WIDGET_PREVIEW_BACKDROP_DEFAULT)
    }
  }, [open])

  async function handleSave(
    widgetDraft: FirstReactionWidget,
    presets: FirstReactionWidgetStylePreset[],
  ) {
    const systemPresets = presets.filter((preset) => preset.source === 'system')
    const matchedSystemPresetId = matchFirstReactionWidgetPresetFromList(
      widgetDraft,
      systemPresets,
    )

    let presetId: number
    if (matchedSystemPresetId !== null) {
      presetId = matchedSystemPresetId
    } else {
      const customPreset = await upsertCustomPresetMutation.mutateAsync({
        style_settings: extractFirstReactionWidgetStyleSettings(widgetDraft),
      })
      presetId = customPreset.id
    }

    await patchMutation.mutateAsync({
      width: widgetDraft.width,
      height: widgetDraft.height,
      preset_id: presetId,
    })
    showSuccess(t('firstReaction.widgetSettingsSaved'))
    onClose()
  }

  const {
    widgetDraft,
    activeWidgetPresetId,
    isSaving,
    updateWidgetDraft,
    updateStyleDraft,
    applyWidgetPreset,
    saveWidgetStyle,
  } = useFirstReactionWidgetDraft({
    widgetSettings: widget,
    widgetPresets,
    onSave: handleSave,
    onError: showError,
  })

  const isPending =
    isSaving ||
    patchMutation.isPending ||
    upsertCustomPresetMutation.isPending

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <WidgetSettingsDialogTitle>
        {t('firstReaction.streamWidgetSettingsTitle')}
      </WidgetSettingsDialogTitle>
      <DialogContent>
        {isLoadingWidget || !widgetDraft ? (
          <StyledFormStack>{t('common.loadingSettings')}</StyledFormStack>
        ) : (
          <StyledFormStack>
            <StyledField
              type="number"
              label={t('common.width')}
              value={widgetDraft.width}
              onChange={(e) =>
                updateWidgetDraft('width', Number(e.target.value))
              }
            />
            <StyledField
              type="number"
              label={t('common.height')}
              value={widgetDraft.height}
              onChange={(e) =>
                updateWidgetDraft('height', Number(e.target.value))
              }
            />
            <FirstReactionWidgetThemePresetPicker
              presets={widgetPresets}
              activePresetId={activeWidgetPresetId}
              onSelectPreset={applyWidgetPreset}
            />
            <FirstReactionWidgetStyleForm
              draft={widgetDraft.style}
              onUpdate={updateStyleDraft}
            />
            <FirstReactionWidgetPreview
              accountUcid={accountUcid}
              open={open}
              width={widgetDraft.width}
              height={widgetDraft.height}
              styleDraft={widgetDraft.style}
              previewBackdropColor={previewBackdropColor}
              onPreviewBackdropColorChange={setPreviewBackdropColor}
            />
          </StyledFormStack>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          disabled={isPending || !widgetDraft}
          onClick={() => void saveWidgetStyle()}
        >
          {t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
