import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { useMemo, type KeyboardEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import { searchSlotNames } from '@/lib/slot-name-search'
import { useSlotNameIndex } from '@/queries/use-slot-name-catalog'

type BonusBuySlotNameFieldProps = {
  value: string
  onChange: (name: string) => void
  error?: boolean
  helperText?: string
  id?: string
  label?: string
  required?: boolean
  disabled?: boolean
  autoFocus?: boolean
  hideLabel?: boolean
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>
  inputAriaLabel?: string
  compact?: boolean
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const CompactStyledTextField = styled(StyledTextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    minHeight: 32,
    paddingTop: 0,
    paddingBottom: 0,
  },
  '& .MuiOutlinedInput-input': {
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    fontSize: '0.875rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  '& .MuiAutocomplete-endAdornment': {
    right: 2,
    '& .MuiButtonBase-root': {
      padding: 2,
    },
    '& .MuiSvgIcon-root': {
      fontSize: 16,
    },
  },
}))

export function BonusBuySlotNameField(props: BonusBuySlotNameFieldProps) {
  const { t } = useTranslation()
  const { index, isLoading, isError } = useSlotNameIndex()

  const options = useMemo(() => {
    if (!index) {
      return []
    }
    return searchSlotNames(index, props.value)
  }, [index, props.value])

  const catalogHelperText =
    isError && !props.helperText
      ? t('bonusBuy.slotSearchUnavailable')
      : props.helperText

  const helperText =
    props.compact && !props.error ? undefined : catalogHelperText

  const InputComponent = props.compact ? CompactStyledTextField : StyledTextField

  return (
    <Autocomplete
      sx={
        props.compact
          ? { display: 'block', width: '100%', minWidth: '100%' }
          : undefined
      }
      id={props.id}
      freeSolo
      disableClearable={false}
      options={options}
      value={props.value}
      inputValue={props.value}
      onInputChange={(_event, nextValue) => {
        props.onChange(nextValue)
      }}
      onChange={(_event, nextValue) => {
        if (typeof nextValue === 'string') {
          props.onChange(nextValue)
        }
      }}
      filterOptions={(filtered) => filtered}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(left, right) => left === right}
      loading={isLoading}
      disabled={props.disabled}
      onKeyDown={props.onKeyDown}
      renderInput={(params) => (
        <InputComponent
          {...params}
          slotProps={{
            ...params.slotProps,
            htmlInput: {
              ...params.slotProps.htmlInput,
              'aria-label': props.inputAriaLabel,
            },
          }}
          label={
            props.hideLabel
              ? undefined
              : (props.label ?? t('common.slotName'))
          }
          required={props.required}
          size="small"
          error={props.error}
          helperText={helperText}
          autoFocus={props.autoFocus}
          fullWidth
        />
      )}
    />
  )
}
