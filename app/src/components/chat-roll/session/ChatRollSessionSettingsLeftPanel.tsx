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
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import TuneIcon from '@mui/icons-material/Tune'
import { useTranslation } from 'react-i18next'
import type { ChatRollRoleId, WeightCombineMode } from '@/lib/chat-roll'
import type { ChatRollSessionSettingsDraft } from '@/lib/chat-roll-session-settings'
import { getChatRollRoleWeightFieldError } from '@/lib/chat-roll-session-settings'
import {
  ExclusionToggleLabel,
  KeywordField,
  RoleLabel,
  RoleRowStack,
  RoleWeightField,
  SettingsLeftPanel,
  SettingsToggleCard,
  SettingsToggleCardColumn,
  SettingsToggleCardRow,
  SettingsToggleCopy,
  SettingsToggleNestedField,
} from '@/components/chat-roll/chatRollPageStyles'
import { ChatRollSettingsCollapsibleGroup } from '@/components/chat-roll/session/ChatRollSettingsCollapsibleGroup'

type ChatRollRoleMeta = {
  id: ChatRollRoleId
  label: string
  description: string
}

type ChatRollSessionSettingsLeftPanelProps = {
  draft: ChatRollSessionSettingsDraft
  keywordError: string | null
  winnerResponseSecondsError: string | null
  settingsDisabled: boolean
  onKeywordChange: (value: string) => void
  onCombineModeChange: (mode: WeightCombineMode) => void
  onExcludeWinnerChange: (checked: boolean) => void
  onWinnerResponseEnabledChange: (checked: boolean) => void
  onWinnerResponseSecondsChange: (raw: string) => void
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
      <ChatRollSettingsCollapsibleGroup
        title={t('chatRoll.mainSettings')}
        titleIcon={<SettingsOutlinedIcon fontSize="inherit" aria-hidden />}
      >
        <KeywordField
          label={t('chatRoll.keywordLabel')}
          size="small"
          value={props.draft.keyword}
          onChange={(event) => props.onKeywordChange(event.target.value)}
          error={Boolean(props.keywordError)}
          helperText={props.keywordError ?? undefined}
          fullWidth
          disabled={props.settingsDisabled}
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.02em' },
            },
          }}
        />
        <SettingsToggleCardColumn sx={{ mt: 2 }}>
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
                error={Boolean(props.winnerResponseSecondsError)}
                slotProps={{
                  htmlInput: { step: 1 },
                }}
                onChange={(event) => {
                  props.onWinnerResponseSecondsChange(event.target.value)
                }}
                helperText={
                  props.winnerResponseSecondsError ??
                  t('chatRoll.winnerResponseSecondsHelp')
                }
              />
            </SettingsToggleNestedField>
          ) : null}
        </SettingsToggleCardColumn>
      </ChatRollSettingsCollapsibleGroup>

      <ChatRollSettingsCollapsibleGroup
        title={t('chatRoll.eligibleRoles')}
        titleIcon={<GroupIcon fontSize="inherit" aria-hidden />}
      >
        <Stack spacing={1}>
          {props.roleMeta.map((role) => {
            const setting = props.draft.roleSettings[role.id]
            const weightError = getChatRollRoleWeightFieldError(
              props.draft,
              role.id,
              t,
            )
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
                  error={Boolean(weightError)}
                  helperText={weightError ?? undefined}
                  onChange={(event) =>
                    props.onRoleWeightChange(role.id, event.target.value)
                  }
                  slotProps={{
                    htmlInput: {
                      step: 0.1,
                    },
                  }}
                />
              </RoleRowStack>
            )
          })}
        </Stack>
      </ChatRollSettingsCollapsibleGroup>

      <ChatRollSettingsCollapsibleGroup
        title={t('chatRoll.rollOptions')}
        titleIcon={<TuneIcon fontSize="inherit" aria-hidden />}
        defaultExpanded={false}
      >
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
              checked={false}
              disabled
              readOnly
            />
            <SettingsToggleCopy>
              <ExclusionToggleLabel variant="body2" color="text.secondary">
                {t('chatRoll.replyInKickChat')}
              </ExclusionToggleLabel>
              <Typography variant="caption" color="text.secondary">
                {t('chatRoll.replyInKickChatHelp')}
              </Typography>
            </SettingsToggleCopy>
          </SettingsToggleCard>
        </Stack>
      </ChatRollSettingsCollapsibleGroup>
    </SettingsLeftPanel>
  )
}
