import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  BonusBuyRecord,
  BonusBuySlot,
  BonusBuyWidgetSettings,
} from '@/api/bonus-buy'
import { HexColorField } from '@/components/bonus-buy/HexColorField'
import { WidgetStylePreview } from '@/components/bonus-buy/WidgetStylePreview'
import { WidgetThemePresetPicker } from '@/components/bonus-buy/WidgetThemePresetPicker'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import {
  applyBonusBuyWidgetPresetFromList,
  matchBonusBuyWidgetPresetFromList,
} from '@/lib/bonus-buy-widget-presets'
import { validateBonusBuyWidgetDraft } from '@/lib/bonus-buy-widget-validation'
import {
  useBonusBuyWidget,
  useBonusBuyWidgetPresets,
  usePatchBonusBuyWidget,
} from '@/queries/use-bonus-buy'
import { inputFieldSx } from '@/theme/colors'

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

  const [widgetPreviewDialogOpen, setWidgetPreviewDialogOpen] = useState(false)
  const [widgetDraft, setWidgetDraft] = useState<BonusBuyWidgetSettings | null>(
    null,
  )
  const [lastValidWidgetDraft, setLastValidWidgetDraft] =
    useState<BonusBuyWidgetSettings | null>(null)
  const [widgetEditError, setWidgetEditError] = useState<string | null>(null)

  const {
    data: widgetSettings,
    isLoading: isLoadingWidget,
    error: widgetLoadError,
  } = useBonusBuyWidget(props.accountId, props.bonusBuyId, props.open)

  const { data: widgetPresets = [] } = useBonusBuyWidgetPresets(
    props.open ? props.accountId : undefined,
  )

  useEffect(() => {
    if (widgetSettings) {
      setWidgetDraft(widgetSettings)
      setLastValidWidgetDraft(widgetSettings)
    }
  }, [widgetSettings])

  useEffect(() => {
    if (!widgetDraft) {
      return
    }

    if (validateBonusBuyWidgetDraft(widgetDraft) === null) {
      setLastValidWidgetDraft(widgetDraft)
    }
  }, [widgetDraft])

  useEffect(() => {
    if (!props.open) {
      setWidgetEditError(null)
      setWidgetPreviewDialogOpen(false)
    }
  }, [props.open])

  const widgetDraftValidationError = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return validateBonusBuyWidgetDraft(widgetDraft)
  }, [widgetDraft])

  const widgetPreviewTheme = lastValidWidgetDraft ?? widgetDraft

  const widgetPreviewDimensionLabel = widgetDraft
    ? `${widgetDraft.width} × ${widgetDraft.height}`
    : undefined

  const activeWidgetPresetId = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return matchBonusBuyWidgetPresetFromList(widgetDraft, widgetPresets)
  }, [widgetDraft, widgetPresets])

  function updateWidgetDraft<K extends keyof BonusBuyWidgetSettings>(
    key: K,
    value: BonusBuyWidgetSettings[K],
  ) {
    setWidgetDraft((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    )
  }

  function applyWidgetPreset(presetId: number) {
    const preset = widgetPresets.find((entry) => entry.id === presetId)
    if (!preset) {
      return
    }

    setWidgetDraft((previous) =>
      previous ? applyBonusBuyWidgetPresetFromList(previous, preset) : previous,
    )
  }

  async function handleSaveWidgetStyle() {
    if (!widgetDraft) {
      return
    }

    const validationError = validateBonusBuyWidgetDraft(widgetDraft)
    if (validationError) {
      setWidgetEditError(validationError)
      return
    }

    setWidgetEditError(null)

    try {
      await patchWidgetMutation.mutateAsync({
        width: widgetDraft.width,
        height: widgetDraft.height,
        background_color: widgetDraft.backgroundColor.trim(),
        surface_color: widgetDraft.surfaceColor.trim(),
        border_color: widgetDraft.borderColor.trim(),
        accent_color: widgetDraft.accentColor.trim(),
        positive_color: widgetDraft.positiveColor.trim(),
        negative_color: widgetDraft.negativeColor.trim(),
        live_color: widgetDraft.liveColor.trim(),
        text_muted_color: widgetDraft.textMutedColor.trim(),
        border_radius: widgetDraft.borderRadius,
        padding: widgetDraft.padding,
        font_family: widgetDraft.fontFamily.trim(),
        preset_id: widgetDraft.presetId,
      })
      props.onClose()
      showSuccess('Widget style saved')
    } catch (saveError) {
      setWidgetEditError(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save widget settings',
      )
    }
  }

  return (
    <>
      <Dialog
        open={props.open}
        onClose={props.onClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Widget style</DialogTitle>
        <DialogContent>
          {isLoadingWidget ? (
            <Typography sx={{ py: 2, color: 'text.secondary' }}>
              Loading settings…
            </Typography>
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
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Size
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Width (px)"
                        type="number"
                        value={widgetDraft.width}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'width',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Height (px)"
                        type="number"
                        value={widgetDraft.height}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'height',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Colors
                  </Typography>
                  <Grid container spacing={2}>
                    {(
                      [
                        ['backgroundColor', 'Background'],
                        ['surfaceColor', 'Surface'],
                        ['borderColor', 'Border'],
                        ['accentColor', 'Accent'],
                        ['positiveColor', 'Positive'],
                        ['negativeColor', 'Negative'],
                        ['liveColor', 'Live'],
                        ['textMutedColor', 'Text muted'],
                      ] as const
                    ).map(([key, label]) => (
                      <Grid key={key} size={{ xs: 12, sm: 6 }}>
                        <HexColorField
                          label={label}
                          value={widgetDraft[key]}
                          onChange={(nextValue) => updateWidgetDraft(key, nextValue)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Shape
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Border radius (px)"
                        type="number"
                        value={widgetDraft.borderRadius}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'borderRadius',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Padding (px)"
                        type="number"
                        value={widgetDraft.padding}
                        onChange={(event) =>
                          updateWidgetDraft(
                            'padding',
                            Number.parseInt(event.target.value, 10) || 0,
                          )
                        }
                        fullWidth
                        sx={inputFieldSx}
                      />
                    </Grid>
                  </Grid>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Typography
                  </Typography>
                  <TextField
                    label="Font family"
                    value={widgetDraft.fontFamily}
                    onChange={(event) =>
                      updateWidgetDraft('fontFamily', event.target.value)
                    }
                    fullWidth
                    sx={inputFieldSx}
                  />
                </Stack>
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
          <Button
            onClick={props.onClose}
            disabled={patchWidgetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleSaveWidgetStyle()}
            disabled={
              patchWidgetMutation.isPending || isLoadingWidget || !widgetDraft
            }
          >
            {patchWidgetMutation.isPending ? 'Saving…' : 'Save'}
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
