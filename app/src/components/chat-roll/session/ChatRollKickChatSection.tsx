import { Link, Skeleton } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { KickChannelNotFoundError } from '@/api/kick-channel'
import { SectionHeader } from '@/components/SectionHeader'
import {
  ListCard,
  ListCardContent,
} from '@/components/chat-roll/chatRollPageStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useKickChannel } from '@/queries/use-kick-channel'

type ChatRollKickChatSectionProps = {
  accountId: number
}

const CHAT_FRAME_MIN_HEIGHT = 560

const ChatListCard = styled(ListCard)({
  flex: 1,
  width: '100%',
  minWidth: 0,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
})

const ChatListCardContent = styled(ListCardContent)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
})

const ChatFrameWrap = styled('div')(({ theme }) => ({
  position: 'relative',
  flex: 1,
  width: '100%',
  minHeight: CHAT_FRAME_MIN_HEIGHT,
  maxWidth: '100%',
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

const PopoutLink = styled(Link)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  fontSize: theme.typography.pxToRem(13),
  fontWeight: 500,
}))

function kickPopoutChatUrl(slug: string) {
  return `https://kick.com/popout/${encodeURIComponent(slug)}/chat`
}

export function ChatRollKickChatSection({
  accountId,
}: ChatRollKickChatSectionProps) {
  const { t } = useTranslation()
  const { data: channel, isLoading, error } = useKickChannel(accountId)

  const notFound = error instanceof KickChannelNotFoundError
  const slug = channel?.slug?.trim() ?? ''

  return (
    <ChatListCard elevation={0}>
      <ChatListCardContent>
        <SectionHeader
          title={t('chatRoll.kickChatTitle')}
          icon={ChatIcon}
          iconVariant="info"
          action={
            slug ? (
              <PopoutLink
                href={kickPopoutChatUrl(slug)}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                color="primary"
              >
                {t('chatRoll.kickChatPopout')}
                <OpenInNewIcon sx={{ fontSize: 16 }} aria-hidden />
              </PopoutLink>
            ) : null
          }
        />

        {isLoading ? (
          <Skeleton
            variant="rounded"
            animation="wave"
            sx={{ flex: 1, minHeight: CHAT_FRAME_MIN_HEIGHT }}
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
      </ChatListCardContent>
    </ChatListCard>
  )
}
