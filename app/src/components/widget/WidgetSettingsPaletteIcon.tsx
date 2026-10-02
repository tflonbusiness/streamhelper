import PaletteIcon from '@mui/icons-material/Palette'
import DialogTitle, { type DialogTitleProps } from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'

export function WidgetSettingsPaletteIcon() {
  return <PaletteIcon fontSize="small" aria-hidden />
}

export function WidgetSettingsDialogTitle(props: DialogTitleProps) {
  const { children, ...rest } = props
  return (
    <DialogTitle {...rest}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <WidgetSettingsPaletteIcon />
        {children}
      </Stack>
    </DialogTitle>
  )
}
