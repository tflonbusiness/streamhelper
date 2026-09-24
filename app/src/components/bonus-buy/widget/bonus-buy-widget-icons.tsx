import SvgIcon, { type SvgIconProps } from '@mui/material/SvgIcon'

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
      <path
        d="M6 6H8.43845C9.2895 6 9.71503 6 10.0532 6.1865C10.1927 6.26341 10.319 6.36204 10.4274 6.47868C10.6904 6.76153 10.7936 7.17435 11 8L11.2724 9.08957C11.424 9.69602 11.4998 9.99925 11.6168 10.2536C12.023 11.1367 12.8319 11.7683 13.7872 11.9482C14.0623 12 14.3749 12 15 12"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <path
        d="M27 25.5H11.3264C11.1071 25.5 10.9974 25.5 10.9142 25.4907C10.0329 25.392 9.42907 24.5543 9.61417 23.6869C9.63164 23.6051 9.66631 23.5011 9.73566 23.293C9.81265 23.062 9.85115 22.9466 9.89368 22.8446C10.3291 21.8012 11.3142 21.0912 12.4417 21.0081C12.5518 21 12.6736 21 12.9171 21H21"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23.6459 21H14.5414C13.0749 21 11.8233 19.9398 11.5822 18.4932L10.9366 14.6199C10.7081 13.2485 11.7657 12 13.156 12H27.5729C28.688 12 29.4133 13.1735 28.9146 14.1708L26.3292 19.3416C25.821 20.358 24.7822 21 23.6459 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle
        cx={25.5}
        cy={30}
        r={1.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />
      <circle
        cx={13.5}
        cy={30}
        r={1.5}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
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
