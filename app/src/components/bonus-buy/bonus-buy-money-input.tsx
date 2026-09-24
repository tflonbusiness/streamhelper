import InputAdornment from '@mui/material/InputAdornment'
import Typography from '@mui/material/Typography'
import {
  decimalMoneyInputSlotProps,
  getBonusBuyCurrencySymbol,
} from '@/lib/bonus-buy-format'

export function buildBonusBuyMoneyInputSlotProps(currencyCode?: string | null) {
  const symbol = getBonusBuyCurrencySymbol(currencyCode)

  return {
    htmlInput: decimalMoneyInputSlotProps.htmlInput,
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <Typography
            variant="body2"
            color="text.secondary"
            aria-hidden
            sx={{ fontWeight: 600 }}
          >
            {symbol}
          </Typography>
        </InputAdornment>
      ),
    },
  }
}
