import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { FirstReactionRecord } from '@/api/first-reaction'
import { firstReactionHistoryStatusChip } from '@/components/first-reaction/first-reaction-page/firstReactionHistoryStatusChip'
import { formatFirstReactionLiveSessionHint } from '@/components/first-reaction/first-reaction-page/first-reaction-page-utils'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'
import { firstReactionSessionRoute } from '@/lib/routes'
import { moduleLiveHeroCardSx } from '@/lib/module-page-chrome'
import { colors } from '@/theme/colors'

type FirstReactionHistoryLiveHeroProps = {
  record: FirstReactionRecord | null
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
  ...(moduleLiveHeroCardSx('warning', theme, empty) as object),
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

export function FirstReactionHistoryLiveHero({
  record,
  loading = false,
}: FirstReactionHistoryLiveHeroProps) {
  const { t } = useTranslation()

  return (
    <StyledHeroSection>
      <Box component="h3" sx={{ margin: 0 }}>
        <StyledSectionLabel>
          {t('firstReaction.historyLiveNowTitle')}
        </StyledSectionLabel>
      </Box>
      {loading ? (
        <Skeleton variant="rounded" height={140} />
      ) : record ? (
        <StyledHeroCard>
          <StyledTitleRow>
            <StyledTitleMain>
              <ChatRollSessionIdBadge sessionId={record.id} aria-hidden />
              <StyledTitleLink
                to={firstReactionSessionRoute(record.id)}
                aria-label={t('table.openAria', { title: record.title })}
              >
                <StyledHeroTitle>{record.title}</StyledHeroTitle>
              </StyledTitleLink>
            </StyledTitleMain>
            {firstReactionHistoryStatusChip(record, t)}
          </StyledTitleRow>
          <StyledMeta>
            {t('firstReaction.historyCardMeta', {
              author: record.createdByName,
              created: formatPrizeSpinDateTime(record.createdAt),
            })}
          </StyledMeta>
          <StyledHint>{formatFirstReactionLiveSessionHint(t)}</StyledHint>
          <StyledCardActions>
            <OpenSessionButton
              to={firstReactionSessionRoute(record.id)}
              variant="outlined"
              size="small"
              fullWidth={false}
              aria-label={t('table.openAria', { title: record.title })}
            />
          </StyledCardActions>
        </StyledHeroCard>
      ) : (
        <StyledHeroCard empty>
          <StyledHeroTitle>
            {t('firstReaction.historyNoLiveSession')}
          </StyledHeroTitle>
          <StyledHint>{t('firstReaction.historyNoLiveHint')}</StyledHint>
        </StyledHeroCard>
      )}
    </StyledHeroSection>
  )
}
