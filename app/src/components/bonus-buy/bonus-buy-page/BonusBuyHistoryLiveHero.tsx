import { Box, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import {
  formatBonusBuyDateTime,
  formatBonusBuyUsd,
} from '@/components/bonus-buy/bonus-buy-page/bonus-buy-page-utils'
import { bonusBuyHistoryStatusChip } from '@/components/bonus-buy/bonus-buy-page/bonusBuyHistoryStatusChip'
import { ChatRollSessionIdBadge } from '@/components/chat-roll/session/ChatRollSessionIdBadge'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { bonusBuySessionRoute } from '@/lib/routes'
import { colors } from '@/theme/colors'

type BonusBuyHistoryLiveHeroProps = {
  record: BonusBuyRecord | null
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
  position: 'relative',
  overflow: 'hidden',
  border: '1px solid',
  borderColor: empty
    ? theme.palette.divider
    : alpha(colors.warning[500], 0.35),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  paddingLeft: empty ? theme.spacing(2) : theme.spacing(2.5),
  gap: theme.spacing(1),
  backgroundColor: empty
    ? alpha(colors.neutral[100], 0.02)
    : alpha(colors.warning[500], 0.05),
  '&::before': empty
    ? undefined
    : {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        backgroundColor: colors.warning[500],
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

const StyledBalanceRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

const StyledBalanceLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: theme.palette.text.secondary,
}))

const StyledBalanceValue = styled('span')(({ theme }) => ({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.9375rem',
  fontWeight: 600,
  lineHeight: 1.35,
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

export function BonusBuyHistoryLiveHero({
  record,
  loading = false,
}: BonusBuyHistoryLiveHeroProps) {
  const { t } = useTranslation()

  return (
    <StyledHeroSection>
      <Box component="h3" sx={{ margin: 0 }}>
        <StyledSectionLabel>{t('bonusBuy.historyLiveNowTitle')}</StyledSectionLabel>
      </Box>
      {loading ? (
        <Skeleton variant="rounded" height={160} />
      ) : record ? (
        <StyledHeroCard>
          <StyledTitleRow>
            <StyledTitleMain>
              <ChatRollSessionIdBadge sessionId={record.id} aria-hidden />
              <StyledTitleLink
                to={bonusBuySessionRoute(record.id)}
                aria-label={t('table.openAria', { title: record.name })}
              >
                <StyledHeroTitle>{record.name}</StyledHeroTitle>
              </StyledTitleLink>
            </StyledTitleMain>
            {bonusBuyHistoryStatusChip(record, t)}
          </StyledTitleRow>
          <StyledBalanceRow>
            <StyledBalanceLabel>
              {t('bonusBuy.historyStartBalanceLabel')}
            </StyledBalanceLabel>
            <StyledBalanceValue title={record.startBalance}>
              {formatBonusBuyUsd(record.startBalance, record.currencyCode)}
            </StyledBalanceValue>
          </StyledBalanceRow>
          <StyledMeta>
            {t('bonusBuy.historyCardMeta', {
              author: record.createdByName,
              created: formatBonusBuyDateTime(record.createdAt),
            })}
          </StyledMeta>
          <StyledHint>{t('bonusBuy.historyLiveHint')}</StyledHint>
          <StyledCardActions>
            <OpenSessionButton
              to={bonusBuySessionRoute(record.id)}
              variant="outlined"
              size="small"
              fullWidth={false}
              aria-label={t('table.openAria', { title: record.name })}
            />
          </StyledCardActions>
        </StyledHeroCard>
      ) : (
        <StyledHeroCard empty>
          <StyledHeroTitle>{t('bonusBuy.historyNoLiveSession')}</StyledHeroTitle>
          <StyledHint>{t('bonusBuy.historyNoLiveHint')}</StyledHint>
        </StyledHeroCard>
      )}
    </StyledHeroSection>
  )
}
