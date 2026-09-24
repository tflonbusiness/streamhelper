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
  return (
    <SettingsLeftPanel>
      <SettingsGroupPanel>
        <SettingsGroupTitle>
          <TagIcon fontSize="inherit" aria-hidden />
          Chat keyword
        </SettingsGroupTitle>
        <KeywordField
          label="Keyword"
          size="small"
          value={props.keywordDraft}
          onChange={(event) => props.onKeywordChange(event.target.value)}
          onBlur={props.onKeywordBlur}
          error={Boolean(props.keywordError)}
          helperText={
            props.keywordError ??
            'Viewers must send this exact message in Kick chat to join.'
          }
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
          Roll options
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
            Weight combine
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
            <ToggleButton value="highest" aria-label="Use highest coefficient">
              Highest
            </ToggleButton>
            <ToggleButton value="sum" aria-label="Sum coefficients">
              Sum
            </ToggleButton>
          </ToggleButtonGroup>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
            {props.record.combineMode === 'highest'
              ? 'Uses the single best role weight for each participant.'
              : 'Adds weights from every enabled role the viewer has.'}
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
                Exclude winner after roll
              </ExclusionToggleLabel>
              <Typography variant="caption" color="text.secondary">
                Rolled winners leave the pool until you remove or clear them.
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
                Reply in Kick chat
              </ExclusionToggleLabel>
              <Typography variant="caption" color="text.secondary">
                Bot posts a short confirmation when someone joins with the keyword.
              </Typography>
            </SettingsToggleCopy>
          </SettingsToggleCard>
        </Stack>
      </SettingsGroupPanel>
    </SettingsLeftPanel>
  )
}
