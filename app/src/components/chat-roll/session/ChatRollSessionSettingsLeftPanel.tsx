import {
  Box,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import TagIcon from '@mui/icons-material/Tag'
import TuneIcon from '@mui/icons-material/Tune'
import { useTranslation } from 'react-i18next'
import type { ChatRollRecord } from '@/api/chat-roll'
import type { WeightCombineMode } from '@/lib/chat-roll'
import {
  ExclusionToggleLabel,
  KeywordField,
  SettingsGroupPanel,
  SettingsGroupTitle,
  SettingsLeftPanel,
  SettingsToggleCard,
  SettingsToggleCopy,
} from '@/components/chat-roll/chatRollPageStyles'

type ChatRollSessionSettingsLeftPanelProps = {
  record: ChatRollRecord
  keywordDraft: string
  keywordError: string | null
  settingsDisabled: boolean
  onKeywordChange: (value: string) => void
  onKeywordBlur: () => void
  onCombineModeChange: (mode: WeightCombineMode) => void
  onExcludeWinnerChange: (checked: boolean) => void
  onReplyInChatChange: (checked: boolean) => void
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
          value={props.keywordDraft}
          onChange={(event) => props.onKeywordChange(event.target.value)}
          onBlur={props.onKeywordBlur}
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
            value={props.record.combineMode}
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
            {props.record.combineMode === 'highest'
              ? t('chatRoll.combineHighest')
              : t('chatRoll.combineSum')}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mt: 2 }}>
          <SettingsToggleCard>
            <Switch
              size="small"
              checked={props.record.excludeWinnerAfterRoll}
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
              checked={props.record.replyInChat}
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
        </Stack>
      </SettingsGroupPanel>
    </SettingsLeftPanel>
  )
}
