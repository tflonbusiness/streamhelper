import { Stack, Typography } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from '@/components/SectionHeader'
import {
  StyledCard,
  StyledCardContent,
} from '@/components/media-interactive/media-interactive-page/media-interactive-page-styles'
import { useMediaInteractiveBurned } from '@/queries/use-media-interactive'

type MediaInteractiveBurnedSectionProps = {
  accountId: number
}

export function MediaInteractiveBurnedSection({
  accountId,
}: MediaInteractiveBurnedSectionProps) {
  const { t } = useTranslation()
  const { data: burned } = useMediaInteractiveBurned(accountId)

  return (
    <StyledCard>
      <StyledCardContent>
        <SectionHeader
          title={t('mediaInteractive.burnedTitle')}
          description={t('mediaInteractive.burnedHint')}
          icon={LocalFireDepartmentIcon}
          iconVariant="warning"
          showDivider={false}
        />
        <Typography variant="h4" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
          {burned?.burnedTotal ?? 0}
        </Typography>
        <Stack
          spacing={0.5}
          sx={{ mt: 1, maxHeight: 220, overflow: 'auto' }}
        >
          {(burned?.ledger ?? []).map((row) => (
            <Typography
              key={row.id}
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block' }}
            >
              {row.requesterNick}: {row.title} ({row.pointsCharged}) —{' '}
              {row.status}
            </Typography>
          ))}
        </Stack>
      </StyledCardContent>
    </StyledCard>
  )
}
