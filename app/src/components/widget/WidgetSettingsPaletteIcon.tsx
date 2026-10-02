import PaletteIcon from '@mui/icons-material/Palette'
import DialogTitle, { type DialogTitleProps } from '@mui/material/DialogTitle'

export function WidgetSettingsPaletteIcon() {
  return <PaletteIcon fontSize="small" aria-hidden />
}

export function WidgetSettingsDialogTitle(props: DialogTitleProps) {
  return <DialogTitle {...props} />
}
