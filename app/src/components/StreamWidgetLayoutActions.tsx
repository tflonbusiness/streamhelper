import { Button, Stack } from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { WidgetSettingsPaletteIcon } from '@/components/widget/WidgetSettingsPaletteIcon'

export type StreamWidgetLayoutActionsProps = {
  settingsLabel: string
  onOpenSettings: () => void
  overlayHref: string | null
  openOverlayLabel: string
  obsLinkLabel: string
  obsOverlayUrl: string
  onCopyObsLink: () => void
}

const StepRow = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  textAlign: 'left',
  padding: theme.spacing(1.25, 1.5),
  minHeight: 48,
  borderColor: theme.palette.divider,
}))

export function StreamWidgetLayoutActions(props: StreamWidgetLayoutActionsProps) {
  return (
    <Stack spacing={1}>
      <StepRow
        type="button"
        fullWidth
        variant="outlined"
        startIcon={<WidgetSettingsPaletteIcon />}
        onClick={props.onOpenSettings}
      >
        {props.settingsLabel}
      </StepRow>
      <StepRow
        type="button"
        fullWidth
        variant="outlined"
        startIcon={<ContentCopyIcon fontSize="small" aria-hidden />}
        disabled={!props.obsOverlayUrl}
        onClick={() => void props.onCopyObsLink()}
      >
        {props.obsLinkLabel}
      </StepRow>
      <StepRow
        fullWidth
        variant="outlined"
        disabled={!props.overlayHref}
        startIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
        {...(props.overlayHref
          ? {
              component: Link,
              to: props.overlayHref,
              target: '_blank',
              rel: 'noopener noreferrer',
            }
          : { type: 'button' })}
      >
        {props.openOverlayLabel}
      </StepRow>
    </Stack>
  )
}
