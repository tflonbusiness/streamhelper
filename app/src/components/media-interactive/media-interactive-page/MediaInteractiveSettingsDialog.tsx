import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveBackupCutover } from '@/api/media-interactive'
import {
  StyledSettingsSection,
  StyledSettingsSectionsRoot,
  StyledSubsectionLabel,
} from '@/components/media-interactive/media-interactive-page/media-interactive-page-styles'
import { WidgetSettingsDialogTitle } from '@/components/widget/WidgetSettingsPaletteIcon'
import { useNotification } from '@/context/NotificationContext'
import { inputFieldSx } from '@/theme/colors'
import {
  useMediaInteractiveMutations,
  useMediaInteractiveSettings,
} from '@/queries/use-media-interactive'

type MediaInteractiveSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

type SettingsDraft = {
  volume: number
  showVideo: boolean
  overlayWidth: number
  overlayHeight: number
  audioOverlayWidth: number
  backupCutover: MediaInteractiveBackupCutover
  maxViewerTrackDurationSeconds: number
  kickRewardIdsText: string
}

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

function settingsToDraft(
  settings: NonNullable<ReturnType<typeof useMediaInteractiveSettings>['data']>,
): SettingsDraft {
  return {
    volume: settings.volume,
    showVideo: settings.showVideo,
    overlayWidth: settings.overlayWidth,
    overlayHeight: settings.overlayHeight,
    audioOverlayWidth: settings.audioOverlayWidth,
    backupCutover: settings.backupCutover,
    maxViewerTrackDurationSeconds: settings.maxViewerTrackDurationSeconds,
    kickRewardIdsText: settings.kickRewardIds.join(', '),
  }
}

function parseKickRewardIds(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function MediaInteractiveSettingsDialog({
  accountId,
  open,
  onClose,
}: MediaInteractiveSettingsDialogProps) {
  const { t } = useTranslation()
  const { showSuccess, showError } = useNotification()
  const { data: settings, isLoading } = useMediaInteractiveSettings(
    open ? accountId : undefined,
  )
  const mutations = useMediaInteractiveMutations(accountId)
  const [draft, setDraft] = useState<SettingsDraft | null>(null)

  useEffect(() => {
    if (!open) {
      setDraft(null)
      return
    }
    if (settings && draft === null) {
      setDraft(settingsToDraft(settings))
    }
  }, [open, settings, draft])

  const handleClose = () => {
    onClose()
  }

  const handleSave = () => {
    if (!draft) return
    void mutations.patchSettings.mutateAsync(
      {
        volume: draft.volume,
        showVideo: draft.showVideo,
        overlayWidth: draft.overlayWidth,
        overlayHeight: draft.overlayHeight,
        audioOverlayWidth: draft.audioOverlayWidth,
        backupCutover: draft.backupCutover,
        maxViewerTrackDurationSeconds: draft.maxViewerTrackDurationSeconds,
        kickRewardIds: parseKickRewardIds(draft.kickRewardIdsText),
      },
      {
        onSuccess: () => {
          showSuccess(t('mediaInteractive.settingsSaved'))
          handleClose()
        },
        onError: () => {
          showError(t('mediaInteractive.couldNotSaveSettings'))
        },
      },
    )
  }

  const saving = mutations.patchSettings.isPending

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <WidgetSettingsDialogTitle>
        {t('mediaInteractive.settings')}
      </WidgetSettingsDialogTitle>
      <DialogContent>
        {isLoading || !draft ? (
          <Typography variant="body2" color="text.secondary">
            {t('common.loading')}
          </Typography>
        ) : (
          <Box
            component="form"
            id="media-interactive-settings-form"
            onSubmit={(e) => {
              e.preventDefault()
              handleSave()
            }}
          >
            <StyledSettingsSectionsRoot>
              <StyledSettingsSection>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.settingsSectionPlayback')}
                </StyledSubsectionLabel>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    alignItems="baseline"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Typography
                      id="media-interactive-volume-label"
                      variant="body2"
                      component="label"
                    >
                      {t('mediaInteractive.volume')}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontWeight: 600,
                        fontVariantNumeric: 'tabular-nums',
                        color: 'text.primary',
                      }}
                    >
                      {Math.round(draft.volume)}%
                    </Typography>
                  </Stack>
                  <Slider
                    aria-labelledby="media-interactive-volume-label"
                    value={draft.volume}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(_, v) =>
                      setDraft((prev) =>
                        prev ? { ...prev, volume: v as number } : prev,
                      )
                    }
                  />
                </Stack>
              </StyledSettingsSection>

              <Divider />

              <StyledSettingsSection>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.settingsSectionOverlay')}
                </StyledSubsectionLabel>
                <Stack spacing={1}>
                  <ToggleButtonGroup
                    exclusive
                    fullWidth
                    size="small"
                    value={draft.showVideo ? 'video' : 'audio'}
                    onChange={(_, value) => {
                      if (value === 'video' || value === 'audio') {
                        setDraft((prev) =>
                          prev
                            ? { ...prev, showVideo: value === 'video' }
                            : prev,
                        )
                      }
                    }}
                  >
                    <ToggleButton
                      value="video"
                      aria-label={t('mediaInteractive.overlayModeVideo')}
                    >
                      {t('mediaInteractive.overlayModeVideo')}
                    </ToggleButton>
                    <ToggleButton
                      value="audio"
                      aria-label={t('mediaInteractive.overlayModeAudio')}
                    >
                      {t('mediaInteractive.overlayModeAudio')}
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="caption" color="text.secondary">
                    {draft.showVideo
                      ? t('mediaInteractive.overlayModeVideoHint')
                      : t('mediaInteractive.overlayModeAudioHint')}
                  </Typography>
                </Stack>
                {draft.showVideo ? (
                  <Stack spacing={2}>
                    <StyledField
                      label={t('mediaInteractive.width')}
                      type="number"
                      value={draft.overlayWidth}
                      fullWidth
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? { ...prev, overlayWidth: Number(e.target.value) }
                            : prev,
                        )
                      }
                    />
                    <StyledField
                      label={t('mediaInteractive.height')}
                      type="number"
                      value={draft.overlayHeight}
                      fullWidth
                      onChange={(e) =>
                        setDraft((prev) =>
                          prev
                            ? { ...prev, overlayHeight: Number(e.target.value) }
                            : prev,
                        )
                      }
                    />
                  </Stack>
                ) : (
                  <StyledField
                    label={t('mediaInteractive.audioWidgetWidth')}
                    type="number"
                    value={draft.audioOverlayWidth}
                    fullWidth
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              audioOverlayWidth: Number(e.target.value),
                            }
                          : prev,
                      )
                    }
                    helperText={t('mediaInteractive.audioWidgetWidthHint')}
                  />
                )}
              </StyledSettingsSection>

              <Divider />

              <StyledSettingsSection>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.settingsSectionBackup')}
                </StyledSubsectionLabel>
                <FormControl size="small" fullWidth>
                  <InputLabel id="media-interactive-cutover-label">
                    {t('mediaInteractive.backupCutover')}
                  </InputLabel>
                  <Select
                    labelId="media-interactive-cutover-label"
                    label={t('mediaInteractive.backupCutover')}
                    value={draft.backupCutover}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              backupCutover: e.target
                                .value as MediaInteractiveBackupCutover,
                            }
                          : prev,
                      )
                    }
                  >
                    <MenuItem value="immediate">
                      {t('mediaInteractive.cutoverImmediate')}
                    </MenuItem>
                    <MenuItem value="finish_current_track">
                      {t('mediaInteractive.cutoverFinish')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </StyledSettingsSection>

              <Divider />

              <StyledSettingsSection>
                <StyledSubsectionLabel>
                  {t('mediaInteractive.settingsSectionViewerOrders')}
                </StyledSubsectionLabel>
                <Stack spacing={2}>
                  <StyledField
                    label={t('mediaInteractive.maxDuration')}
                    type="number"
                    value={draft.maxViewerTrackDurationSeconds}
                    fullWidth
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              maxViewerTrackDurationSeconds: Number(
                                e.target.value,
                              ),
                            }
                          : prev,
                      )
                    }
                  />
                  <TextField
                    label={t('mediaInteractive.kickRewardIds')}
                    value={draft.kickRewardIdsText}
                    onChange={(e) =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, kickRewardIdsText: e.target.value }
                          : prev,
                      )
                    }
                    helperText={t('mediaInteractive.kickRewardIdsHint')}
                    sx={inputFieldSx}
                    fullWidth
                  />
                </Stack>
              </StyledSettingsSection>
            </StyledSettingsSectionsRoot>
          </Box>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          form="media-interactive-settings-form"
          variant="contained"
          disabled={!draft || saving}
        >
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
