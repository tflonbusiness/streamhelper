import { Link, Skeleton, Typography } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { styled } from '@mui/material/styles'
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

const ChatFrameWrap = styled('div')(({ theme }) => ({
  position: 'relative',
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
  const { data: channel, isLoading, error } = useKickChannel(accountId)

  const notFound = error instanceof KickChannelNotFoundError
  const slug = channel?.slug?.trim() ?? ''

  return (
    <ListCard elevation={0} sx={{ height: '100%' }}>
      <ListCardContent>
        <SectionHeader
          title="Kick chat"
          description="Live chat for your account's linked Kick channel."
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
                Open popout
                <OpenInNewIcon sx={{ fontSize: 16 }} aria-hidden />
              </PopoutLink>
            ) : null
          }
        />

        {isLoading ? (
          <Skeleton
            variant="rounded"
            height={CHAT_FRAME_MIN_HEIGHT}
            animation="wave"
          />
        ) : notFound || !slug ? (
          <StatusAlert tone="info" title="Kick channel not connected">
            Connect your Kick channel on the dashboard to preview chat here.
          </StatusAlert>
        ) : (
          <ChatFrameWrap>
            <ChatFrame
              key={slug}
              src={kickPopoutChatUrl(slug)}
              title={`Kick chat for ${slug}`}
              loading="lazy"
            />
          </ChatFrameWrap>
        )}

        {slug ? (
          <Typography
            variant="caption"
            color="text.secondary"
            component="p"
            sx={{ mt: 1.5 }}
          >
            kick.com/popout/{slug}/chat — sign in on Kick to send messages.
          </Typography>
        ) : null}
      </ListCardContent>
    </ListCard>
  )
}
