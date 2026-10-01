import {
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { useTranslation } from 'react-i18next'
import { inputFieldSx } from '@/theme/colors'

type SubscriptionAdminSearchToolbarProps = {
  query: string
  submittedQuery: string
  total: number
  searching: boolean
  canSubmit: boolean
  isFiltered: boolean
  onQueryChange: (value: string) => void
  onSubmit: () => void
}

export function SubscriptionAdminSearchToolbar({
  query,
  submittedQuery,
  total,
  searching,
  canSubmit,
  isFiltered,
  onQueryChange,
  onSubmit,
}: SubscriptionAdminSearchToolbarProps) {
  const { t } = useTranslation()

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'flex-end' } }}
        useFlexGap
      >
        <TextField
          label={t('subscriptionAdmin.searchLabel')}
          placeholder={t('subscriptionAdmin.searchPlaceholder')}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              onSubmit()
            }
          }}
          fullWidth
          size="small"
          sx={{ ...inputFieldSx, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={!canSubmit || searching}
          sx={{ flexShrink: 0, minWidth: { sm: 132 }, height: 40 }}
        >
          {searching ? t('common.loading') : t('subscriptionAdmin.searchCta')}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {isFiltered
          ? t('subscriptionAdmin.resultsSummary', {
              count: total,
              query: submittedQuery,
            })
          : t('subscriptionAdmin.listAllSummary', { count: total })}
      </Typography>
    </Stack>
  )
}
