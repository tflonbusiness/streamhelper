import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import { useRef } from 'react'
import { datetimeLocalFieldSx } from '@/theme/colors'

const datetimeLocalTextFieldSx = {
  ...datetimeLocalFieldSx,
  '& input[type="datetime-local"]::-webkit-calendar-picker-indicator': {
    display: 'none',
    WebkitAppearance: 'none',
    appearance: 'none',
  },
  '& input[type="datetime-local"]::-webkit-inner-spin-button': {
    display: 'none',
  },
}

type DatetimeLocalTextFieldProps = Omit<TextFieldProps, 'type'>

export function DatetimeLocalTextField({
  slotProps,
  sx,
  ...rest
}: DatetimeLocalTextFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function openPicker() {
    const input = inputRef.current
    if (!input) {
      return
    }
    if ('showPicker' in input && typeof input.showPicker === 'function') {
      try {
        void input.showPicker()
        return
      } catch {
        // Some browsers throw if not focused; fall through.
      }
    }
    input.focus()
    input.click()
  }

  const inputSlot = slotProps?.input
  const inputSlotObject =
    inputSlot && typeof inputSlot === 'object' && !Array.isArray(inputSlot)
      ? inputSlot
      : {}

  return (
    <TextField
      {...rest}
      type="datetime-local"
      inputRef={inputRef}
      sx={[datetimeLocalTextFieldSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
      slotProps={{
        ...slotProps,
        input: {
          ...inputSlotObject,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                size="small"
                edge="end"
                onClick={openPicker}
                aria-label={typeof rest.label === 'string' ? rest.label : undefined}
              >
                <CalendarMonthIcon fontSize="small" color="action" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
