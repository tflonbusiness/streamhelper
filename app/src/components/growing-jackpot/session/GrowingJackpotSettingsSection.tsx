import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { FirstReactionSettings } from '@/api/first-reaction'
import type { GrowingJackpotSettings } from '@/api/growing-jackpot'
import { FirstReactionEligibleRolesField } from '@/components/first-reaction/session/FirstReactionEligibleRolesField'
import {
  SettingsFormRoot,
  SettingsGroup,
  SettingsGroupLabel,
  SettingsGroupPanel,
  SettingsGroupPanelBlock,
  SettingsHeaderBlock,
  SettingsSaveButton,
  SettingsToggleCopy,
  SettingsToggleLabel,
  SettingsToggleRow,
} from '@/components/first-reaction/session/firstReactionSessionSettingsStyles'
import {
  GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MAX,
  GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MIN,
  isGrowingJackpotSettingsValidForSave,
  isGrowingJackpotWinnerOverlaySecondsValid,
} from '@/components/growing-jackpot/session/growing-jackpot-session-utils'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'

type GrowingJackpotSettingsSectionProps = {
  settings: GrowingJackpotSettings
  readOnly: boolean
  fieldsLocked: boolean
  isDirty: boolean
  savePending: boolean
  onChange: (settings: GrowingJackpotSettings) => void
  onSave: () => void
}

const fieldSize = 'small' as const

export function GrowingJackpotSettingsSection(
  props: GrowingJackpotSettingsSectionProps,
) {
  const { t } = useTranslation()
  const { settings } = props
  const saveLabel = props.savePending ? t('common.saving') : t('common.save')
  const fieldsDisabled = props.readOnly || props.fieldsLocked
  const canSaveSettings = isGrowingJackpotSettingsValidForSave(settings)
  const winnerOverlayInvalid = !isGrowingJackpotWinnerOverlaySecondsValid(
    settings.winnerOverlaySeconds,
  )

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <SettingsFormRoot>
          <SettingsHeaderBlock>
            <SectionHeader
              title={t('growingJackpot.settingsTitle')}
              description={t('growingJackpot.settingsDescription')}
              icon={SettingsIcon}
              iconVariant="info"
              showDivider={false}
              action={
                !props.readOnly ? (
                  <SettingsSaveButton
                    type="button"
                    variant="contained"
                    size="small"
                    startIcon={<SaveIcon fontSize="small" aria-hidden />}
                    disabled={
                      !props.isDirty ||
                      !canSaveSettings ||
                      props.savePending
                    }
                    onClick={props.onSave}
                  >
                    {saveLabel}
                  </SettingsSaveButton>
                ) : undefined
              }
            />
          </SettingsHeaderBlock>

          <SettingsGroup>
            <SettingsGroupLabel>
              {t('growingJackpot.settingsGroupJoin')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <SettingsGroupPanelBlock>
                <TextField
                  size={fieldSize}
                  label={t('growingJackpot.joinKeywordLabel')}
                  value={settings.joinKeyword}
                  disabled={fieldsDisabled}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      joinKeyword: e.target.value,
                    })
                  }
                  helperText={t('growingJackpot.joinKeywordHelper')}
                  fullWidth
                />
                <TextField
                  size={fieldSize}
                  type="number"
                  label={t('growingJackpot.timerSecondsLabel')}
                  value={settings.timerSeconds}
                  disabled={fieldsDisabled}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      timerSeconds:
                        Number.parseInt(e.target.value, 10) || 300,
                    })
                  }
                  fullWidth
                />
              </SettingsGroupPanelBlock>
            </SettingsGroupPanel>
          </SettingsGroup>

          <SettingsGroup>
            <SettingsGroupLabel>
              {t('growingJackpot.settingsGroupPrize')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <SettingsGroupPanelBlock>
                <TextField
                  size={fieldSize}
                  type="number"
                  label={t('growingJackpot.prizeBaseLabel')}
                  value={settings.prizeBase}
                  disabled={fieldsDisabled}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      prizeBase: Number.parseFloat(e.target.value) || 0,
                    })
                  }
                  fullWidth
                />
                <TextField
                  size={fieldSize}
                  type="number"
                  label={t('growingJackpot.prizeStepLabel')}
                  value={settings.prizeStepPerJoin}
                  disabled={fieldsDisabled}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      prizeStepPerJoin:
                        Number.parseFloat(e.target.value) || 1,
                    })
                  }
                  fullWidth
                />
                <TextField
                  size={fieldSize}
                  type="number"
                  label={t('growingJackpot.prizeCapLabel')}
                  value={settings.prizeDisplayCap ?? ''}
                  disabled={fieldsDisabled}
                  onChange={(e) => {
                    const raw = e.target.value.trim()
                    props.onChange({
                      ...settings,
                      prizeDisplayCap:
                        raw === '' ? null : Number.parseFloat(raw) || 0,
                    })
                  }}
                  helperText={t('growingJackpot.prizeCapHelper')}
                  fullWidth
                />
              </SettingsGroupPanelBlock>
            </SettingsGroupPanel>
          </SettingsGroup>

          <SettingsGroup>
            <SettingsGroupLabel>
              {t('growingJackpot.settingsGroupWinner')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <SettingsGroupPanelBlock>
                <TextField
                  size={fieldSize}
                  type="number"
                  label={t('growingJackpot.winnerOverlaySecondsLabel')}
                  value={settings.winnerOverlaySeconds}
                  disabled={fieldsDisabled}
                  error={winnerOverlayInvalid}
                  helperText={
                    winnerOverlayInvalid
                      ? t('firstReaction.winnerOverlaySecondsOutOfRange', {
                          min: GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MIN,
                          max: GROWING_JACKPOT_WINNER_OVERLAY_SECONDS_MAX,
                        })
                      : undefined
                  }
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      winnerOverlaySeconds:
                        Number.parseInt(e.target.value, 10) || 8,
                    })
                  }
                  fullWidth
                />
                <FormControl fullWidth size={fieldSize} disabled={fieldsDisabled}>
                  <InputLabel id="gj-weight-combine-label">
                    {t('growingJackpot.weightCombineModeLabel')}
                  </InputLabel>
                  <Select
                    labelId="gj-weight-combine-label"
                    label={t('growingJackpot.weightCombineModeLabel')}
                    value={settings.weightCombineMode}
                    onChange={(e) =>
                      props.onChange({
                        ...settings,
                        weightCombineMode: e.target.value as
                          | 'highest'
                          | 'sum',
                      })
                    }
                  >
                    <MenuItem value="highest">
                      {t('growingJackpot.weightCombineHighest')}
                    </MenuItem>
                    <MenuItem value="sum">
                      {t('growingJackpot.weightCombineSum')}
                    </MenuItem>
                  </Select>
                </FormControl>
                <SettingsToggleRow>
                  <SettingsToggleLabel>
                    <SettingsToggleCopy>
                      {t('growingJackpot.announceWinnerInChatLabel')}
                    </SettingsToggleCopy>
                  </SettingsToggleLabel>
                  <Switch
                    checked={settings.announceWinnerInChat}
                    disabled={fieldsDisabled}
                    onChange={(e) =>
                      props.onChange({
                        ...settings,
                        announceWinnerInChat: e.target.checked,
                      })
                    }
                  />
                </SettingsToggleRow>
              </SettingsGroupPanelBlock>
            </SettingsGroupPanel>
          </SettingsGroup>

          <FirstReactionEligibleRolesField
            settings={
              { roleSettings: settings.roleSettings } as FirstReactionSettings
            }
            disabled={fieldsDisabled}
            onChange={(next) =>
              props.onChange({
                ...settings,
                roleSettings: next.roleSettings,
              })
            }
          />
        </SettingsFormRoot>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
