import type { SxProps, Theme } from '@mui/material/styles'

/** Display face for product name lockups (sidebar, login, headers). */
export const brandTitleFontFamily =
  '"Plus Jakarta Sans", Inter, system-ui, sans-serif'

export const brandTitleSx: SxProps<Theme> = {
  fontFamily: brandTitleFontFamily,
  fontWeight: 700,
  letterSpacing: '-0.03em',
  lineHeight: 1.15,
}
