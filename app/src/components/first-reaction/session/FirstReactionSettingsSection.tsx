import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import { useTranslation } from 'react-i18next'
import type { FirstReactionSettings } from '@/api/first-reaction'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'

type FirstReactionSettingsSectionProps = {
  settings: FirstReactionSettings
  readOnly: boolean
  savePending: boolean
  onChange: (settings: FirstReactionSettings) => void
  onSave: () => void
}

export function FirstReactionSettingsSection(
  props: FirstReactionSettingsSectionProps,
) {
  const { t } = useTranslation()
  const { settings } = props

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2}>
          <SectionHeader
            title={t('firstReaction.settingsTitle')}
            icon={SettingsIcon}
            iconVariant="muted"
            showDivider={false}
          />
          <FormControl fullWidth disabled={props.readOnly}>
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
              <FormControl fullWidth disabled={props.readOnly}>
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
                  label={t('firstReaction.sessionKeywordLabel')}
                  value={settings.sessionKeyword ?? ''}
                  disabled={props.readOnly}
                  onChange={(e) =>
                    props.onChange({
                      ...settings,
                      sessionKeyword: e.target.value,
                    })
                  }
                />
              ) : null}
            </>
          ) : (
            <FormControl fullWidth disabled={props.readOnly}>
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
          )}
          <FormControlLabel
            control={
              <Switch
                checked={settings.acceptTimeoutEnabled}
                disabled={props.readOnly}
                onChange={(e) =>
                  props.onChange({
                    ...settings,
                    acceptTimeoutEnabled: e.target.checked,
                  })
                }
              />
            }
            label={t('firstReaction.acceptTimeoutEnabled')}
          />
          <TextField
            type="number"
            label={t('firstReaction.acceptTimeoutSeconds')}
            value={settings.acceptTimeoutSeconds}
            disabled={props.readOnly}
            onChange={(e) =>
              props.onChange({
                ...settings,
                acceptTimeoutSeconds: Number(e.target.value),
              })
            }
          />
          <Button
            variant="outlined"
            disabled={props.readOnly || props.savePending}
            onClick={props.onSave}
          >
            {t('common.save')}
          </Button>
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
