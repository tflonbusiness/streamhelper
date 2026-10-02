import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { type PrizeSpinRecord } from '@/api/prize-spin'
import { prizeSpinHistoryStatusChip } from '@/components/prize-spin/prize-spin-page/prizeSpinHistoryStatusChip'
import { formatPrizeSpinLiveSessionHint } from '@/components/prize-spin/prize-spin-page/prize-spin-page-utils'
import { formatPrizeSpinDateTime } from '@/components/prize-spin/prize-spin-utils'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { prizeSpinSessionRoute } from '@/lib/routes'
import { moduleLiveHeroCardSx } from '@/lib/module-page-chrome'
import { colors } from '@/theme/colors'

type PrizeSpinHistoryLiveHeroProps = {
  record: PrizeSpinRecord | null
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
  ...(moduleLiveHeroCardSx('purple', theme, empty) as object),
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

export function PrizeSpinHistoryLiveHero({
  record,
  loading = false,
}: PrizeSpinHistoryLiveHeroProps) {
  const { t } = useTranslation()

  return (
    <StyledHeroSection>
      <Box component="h3" sx={{ margin: 0 }}>
        <StyledSectionLabel>{t('prizeSpin.historyLiveNowTitle')}</StyledSectionLabel>
      </Box>
      {loading ? (
        <Skeleton variant="rounded" height={140} />
      ) : record ? (
        <StyledHeroCard>
          <StyledTitleRow>
            <StyledTitleMain>
              <ChatRollSessionIdBadge sessionId={record.id} aria-hidden />
              <StyledTitleLink
                to={prizeSpinSessionRoute(record.id)}
                aria-label={t('table.openAria', { title: record.title })}
              >
                <StyledHeroTitle>{record.title}</StyledHeroTitle>
              </StyledTitleLink>
            </StyledTitleMain>
            {prizeSpinHistoryStatusChip(record, t)}
          </StyledTitleRow>
          <StyledMeta>
            {t('prizeSpin.historyCardMeta', {
              author: record.createdByName,
              created: formatPrizeSpinDateTime(record.createdAt),
            })}
          </StyledMeta>
          <StyledHint>{formatPrizeSpinLiveSessionHint(t)}</StyledHint>
          <StyledCardActions>
            <OpenSessionButton
              to={prizeSpinSessionRoute(record.id)}
              variant="outlined"
              size="small"
              fullWidth={false}
              aria-label={t('table.openAria', { title: record.title })}
            />
          </StyledCardActions>
        </StyledHeroCard>
      ) : (
        <StyledHeroCard empty>
          <StyledHeroTitle>{t('prizeSpin.historyNoLiveSession')}</StyledHeroTitle>
          <StyledHint>{t('prizeSpin.historyNoLiveHint')}</StyledHint>
        </StyledHeroCard>
      )}
    </StyledHeroSection>
  )
}
