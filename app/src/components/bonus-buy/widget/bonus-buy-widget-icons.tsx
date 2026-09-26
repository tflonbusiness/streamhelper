import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'
import { useId } from 'react'

const outlineOnlyProps = (props: SvgIconProps): SvgIconProps => ({
  ...props,
  fill: 'none',
  sx: {
    fill: 'none',
    '& path, & circle': { fill: 'none' },
    ...props.sx,
  },
})

export function BonusBuyWidgetGiftIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...outlineOnlyProps(props)} viewBox="0 0 30 30">
      <path
        d="M3.75 12C3.75 11.0572 3.75 10.5858 4.04289 10.2929C4.33579 10 4.80719 10 5.75 10H24.25C25.1928 10 25.6642 10 25.9571 10.2929C26.25 10.5858 26.25 11.0572 26.25 12V14.375C26.25 15.1969 26.25 15.6078 26.023 15.8844C25.9815 15.935 25.935 15.9815 25.8844 16.023C25.6078 16.25 25.1969 16.25 24.375 16.25C23.5531 16.25 23.1422 16.25 22.8656 16.477C22.815 16.5185 22.7685 16.565 22.727 16.6156C22.5 16.8922 22.5 17.3031 22.5 18.125V23C22.5 23.9428 22.5 24.4142 22.2071 24.7071C21.9142 25 21.4428 25 20.5 25H9.5C8.55719 25 8.08579 25 7.79289 24.7071C7.5 24.4142 7.5 23.9428 7.5 23V18.125C7.5 17.3031 7.5 16.8922 7.27301 16.6156C7.23146 16.565 7.18503 16.5185 7.13439 16.477C6.85781 16.25 6.44687 16.25 5.625 16.25C4.80313 16.25 4.39219 16.25 4.11561 16.023C4.06497 15.9815 4.01854 15.935 3.97699 15.8844C3.75 15.6078 3.75 15.1969 3.75 14.375V12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />
      <path
        d="M6.25 16.25H23.75"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M15 8.75L15 25"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M15 8.75L13.7112 7.46118C12.5037 6.25365 11.0316 5.34386 9.41151 4.80384L8.88245 4.62748C7.58739 4.1958 6.25 5.15974 6.25 6.52485V7.30848C6.25 8.16934 6.80086 8.93362 7.61754 9.20585L10 10"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M15 8.75L16.2888 7.46118C17.4963 6.25365 18.9684 5.34386 20.5885 4.80384L21.1175 4.62748C22.4126 4.1958 23.75 5.15974 23.75 6.52485V7.30848C23.75 8.16934 23.1991 8.93362 22.3825 9.20585L20 10"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
    </SvgIcon>
  )
}

export function BonusBuyWidgetBasketIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...outlineOnlyProps(props)} viewBox="0 0 36 36">
      <circle
        cx="18"
        cy="18"
        r="15"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M18.2001 9.95001V26.45"
        stroke="currentColor"
        strokeWidth={2.8}
        strokeLinecap="round"
      />
      <path
        d="M21.95 14.45C21.95 12.8 20.3 11.45 18.2 11.45C16.1 11.45 14.45 12.8 14.45 14.45C14.45 16.4 16.1 17.45 18.2 17.825C20.3 18.2 21.95 19.25 21.95 21.2C21.95 23 20.3 24.95 18.2 24.95C16.1 24.95 14.45 23.45 14.45 21.95"
        stroke="currentColor"
        strokeWidth={2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

export function BonusBuyWidgetCrownIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...outlineOnlyProps(props)} viewBox="0 0 36 36">
      <path
        d="M7.97368 23L6 11.3636L13.2368 16.4545L18.5 7L23.7632 16.4545L31 11.3636L29.0263 23H7.97368Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 29H29"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  )
}

const LIVE_PULSE_SPLINE = '.52,.6,.25,.99'

export function BonusBuyWidgetLivePulseIcon(props: SvgIconProps) {
  const base = useId().replace(/:/g, '')
  const pulse0 = `${base}p0`
  const pulse1 = `${base}p1`
  const pulse2 = `${base}p2`

  return (
    <SvgIcon {...props} viewBox="0 0 24 24" aria-hidden>
      <title>pulse-multiple</title>
      <circle cx="12" cy="12" r="0" fill="currentColor">
        <animate
          id={pulse0}
          fill="freeze"
          attributeName="r"
          begin={`0;${pulse2}.end`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="0;11"
        />
        <animate
          fill="freeze"
          attributeName="opacity"
          begin={`0;${pulse2}.end`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="1;0"
        />
      </circle>
      <circle cx="12" cy="12" r="0" fill="currentColor">
        <animate
          id={pulse1}
          fill="freeze"
          attributeName="r"
          begin={`${pulse0}.begin+0.2s`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="0;11"
        />
        <animate
          fill="freeze"
          attributeName="opacity"
          begin={`${pulse0}.begin+0.2s`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="1;0"
        />
      </circle>
      <circle cx="12" cy="12" r="0" fill="currentColor">
        <animate
          id={pulse2}
          fill="freeze"
          attributeName="r"
          begin={`${pulse0}.begin+0.4s`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="0;11"
        />
        <animate
          fill="freeze"
          attributeName="opacity"
          begin={`${pulse0}.begin+0.4s`}
          calcMode="spline"
          dur="1.2s"
          keySplines={LIVE_PULSE_SPLINE}
          values="1;0"
        />
      </circle>
    </SvgIcon>
  )
}
