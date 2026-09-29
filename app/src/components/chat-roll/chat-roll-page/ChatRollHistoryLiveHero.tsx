import { Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import { alpha, styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { ChatRollRecord } from '@/api/chat-roll'
import { OpenSessionButton } from '@/components/OpenSessionButton'
import { chatRollSessionRoute } from '@/lib/routes'
import { colors, toneChipSx } from '@/theme/colors'

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
  border: '1px solid',
  borderColor: empty
    ? theme.palette.divider
    : alpha(colors.warning[500], 0.45),
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2.5),
  gap: theme.spacing(1.5),
  backgroundColor: empty
    ? alpha(colors.neutral[100], 0.02)
    : alpha(colors.warning[500], 0.06),
}))

const StyledHeroTitle = styled(Typography)({
  fontWeight: 600,
  fontSize: '1.0625rem',
  lineHeight: 1.3,
})

const StyledKeyword = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  fontSize: '0.9375rem',
  color: theme.palette.text.primary,
}))

const StyledHint = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
}))

const StyledHeroActions = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  [theme.breakpoints.up('sm')]: {
    flexWrap: 'nowrap',
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
        <Skeleton variant="rounded" height={140} />
      ) : record ? (
        <StyledHeroCard>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Chip
              label={t('common.live')}
              size="small"
              sx={toneChipSx(colors.warning[500])}
            />
            <StyledHeroTitle>{record.title}</StyledHeroTitle>
          </Box>
          <StyledKeyword>
            {t('chatRoll.historyLiveKeyword', { keyword: record.keyword })}
          </StyledKeyword>
          <StyledHeroActions>
            <StyledHint sx={{ flex: 1, minWidth: 0 }}>
              {t('chatRoll.sessionNowLive')}
            </StyledHint>
            <OpenSessionButton
              to={chatRollSessionRoute(record.id)}
              size="medium"
              aria-label={t('table.openAria', { title: record.title })}
            />
          </StyledHeroActions>
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
