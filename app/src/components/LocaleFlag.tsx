import Box from '@mui/material/Box'
import { LOCALE_FLAG_SRC } from '@/assets/locale-flags'
import type { AppLocale } from '@/i18n/app-locale'

type LocaleFlagProps = {
  locale: AppLocale
}

export function LocaleFlag({ locale }: LocaleFlagProps) {
  return (
    <Box
      component="img"
      src={LOCALE_FLAG_SRC[locale]}
      alt=""
      aria-hidden
      sx={{
        display: 'block',
        flexShrink: 0,
        width: 20,
        height: 15,
        objectFit: 'cover',
        borderRadius: '2px',
        boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    />
  )
}
