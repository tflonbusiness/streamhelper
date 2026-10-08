import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ChatIcon from '@mui/icons-material/Chat'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import {
  SettingsCollapsedCard,
  SettingsCollapsedRail,
  SettingsExpandButton,
} from '@/components/chat-roll/chatRollPageStyles'
import { IconTile } from '@/components/IconTile'
import { chatRollSessionWorkspaceCardSx } from '@/components/chat-roll/session/chat-roll-session-workspace-layout'

type ChatRollKickChatCollapsedRailProps = {
  onExpand: () => void
}

export function ChatRollKickChatCollapsedRail(
  props: ChatRollKickChatCollapsedRailProps,
) {
  const { t } = useTranslation()
  const kickChatTitle = t('chatRoll.kickChatTitle')

  return (
    <SettingsCollapsedCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <SettingsCollapsedRail>
        <Tooltip title={t('chatRoll.expandKickChatPanel')}>
          <SettingsExpandButton
            onClick={props.onExpand}
            aria-label={t('common.expandDetailsAria', { title: kickChatTitle })}
            aria-expanded={false}
          >
            <ChevronRightIcon fontSize="small" aria-hidden />
          </SettingsExpandButton>
        </Tooltip>

        <Tooltip title={kickChatTitle}>
          <IconTile icon={ChatIcon} variant="info" />
        </Tooltip>
      </SettingsCollapsedRail>
    </SettingsCollapsedCard>
  )
}
