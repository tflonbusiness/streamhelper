import Box from '@mui/material/Box'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Tooltip from '@mui/material/Tooltip'
import type { SelectChangeEvent } from '@mui/material/Select'
import TranslateIcon from '@mui/icons-material/Translate'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_LOCALES, LOCALE_FLAG, type AppLocale } from '@/i18n/app-locale'
import { useLocale } from '@/context/LocaleProvider'

function LocaleOption({ code, label }: { code: AppLocale; label: string }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        minWidth: 0,
      }}
    >
      <Box
        component="span"
        aria-hidden
        sx={{
          fontSize: '1.125rem',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        {LOCALE_FLAG[code]}
      </Box>
      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </Box>
    </Box>
  )
}

type LanguageSwitcherProps = {
  /** Narrow width (e.g. login card); still uses a select. */
  compact?: boolean
  /** Icon + menu for collapsed sidebar rail. */
  iconOnly?: boolean
}

export function LanguageSwitcher({ compact, iconOnly }: LanguageSwitcherProps) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocale()
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)

  function handleChange(event: SelectChangeEvent) {
    setLocale(event.target.value as AppLocale)
  }

  function handleMenuPick(next: AppLocale) {
    setLocale(next)
    setMenuAnchor(null)
  }

  const label = (code: AppLocale) =>
    code === 'en' ? t('common.languageEn') : t('common.languageRu')

  if (iconOnly) {
    return (
      <>
        <Tooltip title={t('common.language')} placement="right">
          <IconButton
            size="small"
            aria-label={t('common.language')}
            aria-haspopup="listbox"
            aria-expanded={Boolean(menuAnchor)}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
          >
            <TranslateIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          {APP_LOCALES.map((code) => (
            <MenuItem
              key={code}
              selected={code === locale}
              onClick={() => handleMenuPick(code)}
            >
              <LocaleOption code={code} label={label(code)} />
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  }

  return (
    <FormControl size="small" fullWidth={!compact}>
      <Select
        value={locale}
        onChange={handleChange}
        aria-label={t('common.language')}
        renderValue={(value) => (
          <LocaleOption code={value as AppLocale} label={label(value as AppLocale)} />
        )}
        sx={{
          fontSize: '0.8125rem',
          '& .MuiSelect-select': {
            py: compact ? 0.75 : 1,
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        {APP_LOCALES.map((code) => (
          <MenuItem key={code} value={code}>
            <LocaleOption code={code} label={label(code)} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
