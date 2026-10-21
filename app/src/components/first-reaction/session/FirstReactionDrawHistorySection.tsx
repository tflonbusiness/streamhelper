import { Stack, Typography } from '@mui/material'
import HistoryIcon from '@mui/icons-material/History'
import { useTranslation } from 'react-i18next'
import type { FirstReactionDraw } from '@/api/first-reaction'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'

type FirstReactionDrawHistorySectionProps = {
  draws: FirstReactionDraw[]
}

export function FirstReactionDrawHistorySection({
  draws,
}: FirstReactionDrawHistorySectionProps) {
  const { t } = useTranslation()

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2}>
          <SectionHeader
            title={t('firstReaction.drawHistoryTitle')}
            icon={HistoryIcon}
            iconVariant="info"
            showDivider={false}
          />
          {draws.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('firstReaction.noDraws')}
            </Typography>
          ) : (
            draws.map((draw) => (
              <Typography key={draw.id} variant="body2">
                #{draw.drawIndex} {draw.keyword} — {draw.phase}
                {draw.result ? ` / ${draw.result}` : ''}
                {draw.winnerDisplayName ? ` → ${draw.winnerDisplayName}` : ''}
                {draw.proofToken ? ` (${draw.proofToken})` : ''}
              </Typography>
            ))
          )}
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
