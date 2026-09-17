import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import type { LucideIcon } from 'lucide-react'
import { IconTile, type IconTileVariant } from '@/components/IconTile'

type SectionHeaderProps = {
  title: string
  description?: string
  icon: LucideIcon
  iconVariant?: IconTileVariant
  action?: React.ReactNode
  titleComponent?: React.ElementType
  sx?: SxProps<Theme>
}

export function SectionHeader({
  title,
  description,
  icon,
  iconVariant = 'primary',
  action,
  titleComponent = 'h2',
  sx,
}: SectionHeaderProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        mb: 3,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        ...sx,
      }}
    >
      <Stack direction="row" spacing={1.5}>
        <IconTile icon={icon} variant={iconVariant} />
        <Stack>
          <Typography
            variant="subtitle1"
            component={titleComponent}
            sx={{
              fontWeight: 700,
              fontSize: '1.0625rem',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                display: 'block',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
      {action ?? null}
    </Stack>
  )
}
