import { Alert, Stack, Typography } from '@mui/material'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import { useTranslation } from 'react-i18next'
import { SectionHeader } from '@/components/SectionHeader'
import { MediaInteractiveBurnedChart } from '@/components/media-interactive/media-interactive-page/MediaInteractiveBurnedChart'
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
  const { data: burned, isPending, isError, refetch } = useMediaInteractiveBurned(accountId)

  const dailySeries = burned?.dailySeries ?? []

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

        {isError ? (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            action={
              <Typography
                component="button"
                variant="body2"
                onClick={() => void refetch()}
                sx={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {t('mediaInteractive.burnedRetry')}
              </Typography>
            }
          >
            {t('mediaInteractive.burnedLoadError')}
          </Alert>
        ) : (
          <>
            <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mt: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {(burned?.burnedTotal ?? 0).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('mediaInteractive.burnedOrdersCount', {
                  count: burned?.orderCount ?? 0,
                })}
              </Typography>
            </Stack>

            <MediaInteractiveBurnedChart
              dailySeries={dailySeries}
              loading={isPending}
            />

            {!isPending && (burned?.orderCount ?? 0) === 0 ? (
              <Alert severity="info" sx={{ mt: 1 }}>
                {t('mediaInteractive.burnedEmpty')}
              </Alert>
            ) : null}
          </>
        )}
      </StyledCardContent>
    </StyledCard>
  )
}
