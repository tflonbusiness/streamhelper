import {
  Box,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import GroupIcon from '@mui/icons-material/Group'
import TagIcon from '@mui/icons-material/Tag'
import TuneIcon from '@mui/icons-material/Tune'
import { useTranslation } from 'react-i18next'
import type { ChatRollRoleId, WeightCombineMode } from '@/lib/chat-roll'
import type { ChatRollSessionSettingsDraft } from '@/lib/chat-roll-session-settings'
import {
  ExclusionToggleLabel,
  KeywordField,
  RoleLabel,
  RoleRowStack,
  RoleWeightField,
  SettingsGroupPanel,
  SettingsGroupTitle,
  SettingsLeftPanel,
  SettingsToggleCard,
  SettingsToggleCardColumn,
  SettingsToggleCardRow,
  SettingsToggleCopy,
  SettingsToggleNestedField,
} from '@/components/chat-roll/chatRollPageStyles'

type ChatRollRoleMeta = {
  id: ChatRollRoleId
  label: string
  description: string
}

type ChatRollSessionSettingsLeftPanelProps = {
  draft: ChatRollSessionSettingsDraft
  keywordError: string | null
  settingsDisabled: boolean
  onKeywordChange: (value: string) => void
  onCombineModeChange: (mode: WeightCombineMode) => void
  onExcludeWinnerChange: (checked: boolean) => void
  onReplyInChatChange: (checked: boolean) => void
  onWinnerResponseEnabledChange: (checked: boolean) => void
  onWinnerResponseSecondsChange: (seconds: number) => void
  roleMeta: ChatRollRoleMeta[]
  onRoleToggle: (roleId: ChatRollRoleId, enabled: boolean) => void
  onRoleWeightChange: (roleId: ChatRollRoleId, raw: string) => void
}

export function ChatRollSessionSettingsLeftPanel(
  props: ChatRollSessionSettingsLeftPanelProps,
) {
  const { t } = useTranslation()

  return (
    <SettingsLeftPanel>
      <SettingsGroupPanel>
        <SettingsGroupTitle>
          <TagIcon fontSize="inherit" aria-hidden />
          {t('chatRoll.chatKeyword')}
        </SettingsGroupTitle>
        <KeywordField
          label={t('chatRoll.keywordLabel')}
          size="small"
          value={props.draft.keyword}
          onChange={(event) => props.onKeywordChange(event.target.value)}
          error={Boolean(props.keywordError)}
          helperText={props.keywordError ?? t('chatRoll.keywordHelp')}
          fullWidth
          disabled={props.settingsDisabled}
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.02em' },
            },
          }}
        />
      </SettingsGroupPanel>

      <SettingsGroupPanel>
        <SettingsGroupTitle>
          <GroupIcon fontSize="inherit" aria-hidden />
          {t('chatRoll.eligibleRoles')}
        </SettingsGroupTitle>
        <Stack spacing={1}>
          {props.roleMeta.map((role) => {
            const setting = props.draft.roleSettings[role.id]
            return (
              <RoleRowStack key={role.id} enabled={setting.enabled}>
                <Switch
                  size="small"
                  checked={setting.enabled}
                  disabled={props.settingsDisabled}
                  onChange={(event) =>
                    props.onRoleToggle(role.id, event.target.checked)
                  }
                />
                <RoleLabel variant="body2" noWrap>
                  {role.label}
                </RoleLabel>
                <RoleWeightField
                  size="small"
                  type="number"
                  label="×"
                  value={setting.weight}
                  disabled={!setting.enabled || props.settingsDisabled}
                  onChange={(event) =>
                    props.onRoleWeightChange(role.id, event.target.value)
                  }
                  slotProps={{
                    htmlInput: {
                      min: 0.1,
                      max: 100,
                      step: 0.1,
                    },
                  }}
                />
              </RoleRowStack>
            )
          })}
        </Stack>
      </SettingsGroupPanel>

      <SettingsGroupPanel>
        <SettingsGroupTitle>
          <TuneIcon fontSize="inherit" aria-hidden />
          {t('chatRoll.rollOptions')}
        </SettingsGroupTitle>

        <Box sx={{ mt: 0.5 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {t('chatRoll.weightCombine')}
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={props.draft.combineMode}
            disabled={props.settingsDisabled}
            onChange={(_, value) => {
              if (value) {
                props.onCombineModeChange(value as WeightCombineMode)
              }
            }}
            sx={{ mt: 1 }}
          >
            <ToggleButton
              value="highest"
              aria-label={t('chatRoll.combineHighestAria')}
            >
              {t('chatRoll.combineHighestShort')}
            </ToggleButton>
            <ToggleButton value="sum" aria-label={t('chatRoll.combineSumAria')}>
              {t('chatRoll.combineSumShort')}
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {props.draft.combineMode === 'highest'
              ? t('chatRoll.combineHighest')
              : t('chatRoll.combineSum')}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mt: 2 }}>
          <SettingsToggleCard>
            <Switch
              size="small"
              checked={props.draft.excludeWinnerAfterRoll}
              disabled={props.settingsDisabled}
              onChange={(event) =>
                props.onExcludeWinnerChange(event.target.checked)
              }
            />
            <SettingsToggleCopy>
              <ExclusionToggleLabel variant="body2">
                {t('chatRoll.excludeWinnerAfterRoll')}
              </ExclusionToggleLabel>
              <Typography variant="caption" color="text.secondary">
                {t('chatRoll.excludeWinnerHelp')}
              </Typography>
            </SettingsToggleCopy>
          </SettingsToggleCard>

          <SettingsToggleCard>
            <Switch
              size="small"
              checked={props.draft.replyInChat}
              disabled={props.settingsDisabled}
              onChange={(event) =>
                props.onReplyInChatChange(event.target.checked)
              }
            />
            <SettingsToggleCopy>
              <ExclusionToggleLabel variant="body2">
                {t('chatRoll.replyInKickChat')}
              </ExclusionToggleLabel>
              <Typography variant="caption" color="text.secondary">
                {t('chatRoll.replyInKickChatHelp')}
              </Typography>
            </SettingsToggleCopy>
          </SettingsToggleCard>

          <SettingsToggleCardColumn>
            <SettingsToggleCardRow>
              <Switch
                size="small"
                checked={props.draft.winnerResponseEnabled}
                disabled={props.settingsDisabled}
                onChange={(event) =>
                  props.onWinnerResponseEnabledChange(event.target.checked)
                }
              />
              <SettingsToggleCopy>
                <ExclusionToggleLabel variant="body2">
                  {t('chatRoll.requireWinnerChatResponse')}
                </ExclusionToggleLabel>
                <Typography variant="caption" color="text.secondary">
                  {t('chatRoll.requireWinnerChatResponseHelp')}
                </Typography>
              </SettingsToggleCopy>
            </SettingsToggleCardRow>

            {props.draft.winnerResponseEnabled ? (
              <SettingsToggleNestedField>
                <TextField
                  label={t('chatRoll.winnerResponseSecondsLabel')}
                  type="number"
                  size="small"
                  fullWidth
                  disabled={props.settingsDisabled}
                  value={props.draft.winnerResponseSeconds}
                  slotProps={{
                    htmlInput: { min: 5, max: 300, step: 5 },
                  }}
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10)
                    if (Number.isFinite(parsed)) {
                      props.onWinnerResponseSecondsChange(parsed)
                    }
                  }}
                  helperText={t('chatRoll.winnerResponseSecondsHelp')}
                />
              </SettingsToggleNestedField>
            ) : null}
          </SettingsToggleCardColumn>
        </Stack>
      </SettingsGroupPanel>
    </SettingsLeftPanel>
  )
}
