import { styled } from '@mui/material/styles'

export const PrizeSpinSessionColorSwatch = styled('span', {
  shouldForwardProp: (prop) => prop !== 'swatchColor',
})<{ swatchColor: string | null }>(({ theme, swatchColor }) => ({
  display: 'inline-block',
  width: 20,
  height: 20,
  borderRadius: theme.spacing(0.5),
  backgroundColor: swatchColor ?? theme.palette.action.disabledBackground,
  border: '1px solid',
  borderColor: theme.palette.divider,
  flexShrink: 0,
}))
