import { Box, InputAdornment, TextField } from '@mui/material'
import { inputFieldSx } from '@/theme/colors'

function expandShortHex(hex: string): string {
  const trimmed = hex.trim()
  const shortMatch = /^#([0-9A-Fa-f]{3})$/.exec(trimmed)
  if (shortMatch) {
    const [r, g, b] = shortMatch[1].split('')
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase()
  }
  return '#000000'
}

function swatchColor(hex: string): string {
  const trimmed = hex.trim()
  if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmed)) {
    return expandShortHex(trimmed)
  }
  return '#2A2A35'
}

type HexColorFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
}

export function HexColorField({ label, value, onChange }: HexColorFieldProps) {
  const pickerValue = expandShortHex(value)
  const displaySwatch = swatchColor(value)

  return (
    <TextField
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
      sx={inputFieldSx}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Box
                component="label"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  bgcolor: displaySwatch,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <Box
                  component="input"
                  type="color"
                  value={pickerValue}
                  onChange={(event) => onChange(event.target.value.toUpperCase())}
                  aria-label={`${label} color picker`}
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer',
                    border: 'none',
                    p: 0,
                  }}
                />
              </Box>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
