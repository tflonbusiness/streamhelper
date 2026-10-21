import { Button, Stack, TextField, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { FirstReactionDraw, FirstReactionRecord } from '@/api/first-reaction'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { SectionHeader } from '@/components/SectionHeader'
import SensorsIcon from '@mui/icons-material/Sensors'

type FirstReactionDrawSectionProps = {
  record: FirstReactionRecord
  activeDraw: FirstReactionDraw | null
  manualKeyword: string
  onManualKeywordChange: (value: string) => void
  isLive: boolean
  readOnly: boolean
  startPending: boolean
  stopPending: boolean
  onStart: () => void
  onStop: () => void
}

const CommandDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
  color: theme.palette.text.primary,
}))

const ActionsRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}))

export function FirstReactionDrawSection(props: FirstReactionDrawSectionProps) {
  const { t } = useTranslation()
  const settings = props.record.settings
  const showManualField =
    settings.wordSource === 'manual' && settings.manualScope === 'per_draw'
  const isAccepting = props.activeDraw?.phase === 'accepting'

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Stack spacing={2.5}>
          <SectionHeader
            title={t('firstReaction.drawTitle')}
            description={t('firstReaction.drawDescription')}
            icon={SensorsIcon}
            iconVariant="warning"
            showDivider={false}
          />
          {!props.isLive ? (
            <Typography variant="body2" color="text.secondary">
              {t('firstReaction.goLiveToDraw')}
            </Typography>
          ) : null}
          {showManualField && props.isLive && !isAccepting ? (
            <TextField
              label={t('firstReaction.keywordLabel')}
              value={props.manualKeyword}
              onChange={(e) => props.onManualKeywordChange(e.target.value)}
              helperText={t('firstReaction.keywordHelper')}
              disabled={props.readOnly}
              fullWidth
            />
          ) : null}
          {isAccepting && props.activeDraw ? (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {t('firstReaction.activeKeyword')}
              </Typography>
              <CommandDisplay>{props.activeDraw.keyword}</CommandDisplay>
              <Typography variant="body2" color="text.secondary">
                {t('firstReaction.phaseAccepting')}
              </Typography>
            </Stack>
          ) : null}
          <ActionsRow>
            {!isAccepting ? (
              <Button
                variant="contained"
                disabled={
                  props.readOnly ||
                  !props.isLive ||
                  props.startPending ||
                  (showManualField && props.manualKeyword.trim().length < 2)
                }
                onClick={props.onStart}
              >
                {t('firstReaction.startDraw')}
              </Button>
            ) : (
              <Button
                color="warning"
                disabled={props.readOnly || props.stopPending}
                onClick={props.onStop}
              >
                {t('firstReaction.stopDraw')}
              </Button>
            )}
          </ActionsRow>
        </Stack>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
