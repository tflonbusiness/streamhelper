import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { FirstReactionSettings } from '@/api/first-reaction'
import { FirstReactionCustomWordsField } from '@/components/first-reaction/session/FirstReactionCustomWordsField'
import { FirstReactionEligibleRolesField } from '@/components/first-reaction/session/FirstReactionEligibleRolesField'
import { isFirstReactionSettingsValidForSave } from '@/components/first-reaction/session/first-reaction-session-utils'
import {
  SettingsFormRoot,
  SettingsGroup,
  SettingsGroupLabel,
  SettingsGroupPanel,
  SettingsHeaderBlock,
  SettingsNestedField,
  SettingsSaveButton,
  SettingsToggleCopy,
  SettingsToggleLabel,
  SettingsToggleRow,
} from '@/components/first-reaction/session/firstReactionSessionSettingsStyles'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'

type FirstReactionSettingsSectionProps = {
  settings: FirstReactionSettings
  readOnly: boolean
  isDirty: boolean
  savePending: boolean
  onChange: (settings: FirstReactionSettings) => void
  onSave: () => void
}

const fieldSize = 'small' as const

export function FirstReactionSettingsSection(
  props: FirstReactionSettingsSectionProps,
) {
  const { t } = useTranslation()
  const { settings } = props
  const saveLabel = props.savePending ? t('common.saving') : t('common.save')
  const fieldsDisabled = props.readOnly
  const canSaveSettings = isFirstReactionSettingsValidForSave(settings)
  const showCustomWords =
    settings.wordSource === 'generated' &&
    settings.generationPool === 'custom_list'

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <SettingsFormRoot>
          <SettingsHeaderBlock>
            <SectionHeader
              title={t('firstReaction.settingsTitle')}
              description={t('firstReaction.settingsDescription')}
              icon={SettingsIcon}
              iconVariant="info"
              showDivider={false}
              action={
                !props.readOnly ? (
                  <SettingsSaveButton
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={
                      !props.isDirty ||
                      props.savePending ||
                      !canSaveSettings
                    }
                    onClick={props.onSave}
                    startIcon={<SaveIcon fontSize="small" aria-hidden />}
                  >
                    {saveLabel}
                  </SettingsSaveButton>
                ) : null
              }
            />
            {!props.readOnly && props.isDirty ? (
              <Alert severity="warning" variant="outlined">
                {props.savePending
                  ? t('common.saving')
                  : t('firstReaction.settingsUnsavedBanner')}
              </Alert>
            ) : null}
          </SettingsHeaderBlock>

          <SettingsGroup>
            <SettingsGroupLabel variant="caption">
              {t('firstReaction.settingsGroupKeyword')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <FormControl fullWidth size={fieldSize} disabled={fieldsDisabled}>
                <InputLabel>{t('firstReaction.wordSourceLabel')}</InputLabel>
                <Select
                  label={t('firstReaction.wordSourceLabel')}
                  value={settings.wordSource}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      wordSource: e.target.value as 'manual' | 'generated',
                    })
                  }
                >
                  <MenuItem value="manual">
                    {t('firstReaction.wordSourceManual')}
                  </MenuItem>
                  <MenuItem value="generated">
                    {t('firstReaction.wordSourceGenerated')}
                  </MenuItem>
                </Select>
              </FormControl>
              {settings.wordSource === 'manual' ? (
                <>
                  <FormControl fullWidth size={fieldSize} disabled={fieldsDisabled}>
                    <InputLabel>{t('firstReaction.manualScopeLabel')}</InputLabel>
                    <Select
                      label={t('firstReaction.manualScopeLabel')}
                      value={settings.manualScope}
                      onChange={(e) =>
                        props.onChange({
                          ...settings,
                          manualScope: e.target.value as
                            | 'per_draw'
                            | 'per_session',
                        })
                      }
                    >
                      <MenuItem value="per_draw">
                        {t('firstReaction.manualScopePerDraw')}
                      </MenuItem>
                      <MenuItem value="per_session">
                        {t('firstReaction.manualScopePerSession')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {settings.manualScope === 'per_session' ? (
                    <TextField
                      size={fieldSize}
                      label={t('firstReaction.sessionKeywordLabel')}
                      value={settings.sessionKeyword ?? ''}
                      disabled={fieldsDisabled}
                      fullWidth
                      onChange={(e) =>
                        props.onChange({
                          ...settings,
                          sessionKeyword: e.target.value,
                        })
                      }
                      slotProps={{
                        input: {
                          sx: {
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                          },
                        },
                      }}
                    />
                  ) : null}
                </>
              ) : (
                <>
                  <FormControl fullWidth size={fieldSize} disabled={fieldsDisabled}>
                    <InputLabel>{t('firstReaction.generationPoolLabel')}</InputLabel>
                    <Select
                      label={t('firstReaction.generationPoolLabel')}
                      value={settings.generationPool}
                      onChange={(e) =>
                        props.onChange({
                          ...settings,
                          generationPool: e.target.value as FirstReactionSettings['generationPool'],
                        })
                      }
                    >
                      <MenuItem value="builtin_casino">
                        {t('firstReaction.poolCasino')}
                      </MenuItem>
                      <MenuItem value="builtin_general">
                        {t('firstReaction.poolGeneral')}
                      </MenuItem>
                      <MenuItem value="custom_list">
                        {t('firstReaction.poolCustom')}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  {showCustomWords ? (
                    <FirstReactionCustomWordsField
                      words={settings.customWords}
                      disabled={fieldsDisabled}
                      showValidation
                      onChange={(customWords) =>
                        props.onChange({ ...settings, customWords })
                      }
                    />
                  ) : null}
                </>
              )}
            </SettingsGroupPanel>
          </SettingsGroup>

          <SettingsGroup>
            <SettingsGroupLabel variant="caption">
              {t('firstReaction.settingsGroupTimeout')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <SettingsToggleRow>
                <Switch
                  size="small"
                  checked={settings.acceptTimeoutEnabled}
                  disabled={fieldsDisabled}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      acceptTimeoutEnabled: e.target.checked,
                    })
                  }
                />
                <SettingsToggleCopy>
                  <SettingsToggleLabel variant="body2">
                    {t('firstReaction.acceptTimeoutEnabled')}
                  </SettingsToggleLabel>
                </SettingsToggleCopy>
              </SettingsToggleRow>
              {settings.acceptTimeoutEnabled ? (
                <SettingsNestedField>
                  <TextField
                    type="number"
                    size={fieldSize}
                    label={t('firstReaction.acceptTimeoutSeconds')}
                    value={settings.acceptTimeoutSeconds}
                    disabled={fieldsDisabled}
                    fullWidth
                    slotProps={{
                      htmlInput: { min: 1, step: 1 },
                    }}
                    onChange={(e) =>
                      props.onChange({
                        ...settings,
                        acceptTimeoutSeconds: Number(e.target.value),
                      })
                    }
                  />
                </SettingsNestedField>
              ) : null}
            </SettingsGroupPanel>
          </SettingsGroup>

          <SettingsGroup>
            <SettingsGroupLabel variant="caption">
              {t('firstReaction.settingsGroupParticipants')}
            </SettingsGroupLabel>
            <SettingsGroupPanel>
              <FirstReactionEligibleRolesField
                settings={settings}
                disabled={fieldsDisabled}
                onChange={props.onChange}
              />
            </SettingsGroupPanel>
          </SettingsGroup>
        </SettingsFormRoot>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
