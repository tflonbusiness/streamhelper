import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'
import { useMemo } from 'react'
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
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
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

  return (
    <Autocomplete
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
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label={props.label ?? t('common.slotName')}
          required={props.required}
          size="small"
          error={props.error}
          helperText={catalogHelperText}
          autoFocus={props.autoFocus}
          fullWidth
        />
      )}
    />
  )
}
