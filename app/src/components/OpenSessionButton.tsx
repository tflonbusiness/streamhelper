import { Button } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type OpenSessionButtonProps = {
  to: string
  'aria-label'?: string
  size?: 'small' | 'medium'
  fullWidth?: boolean
  variant?: 'contained' | 'outlined'
}

export function OpenSessionButton({
  to,
  'aria-label': ariaLabel,
  size = 'small',
  fullWidth,
  variant = 'contained',
}: OpenSessionButtonProps) {
  const { t } = useTranslation()

  return (
    <Button
      component={Link}
      to={to}
      variant={variant}
      color="primary"
      size={size}
      fullWidth={fullWidth}
      aria-label={ariaLabel ?? t('common.openSession')}
      endIcon={<ArrowForwardIcon fontSize="small" aria-hidden />}
    >
      {t('common.openSession')}
    </Button>
  )
}
