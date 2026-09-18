import { Box, Chip, Stack, Typography } from '@mui/material'
import BarChartIcon from '@mui/icons-material/BarChart'
import { alpha, styled, useTheme } from '@mui/material/styles'
import { useMemo } from 'react'
import type { PrizeSpinSector, PrizeSpinWin } from '@/api/prize-spin'
import { IconTile } from '@/components/IconTile'
import { buildWinnerSectorStats } from '@/components/prize-spin/session/prize-spin-session-utils'
import { PrizeSpinSessionColorSwatch } from '@/components/prize-spin/session/PrizeSpinSessionColorSwatch'
import { PrizeSpinSessionTruncatedText } from '@/components/prize-spin/session/PrizeSpinSessionTruncatedText'
import {
  StyledSectionDivider,
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { mutedChipSx } from '@/theme/colors'

type PrizeSpinSessionStatsCardProps = {
  wins: PrizeSpinWin[]
  sectors: PrizeSpinSector[]
}

const StatsHeader = styled(Stack)({
  alignItems: 'center',
  justifyContent: 'space-between',
})

const StatsTitleRow = styled(Stack)({
  alignItems: 'center',
})

const StatsTitle = styled(Typography)({
  fontWeight: 600,
})

const StatRows = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.5),
}))

const StatRow = styled(Stack)({
  alignItems: 'flex-start',
  minWidth: 0,
})

const StatRowContent = styled(Box)({
  flex: 1,
  minWidth: 0,
})

const StatRowHeader = styled(Stack)({
  alignItems: 'baseline',
  justifyContent: 'space-between',
  minWidth: 0,
})

const StatLabel = styled(Box)({
  flex: 1,
  minWidth: 0,
  paddingRight: 8,
})

const StatValue = styled(Stack)({
  flexShrink: 0,
  alignItems: 'baseline',
})

const StatValueText = styled(Typography)({
  whiteSpace: 'nowrap',
})

const StatBarTrack = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  height: 3,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.info.main, 0.15),
  overflow: 'hidden',
}))

const StatBarFill = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'percent',
})<{ percent: number }>(({ theme, percent }) => ({
  height: '100%',
  width: `${percent}%`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.info.main,
  transition: 'width 0.2s ease',
}))

export const PrizeSpinSessionStatsCard = (
  props: PrizeSpinSessionStatsCardProps,
) => {
  const theme = useTheme()
  const { total, rows } = useMemo(
    () => buildWinnerSectorStats(props.wins, props.sectors),
    [props.wins, props.sectors],
  )

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <StatsHeader direction="row" spacing={2}>
          <StatsTitleRow direction="row" spacing={1.5}>
            <IconTile icon={BarChartIcon} variant="info" size="sm" />
            <StatsTitle variant="h6">Stats</StatsTitle>
          </StatsTitleRow>
          <Chip
            label={`${total} total roll${total === 1 ? '' : 's'}`}
            size="small"
            sx={mutedChipSx(theme)}
          />
        </StatsHeader>
        <StyledSectionDivider />
        {rows.length > 0 ? (
          <StatRows>
            {rows.map((row) => (
              <StatRow key={row.sectorId} direction="row" spacing={1}>
                <PrizeSpinSessionColorSwatch swatchColor={row.color} />
                <StatRowContent>
                  <StatRowHeader direction="row" spacing={1}>
                    <StatLabel>
                      <PrizeSpinSessionTruncatedText text={row.label} />
                    </StatLabel>
                    <StatValue direction="row" spacing={0.75}>
                      <StatValueText variant="body2" color="text.secondary">
                        {row.count}{' '}
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                        >
                          ({row.actualPercent.toFixed(1)}%)
                        </Typography>
                      </StatValueText>
                    </StatValue>
                  </StatRowHeader>
                  <StatBarTrack>
                    <StatBarFill percent={row.actualPercent} />
                  </StatBarTrack>
                </StatRowContent>
              </StatRow>
            ))}
          </StatRows>
        ) : (
          <StatusAlert tone="info">
            Add wheel sectors to see drop statistics.
          </StatusAlert>
        )}
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
