import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChatIcon from '@mui/icons-material/Chat'
import { Skeleton } from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { SectionHeader } from '@/components/SectionHeader'
import {
  SettingsExpandButton,
  SettingsHeaderActions,
  WorkspaceListCard,
  WorkspaceListCardContent,
  WorkspaceSectionHeader,
} from '@/components/chat-roll/chatRollPageStyles'
import { chatRollSessionWorkspaceCardSx } from '@/components/chat-roll/session/chat-roll-session-workspace-layout'
import { StatusAlert } from '@/components/StatusAlert'
import { useKickChannel } from '@/queries/use-kick-channel'

type ChatRollKickChatSectionProps = {
  accountId: number
  onCollapse: () => void
}

const CHAT_FRAME_MIN_HEIGHT_MOBILE = 280

const ChatFrameWrap = styled('div')(({ theme }) => ({
  position: 'relative',
  flex: 1,
  minHeight: 0,
  width: '100%',
  maxWidth: '100%',
  [theme.breakpoints.down('lg')]: {
    minHeight: CHAT_FRAME_MIN_HEIGHT_MOBILE,
  },
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.default,
}))

const ChatFrame = styled('iframe')({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
})

function kickPopoutChatUrl(slug: string) {
  return `https://kick.com/popout/${encodeURIComponent(slug)}/chat`
}

export function ChatRollKickChatSection({
  accountId,
  onCollapse,
}: ChatRollKickChatSectionProps) {
  const { t } = useTranslation()
  const kickChatTitle = t('chatRoll.kickChatTitle')
  const { data: channel, isLoading, error } = useKickChannel(accountId)

  const notFound = error instanceof KickChannelNotFoundError
  const slug = channel?.slug?.trim() ?? ''

  return (
    <WorkspaceListCard elevation={0} sx={chatRollSessionWorkspaceCardSx}>
      <WorkspaceListCardContent>
        <WorkspaceSectionHeader>
          <SectionHeader
            title={t('chatRoll.kickChatTitle')}
            icon={ChatIcon}
            iconVariant="info"
            showDivider={false}
            action={
              <SettingsHeaderActions>
                <Tooltip title={t('chatRoll.collapseKickChatPanel')}>
                  <SettingsExpandButton
                    onClick={onCollapse}
                    aria-label={t('common.collapseDetailsAria', {
                      title: kickChatTitle,
                    })}
                    aria-expanded={true}
                  >
                    <ChevronLeftIcon fontSize="small" aria-hidden />
                  </SettingsExpandButton>
                </Tooltip>
              </SettingsHeaderActions>
            }
          />
        </WorkspaceSectionHeader>

        {isLoading ? (
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{
              flex: 1,
              minHeight: { xs: CHAT_FRAME_MIN_HEIGHT_MOBILE, lg: 0 },
            }}
          />
        ) : notFound || !slug ? (
          <StatusAlert tone="info" title={t('dashboard.kickNotConnected')}>
            {t('chatRoll.kickChatNotConnectedBody')}
          </StatusAlert>
        ) : (
          <ChatFrameWrap>
            <ChatFrame
              key={slug}
              src={kickPopoutChatUrl(slug)}
              title={t('chatRoll.kickChatFrameTitle', { slug })}
              loading="lazy"
            />
          </ChatFrameWrap>
        )}
      </WorkspaceListCardContent>
    </WorkspaceListCard>
  )
}
