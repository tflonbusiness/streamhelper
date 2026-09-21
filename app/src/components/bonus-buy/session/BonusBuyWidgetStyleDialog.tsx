import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from '@mui/material'
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
import { WidgetThemePresetPicker } from '@/components/bonus-buy/WidgetThemePresetPicker'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useBonusBuyWidgetDraft } from '@/hooks/useBonusBuyWidgetDraft'
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
  bonusBuyId: number
  record: BonusBuyRecord
  slots: BonusBuySlot[]
  open: boolean
  onClose: () => void
}

export const BonusBuyWidgetStyleDialog = (
  props: BonusBuyWidgetStyleDialogProps,
) => {
  const { showSuccess } = useNotification()
  const patchWidgetMutation = usePatchBonusBuyWidget(
    props.accountId,
    props.bonusBuyId,
  )
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
  } = useBonusBuyWidget(props.accountId, props.bonusBuyId, props.open)

  const { data: widgetPresets = [] } = useBonusBuyWidgetPresets(
    props.open ? props.accountId : undefined,
  )

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
    showSuccess('Widget style saved')
  }

  const {
    widgetDraft,
    widgetEditError,
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
    dialogOpen: props.open,
    onSave: handleSave,
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
        <DialogTitle>Widget Style</DialogTitle>
        <DialogContent>
          {isLoadingWidget ? (
            <StatusAlert tone="info" sx={{ mt: 1 }}>
              Loading settings…
            </StatusAlert>
          ) : widgetLoadError ? (
            <StatusAlert tone="error" sx={{ mt: 1 }}>
              {widgetLoadError instanceof Error
                ? widgetLoadError.message
                : 'Could not load widget settings'}
            </StatusAlert>
          ) : widgetDraft ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <WidgetThemePresetPicker
                  presets={widgetPresets}
                  activePresetId={activeWidgetPresetId}
                  onSelectPreset={applyWidgetPreset}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <BonusBuyWidgetStyleForm
                  draft={widgetDraft}
                  onUpdate={updateWidgetDraft}
                />
              </Grid>
              <Grid
                size={{ xs: 12, md: 6 }}
                sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}
              >
                <WidgetStylePreview
                  record={props.record}
                  slots={props.slots}
                  previewTheme={widgetPreviewTheme}
                  dimensionLabel={widgetPreviewDimensionLabel}
                  validationError={widgetDraftValidationError}
                />
              </Grid>
            </Grid>
          ) : null}
          {widgetEditError ? (
            <Box sx={{ mt: 2 }}>
              <StatusAlert tone="error">{widgetEditError}</StatusAlert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={() => setWidgetPreviewDialogOpen(true)}
            disabled={!widgetDraft}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            Preview
          </Button>
          <Button
            component={Link}
            to={`/bonus-buy/${props.bonusBuyId}/widget`}
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
        </DialogActions>
      </Dialog>
      <Dialog
        open={widgetPreviewDialogOpen}
        onClose={() => setWidgetPreviewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Widget preview</DialogTitle>
        <DialogContent>
          <WidgetStylePreview
            record={props.record}
            slots={props.slots}
            previewTheme={widgetPreviewTheme}
            dimensionLabel={widgetPreviewDimensionLabel}
            validationError={widgetDraftValidationError}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWidgetPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
