import { useTranslation } from 'react-i18next'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  BonusBuyRecord,
  BonusBuySlot,
  BonusBuyWidgetSettings,
  BonusBuyWidgetStylePreset,
} from '@/api/bonus-buy'
import { BonusBuyWidgetStyleForm } from '@/components/bonus-buy/BonusBuyWidgetStyleForm'
import { WidgetStylePreview } from '@/components/bonus-buy/WidgetStylePreview'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import { WidgetThemePresetPicker } from '@/components/bonus-buy/WidgetThemePresetPicker'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useBonusBuyWidgetDraft } from '@/hooks/useBonusBuyWidgetDraft'
import { bonusBuyWidgetRoute } from '@/lib/routes'
import {
  extractBonusBuyWidgetStyleSettings,
  matchBonusBuyWidgetPresetFromList,
} from '@/lib/bonus-buy-widget-presets'
import {
  useBonusBuyWidget,
  useBonusBuyWidgetPresets,
  usePatchBonusBuyWidget,
  useUpsertBonusBuyWidgetCustomPreset,
} from '@/queries/use-bonus-buy'

type BonusBuyWidgetStyleDialogProps = {
  accountId: number
  accountUcid: string
  record: BonusBuyRecord | null
  slots: BonusBuySlot[]
  open: boolean
  onClose: () => void
}

const StyledStatusAlert = styled(StatusAlert)(({ theme }) => ({
  marginTop: theme.spacing(1),
}))

const StyledContentGrid = styled(Grid)(({ theme }) => ({
  marginTop: theme.spacing(1),
}))

const StyledPreviewGrid = styled(Grid)(({ theme }) => ({
  display: 'none',
  flexDirection: 'column',
  minHeight: 0,
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    minHeight: 520,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

const StyledPreviewDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

const StyledMobilePreviewButton = styled(Button)(({ theme }) => ({
  display: 'inline-flex',
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}))

export const BonusBuyWidgetStyleDialog = (
  props: BonusBuyWidgetStyleDialogProps,
) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const patchWidgetMutation = usePatchBonusBuyWidget(props.accountId)
  const upsertCustomPresetMutation = useUpsertBonusBuyWidgetCustomPreset(
    props.accountId,
  )

  const [widgetPreviewDialogOpen, setWidgetPreviewDialogOpen] = useState(false)

  useEffect(() => {
    if (!props.open) {
      setWidgetPreviewDialogOpen(false)
    }
  }, [props.open])

  const {
    data: widgetSettings,
    isLoading: isLoadingWidget,
    error: widgetLoadError,
  } = useBonusBuyWidget(props.accountId, props.open)

  const { data: widgetPresets = [] } = useBonusBuyWidgetPresets(
    props.open ? props.accountId : undefined,
  )

  useEffect(() => {
    if (!props.open || !widgetLoadError) {
      return
    }

    showError(
      widgetLoadError instanceof Error
        ? widgetLoadError.message
        : t('bonusBuy.couldNotLoadWidgetSettings'),
    )
  }, [props.open, showError, widgetLoadError, t])

  async function handleSave(
    widgetDraft: BonusBuyWidgetSettings,
    presets: BonusBuyWidgetStylePreset[],
  ) {
    const systemPresets = presets.filter((preset) => preset.source === 'system')
    const matchedSystemPresetId = matchBonusBuyWidgetPresetFromList(
      widgetDraft,
      systemPresets,
    )

    let presetId: number
    if (matchedSystemPresetId !== null) {
      presetId = matchedSystemPresetId
    } else {
      const customPreset = await upsertCustomPresetMutation.mutateAsync({
        style_settings: extractBonusBuyWidgetStyleSettings(widgetDraft),
      })
      presetId = customPreset.id
    }

    await patchWidgetMutation.mutateAsync({
      width: widgetDraft.width,
      height: widgetDraft.height,
      preset_id: presetId,
    })
    props.onClose()
    showSuccess(t('bonusBuy.widgetStyleSaved'))
  }

  const {
    widgetDraft,
    widgetDraftValidationError,
    widgetPreviewTheme,
    widgetPreviewDimensionLabel,
    activeWidgetPresetId,
    isSaving,
    updateWidgetDraft,
    applyWidgetPreset,
    saveWidgetStyle,
  } = useBonusBuyWidgetDraft({
    widgetSettings,
    widgetPresets,
    onSave: handleSave,
    onError: showError,
  })

  const isPending =
    isSaving ||
    patchWidgetMutation.isPending ||
    upsertCustomPresetMutation.isPending

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        maxWidth="lg"
        fullWidth
      >
        <WidgetSettingsDialogTitle>{t('bonusBuy.widgetStyle')}</WidgetSettingsDialogTitle>
        <DialogContent>
          {isLoadingWidget ? (
            <StyledStatusAlert tone="info">
              {t('common.loadingSettings')}
            </StyledStatusAlert>
          ) : widgetLoadError ? null : widgetDraft ? (
            <StyledContentGrid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <WidgetThemePresetPicker
                  presets={widgetPresets}
                  activePresetId={activeWidgetPresetId}
                  onSelectPreset={applyWidgetPreset}
                  compact
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <BonusBuyWidgetStyleForm
                  draft={widgetDraft}
                  onUpdate={updateWidgetDraft}
                />
              </Grid>
              <StyledPreviewGrid size={{ xs: 12, md: 6 }}>
                <WidgetStylePreview
                  record={props.record}
                  slots={props.slots}
                  previewTheme={widgetPreviewTheme}
                  dimensionLabel={widgetPreviewDimensionLabel}
                  validationError={widgetDraftValidationError}
                />
              </StyledPreviewGrid>
            </StyledContentGrid>
          ) : null}
        </DialogContent>
        <StyledDialogActions>
          <StyledMobilePreviewButton
            onClick={() => setWidgetPreviewDialogOpen(true)}
            disabled={!widgetDraft}
          >
            Preview
          </StyledMobilePreviewButton>
          <Button
            component={Link}
            to={bonusBuyWidgetRoute(props.accountUcid)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview overlay
          </Button>
          <Button onClick={props.onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void saveWidgetStyle()}
            disabled={isPending || isLoadingWidget || !widgetDraft}
          >
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </StyledDialogActions>
      </Dialog>
      <Dialog
        open={widgetPreviewDialogOpen}
        onClose={() => setWidgetPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{t('common.widgetPreview')}</DialogTitle>
        <DialogContent>
          <WidgetStylePreview
            record={props.record}
            slots={props.slots}
            previewTheme={widgetPreviewTheme}
            dimensionLabel={widgetPreviewDimensionLabel}
            validationError={widgetDraftValidationError}
          />
        </DialogContent>
        <StyledPreviewDialogActions>
          <Button onClick={() => setWidgetPreviewDialogOpen(false)}>{t('common.close')}</Button>
        </StyledPreviewDialogActions>
      </Dialog>
    </>
  )
}
