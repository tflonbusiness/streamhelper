import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ChatRollRecord } from '@/api/chat-roll'
import { chatRollHistoryStatusChip } from '@/components/chat-roll/chat-roll-page/chatRollHistoryStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { StyledSessionBadgeGroup } from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'
import { formatChatRollLiveSessionHint } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import { chatRollSessionRoute } from '@/lib/routes'
import { moduleLiveHeroCardSx } from '@/lib/module-page-chrome'
import { colors } from '@/theme/colors'

type ChatRollHistoryLiveHeroProps = {
  record: ChatRollRecord | null
  loading?: boolean
}

const StyledHeroSection = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
}))

const StyledSectionLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}))

const StyledHeroCard = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'empty',
})<{ empty?: boolean }>(({ theme, empty }) => ({
  padding: theme.spacing(2),
  paddingLeft: empty ? theme.spacing(2) : theme.spacing(2.5),
  gap: theme.spacing(1),
  ...(moduleLiveHeroCardSx('info', theme, empty) as object),
  '& > *': {
    position: 'relative',
    zIndex: 1,
  },
}))

const StyledTitleRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
}))

const StyledTitleMain = styled(Box)({
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

const StyledTitleLink = styled(Link)(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  textDecoration: 'none',
  color: 'inherit',
  borderRadius: theme.shape.borderRadius,
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
}))

const StyledHeroTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '1rem',
  lineHeight: 1.35,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

const StyledKeywordRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

const StyledKeywordLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
}))

const StyledKeywordValue = styled('span')(({ theme }) => ({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.35,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  color: theme.palette.text.primary,
  padding: theme.spacing(0.375, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.12),
}))

const StyledMeta = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.4,
}))

const StyledHint = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}))

const StyledCardActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: theme.spacing(0.5),
  paddingTop: theme.spacing(1.5),
  borderTop: '1px solid',
  borderColor: alpha(colors.neutral[100], 0.08),
  '& .MuiButton-root': {
    width: 'auto',
    flex: 'none',
  },
}))

export function ChatRollHistoryLiveHero({
  record,
  loading = false,
}: ChatRollHistoryLiveHeroProps) {
  const { t } = useTranslation()

  return (
    <StyledHeroSection>
      <Box component="h3" sx={{ margin: 0 }}>
        <StyledSectionLabel>{t('chatRoll.historyLiveNowTitle')}</StyledSectionLabel>
      </Box>
      {loading ? (
        <Skeleton variant="rounded" height={160} />
      ) : record ? (
        <StyledHeroCard>
          <StyledTitleRow>
            <StyledTitleMain>
              <ChatRollSessionIdBadge sessionId={record.id} aria-hidden />
              <StyledTitleLink
                to={chatRollSessionRoute(record.id)}
                aria-label={t('table.openAria', { title: record.title })}
              >
                <StyledHeroTitle>{record.title}</StyledHeroTitle>
              </StyledTitleLink>
            </StyledTitleMain>
            <StyledSessionBadgeGroup>
              {chatRollHistoryStatusChip(record, t)}
              {record.isAcceptingParticipants ? (
                <Chip
                  label={t('chatRoll.entriesOpen')}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              ) : (
                <Chip
                  label={t('chatRoll.entriesPaused')}
                  size="small"
                  color="warning"
                  variant="outlined"
                />
              )}
            </StyledSessionBadgeGroup>
          </StyledTitleRow>
          <StyledKeywordRow>
            <StyledKeywordLabel>
              {t('chatRoll.historyLiveKeywordLabel')}
            </StyledKeywordLabel>
            <StyledKeywordValue title={record.keyword}>
              {record.keyword}
            </StyledKeywordValue>
          </StyledKeywordRow>
          <StyledMeta>
            {t('chatRoll.historyCardMeta', {
              author: record.createdByName,
              created: formatPrizeSpinDateTime(record.createdAt),
            })}
          </StyledMeta>
          <StyledHint>
            {formatChatRollLiveSessionHint(t, record.isAcceptingParticipants)}
          </StyledHint>
          <StyledCardActions>
            <OpenSessionButton
              to={chatRollSessionRoute(record.id)}
              variant="outlined"
              size="small"
              fullWidth={false}
              aria-label={t('table.openAria', { title: record.title })}
            />
          </StyledCardActions>
        </StyledHeroCard>
      ) : (
        <StyledHeroCard empty>
          <StyledHeroTitle>{t('chatRoll.historyNoLiveSession')}</StyledHeroTitle>
          <StyledHint>{t('chatRoll.historyNoLiveHint')}</StyledHint>
        </StyledHeroCard>
      )}
    </StyledHeroSection>
  )
}
