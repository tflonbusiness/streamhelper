import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import {
  filterIsoCurrencies,
  ISO_CURRENCIES,
  type IsoCurrency,
} from '@/lib/iso-currencies'

type BonusBuyCurrencyFieldProps = {
  value: string
  onChange: (currencyCode: string) => void
  error?: boolean
  helperText?: string
  id?: string
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const SymbolBadge = styled(Typography)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 28,
  fontWeight: 700,
  color: theme.palette.text.primary,
}))

function findCurrency(code: string): IsoCurrency | null {
  const upper = code.trim().toUpperCase()
  return ISO_CURRENCIES.find((entry) => entry.code === upper) ?? null
}

function formatCurrencyLabel(option: IsoCurrency): string {
  return `${option.symbol} ${option.code}`
}

export function BonusBuyCurrencyField(props: BonusBuyCurrencyFieldProps) {
  const { t } = useTranslation()
  const selected = findCurrency(props.value)

  return (
    <Autocomplete
      id={props.id}
      options={ISO_CURRENCIES}
      value={selected}
      onChange={(_event, option) => {
        props.onChange(option?.code ?? '')
      }}
      isOptionEqualToValue={(left, right) => left.code === right.code}
      getOptionLabel={formatCurrencyLabel}
      filterOptions={(options, state) =>
        filterIsoCurrencies(options, state.inputValue)
      }
      renderOption={(optionProps, option) => (
        <Box component="li" {...optionProps} key={option.code}>
          <SymbolBadge variant="body2" sx={{ mr: 1.5 }}>
            {option.symbol}
          </SymbolBadge>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {option.code}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label={t('common.currency')}
          size="small"
          error={props.error}
          helperText={props.helperText}
          fullWidth
        />
      )}
    />
  )
}
