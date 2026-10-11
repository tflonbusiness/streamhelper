import { Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import type { MediaInteractiveItem } from '@/api/media-interactive'
import { MediaInteractivePlayerCard } from '@/components/media-interactive/MediaInteractivePlayerCard'

type MediaInteractiveNowPlayingHeroProps = {
  nowPlaying: MediaInteractiveItem | null | undefined
  paused: boolean
  loading?: boolean
  onTogglePause: () => void
  onSkip: () => void
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

export function MediaInteractiveNowPlayingHero({
  nowPlaying,
  paused,
  loading,
  onTogglePause,
  onSkip,
}: MediaInteractiveNowPlayingHeroProps) {
  const { t } = useTranslation()

  return (
    <StyledHeroSection>
      <StyledSectionLabel component="p">
        {t('mediaInteractive.transport')}
      </StyledSectionLabel>
      <MediaInteractivePlayerCard
        variant="workspace"
        track={nowPlaying}
        paused={paused}
        loading={loading}
        onTogglePause={onTogglePause}
        onSkip={onSkip}
      />
    </StyledHeroSection>
  )
}
