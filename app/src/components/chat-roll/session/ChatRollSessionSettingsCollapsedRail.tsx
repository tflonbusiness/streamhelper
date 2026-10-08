import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import {
  SettingsCollapsedCard,
  SettingsCollapsedRail,
  SettingsExpandButton,
  SettingsSaveButton,
} from '@/components/chat-roll/chatRollPageStyles'
import { IconTile } from '@/components/IconTile'
import { chatRollSessionWorkspaceCardSx } from '@/components/chat-roll/session/chat-roll-session-workspace-layout'

type ChatRollSessionSettingsCollapsedRailProps = {
  readOnly: boolean
  isDirty: boolean
  canSave: boolean
  isSaving: boolean
  onExpand: () => void
  onSave: () => void
}

export function ChatRollSessionSettingsCollapsedRail(
  props: ChatRollSessionSettingsCollapsedRailProps,
) {
  const { t } = useTranslation()
  const settingsTitle = t('chatRoll.settingsTitle')

  return (
    <SettingsCollapsedCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <SettingsCollapsedRail>
        <Tooltip title={t('chatRoll.expandSettingsPanel')}>
          <SettingsExpandButton
            onClick={props.onExpand}
            aria-label={t('common.expandDetailsAria', { title: settingsTitle })}
            aria-expanded={false}
          >
            <ChevronRightIcon fontSize="small" aria-hidden />
          </SettingsExpandButton>
        </Tooltip>

        <Tooltip title={settingsTitle}>
          <Badge
            color="warning"
            variant="dot"
            invisible={!props.isDirty || props.readOnly}
            overlap="circular"
          >
            <IconTile icon={SettingsIcon} variant="info" />
          </Badge>
        </Tooltip>

        {!props.readOnly && props.isDirty ? (
          <Tooltip title={t('common.save')}>
            <span>
              <SettingsSaveButton
                variant="contained"
                size="small"
                color="primary"
                disabled={!props.canSave}
                onClick={props.onSave}
                sx={{ minWidth: 0, px: 1 }}
                aria-label={props.isSaving ? t('common.saving') : t('common.save')}
              >
                <SaveIcon fontSize="small" aria-hidden />
              </SettingsSaveButton>
            </span>
          </Tooltip>
        ) : null}
      </SettingsCollapsedRail>
    </SettingsCollapsedCard>
  )
}
