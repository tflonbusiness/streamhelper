import { Alert, Box, Chip, Skeleton, Stack, Typography } from '@mui/material'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveRejectedOrder } from '@/api/media-interactive'
import { SectionHeader } from '@/components/SectionHeader'
import { MediaInteractiveListEmptyState } from '@/components/media-interactive/media-interactive-page/MediaInteractiveListEmptyState'
import {
  StyledCard,
  StyledCardContent,
  StyledRejectedOrderCard,
  StyledRejectedOrderCardBody,
  StyledRejectedOrderTitleRow,
  StyledRejectedOrdersList,
  StyledRejectedOrdersScroll,
  StyledViewerOrdersRewardsHeader,
} from '@/components/media-interactive/media-interactive-page/media-interactive-page-styles'
import { useMediaInteractiveRejectedOrders } from '@/queries/use-media-interactive'

type MediaInteractiveRejectedOrdersSectionProps = {
  accountId: number
}

function rejectReasonLabel(
  t: (key: string) => string,
  reason: string | null,
): string {
  if (!reason) {
    return t('mediaInteractive.rejectedReasonUnknown')
  }
  const key = `mediaInteractive.rejectedReason.${reason}`
  const translated = t(key)
  return translated === key ? reason : translated
}

function formatRejectedTime(createdAt: string): string {
  const at = dayjs(createdAt)
  const now = dayjs()
  if (at.isSame(now, 'day')) {
    return at.format('HH:mm')
  }
  return at.format('D MMM, HH:mm')
}

function RejectedOrderCard({
  row,
  reasonLabel,
  pointsShort,
}: {
  row: MediaInteractiveRejectedOrder
  reasonLabel: string
  pointsShort: string
}) {
  return (
    <StyledRejectedOrderCard>
      <StyledRejectedOrderCardBody>
        <StyledRejectedOrderTitleRow>
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 600,
              lineHeight: 1.35,
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={row.title}
          >
            {row.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
              fontWeight: 500,
              mt: 0.125,
            }}
          >
            {formatRejectedTime(row.createdAt)}
          </Typography>
        </StyledRejectedOrderTitleRow>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.45 }}>
          <Typography
            component="span"
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {row.requesterNick}
          </Typography>
          {' · '}
          {row.pointsCharged.toLocaleString()} {pointsShort}
        </Typography>
        <Chip
          size="small"
          color="error"
          variant="outlined"
          label={reasonLabel}
          sx={{
            alignSelf: 'flex-start',
            height: 24,
            '& .MuiChip-label': { px: 1, fontSize: '0.6875rem', fontWeight: 600 },
          }}
        />
      </StyledRejectedOrderCardBody>
    </StyledRejectedOrderCard>
  )
}

export function MediaInteractiveRejectedOrdersSection({
  accountId,
}: MediaInteractiveRejectedOrdersSectionProps) {
  const { t } = useTranslation()
  const { data, isPending, isError, refetch } = useMediaInteractiveRejectedOrders(
    accountId,
  )

  const items = data?.items ?? []

  return (
    <StyledCard>
      <StyledCardContent>
        <SectionHeader
          title={t('mediaInteractive.rejectedOrdersTitle')}
          description={t('mediaInteractive.rejectedOrdersHint')}
          icon={BlockOutlinedIcon}
          iconVariant="danger"
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
            {t('mediaInteractive.rejectedOrdersLoadError')}
          </Alert>
        ) : isPending ? (
          <Stack spacing={1} sx={{ mt: 2 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={88} />
            ))}
          </Stack>
        ) : items.length === 0 ? (
          <Box sx={{ mt: 2 }}>
            <MediaInteractiveListEmptyState
              icon={BlockOutlinedIcon}
              title={t('mediaInteractive.rejectedOrdersEmptyTitle')}
              description={t('mediaInteractive.rejectedOrdersEmpty')}
            />
          </Box>
        ) : (
          <>
            <StyledViewerOrdersRewardsHeader sx={{ mt: 2, mb: 0 }}>
              <Typography
                variant="subtitle2"
                component="span"
                sx={{ m: 0, flexShrink: 0 }}
              >
                {t('mediaInteractive.rejectedOrdersListTitle')}
              </Typography>
              <Chip
                size="small"
                label={t('mediaInteractive.rejectedOrdersCount', {
                  count: items.length,
                })}
                color="error"
                variant="outlined"
              />
            </StyledViewerOrdersRewardsHeader>
            <StyledRejectedOrdersScroll>
              <StyledRejectedOrdersList>
                {items.map((row) => (
                  <RejectedOrderCard
                    key={row.id}
                    row={row}
                    reasonLabel={rejectReasonLabel(t, row.rejectReason)}
                    pointsShort={t('mediaInteractive.burnedPointsShort')}
                  />
                ))}
              </StyledRejectedOrdersList>
            </StyledRejectedOrdersScroll>
          </>
        )}
      </StyledCardContent>
    </StyledCard>
  )
}
