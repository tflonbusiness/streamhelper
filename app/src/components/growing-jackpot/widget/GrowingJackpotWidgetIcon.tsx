import { Box } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import { useId } from 'react'
import type { GrowingJackpotWidgetStyle } from '@/lib/growing-jackpot-widget-style-defaults'

const iconFlicker = keyframes`
  0%, 100% { opacity: 1; }
  6% { opacity: 0.4; }
  7% { opacity: 1; }
  14% { opacity: 0.65; }
  15% { opacity: 1; }
  48% { opacity: 0.9; }
  49% { opacity: 0.5; }
  50% { opacity: 1; }
  82% { opacity: 1; }
  83% { opacity: 0.55; }
  84% { opacity: 1; }
`

const iconPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.72; transform: scale(1.08); }
`

const IconRoot = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  overflow: 'visible',
})

const IconSvgWrap = styled(Box)({
  position: 'relative',
  height: '78%',
  width: 'auto',
  maxWidth: '92%',
  aspectRatio: '1 / 1',
  animation: `${iconPulse} 2.6s ease-in-out infinite`,
  transformOrigin: 'center center',
  willChange: 'transform',
})

const IconGlowSvg = styled('svg')({
  position: 'absolute',
  inset: '-14%',
  width: '128%',
  height: '128%',
  animation: `${glowPulse} 2.6s ease-in-out infinite`,
  transformOrigin: 'center center',
  willChange: 'transform, opacity',
})

const IconMainSvg = styled('svg')({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'block',
  animation: `${iconFlicker} 3s linear infinite`,
  transformOrigin: 'center center',
  willChange: 'opacity',
})

/** Material TrendingUp–style path, scaled in viewBox 0 0 24 24 */
const TREND_PATH =
  'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z'

type GrowingJackpotWidgetIconProps = {
  style: GrowingJackpotWidgetStyle
}

export function GrowingJackpotWidgetIcon({
  style,
}: GrowingJackpotWidgetIconProps) {
  const gradientId = useId().replace(/:/g, '')

  const fillStart = style.keywordText
  const fillEnd = style.prizeText
  const stroke = style.prizeText
  const glow = style.prizeText

  return (
    <IconRoot aria-hidden>
      <IconSvgWrap>
        <IconGlowSvg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d={TREND_PATH} fill={glow} opacity={0.5} />
        </IconGlowSvg>
        <IconMainSvg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient
              id={gradientId}
              x1="12"
              y1="6"
              x2="12"
              y2="18"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={fillStart} />
              <stop offset="50%" stopColor={fillEnd} />
              <stop offset="100%" stopColor={fillEnd} />
            </linearGradient>
          </defs>
          <path
            d={TREND_PATH}
            fill={`url(#${gradientId})`}
            stroke={stroke}
            strokeWidth={0.35}
            strokeLinejoin="round"
          />
        </IconMainSvg>
      </IconSvgWrap>
    </IconRoot>
  )
}
