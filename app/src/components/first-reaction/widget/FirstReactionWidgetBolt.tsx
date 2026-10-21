import { Box } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'

const boltFlicker = keyframes`
  0%, 100% { opacity: 1; }
  4% { opacity: 0.35; }
  5% { opacity: 1; }
  9% { opacity: 0.55; }
  10% { opacity: 1; }
  42% { opacity: 0.92; }
  43% { opacity: 0.45; }
  44% { opacity: 1; }
  78% { opacity: 1; }
  79% { opacity: 0.5; }
  80% { opacity: 1; }
`

const boltPulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(1.06); }
`

const BoltRoot = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  overflow: 'visible',
})

const BoltSvgWrap = styled(Box)({
  position: 'relative',
  height: '84%',
  width: 'auto',
  maxWidth: '92%',
  aspectRatio: '100 / 130',
  animation: `${boltPulse} 2.4s ease-in-out infinite`,
  transformOrigin: 'center center',
  willChange: 'transform',
})

const BoltGlowSvg = styled('svg')({
  position: 'absolute',
  inset: '-12%',
  width: '124%',
  height: '124%',
  animation: `${glowPulse} 2.4s ease-in-out infinite`,
  transformOrigin: 'center center',
  willChange: 'transform, opacity',
})

const BoltMainSvg = styled('svg')({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'block',
  animation: `${boltFlicker} 2.8s linear infinite`,
  transformOrigin: 'center center',
  willChange: 'opacity',
})

/** Decorative lightning behind keyword — CSS-only animation for OBS browser source. */
export function FirstReactionWidgetBolt() {
  return (
    <BoltRoot aria-hidden>
      <BoltSvgWrap>
        <BoltGlowSvg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M58 4 34 58h18L28 126l52-58H62l26-64Z"
            fill="#FFE566"
            opacity={0.55}
          />
        </BoltGlowSvg>
        <BoltMainSvg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fr-bolt-fill" x1="50" y1="4" x2="50" y2="126" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF9C4" />
              <stop offset="45%" stopColor="#FFEB3B" />
              <stop offset="100%" stopColor="#FFC107" />
            </linearGradient>
          </defs>
          <path
            d="M58 4 34 58h18L28 126l52-58H62l26-64Z"
            fill="url(#fr-bolt-fill)"
            stroke="#FFFDE7"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </BoltMainSvg>
      </BoltSvgWrap>
    </BoltRoot>
  )
}
