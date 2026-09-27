import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'
import { useTranslation } from 'react-i18next'
import { APP_LOCALES, type AppLocale } from '@/i18n/app-locale'
import { useLocale } from '@/context/LocaleProvider'

type LanguageSwitcherProps = {
  compact?: boolean
}

export function LanguageSwitcher({ compact }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()

  function handleChange(event: SelectChangeEvent) {
    setLocale(event.target.value as AppLocale)
  }

  const label = (code: AppLocale) =>
    code === 'en' ? t('common.languageEn') : t('common.languageRu')

  return (
    <FormControl size="small" fullWidth={!compact}>
      <Select
        value={locale}
        onChange={handleChange}
        aria-label={t('common.language')}
        sx={{
          fontSize: '0.8125rem',
          '& .MuiSelect-select': {
            py: compact ? 0.75 : 1,
          },
        }}
      >
        {APP_LOCALES.map((code) => (
          <MenuItem key={code} value={code}>
            {label(code)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
