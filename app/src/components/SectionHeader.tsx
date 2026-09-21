import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { styled } from '@mui/material/styles'
import { IconTile, type IconTileVariant, type TileIcon } from '@/components/IconTile'

export const sectionTableIcon: TileIcon = TableRowsIcon

export const SectionDivider = styled(Divider)(({ theme }) => ({
  marginLeft: theme.spacing(-3),
  marginRight: theme.spacing(-3),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

const StyledHeaderRow = styled(Stack, {
  shouldForwardProp: (prop) => prop !== 'showDivider',
})<{ showDivider?: boolean }>(({ theme, showDivider }) => ({
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: showDivider ? 0 : theme.spacing(3),
}))

const StyledHeaderMain = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1.5),
}))

const StyledHeaderText = styled(Stack)({})

const StyledTitle = styled(Typography)<TypographyProps>({
  fontWeight: 700,
  fontSize: '1.0625rem',
  lineHeight: 1.25,
  letterSpacing: '-0.01em',
})

const StyledDescription = styled(Typography)(({ theme }) => ({
  fontSize: '0.8125rem',
  lineHeight: 1.5,
  display: 'block',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  color: theme.palette.text.secondary,
}))

type SectionHeaderProps = {
  title: string
  description?: string
  icon: TileIcon
  iconVariant?: IconTileVariant
  action?: React.ReactNode
  titleComponent?: React.ElementType
  showDivider?: boolean
}

export function SectionHeader({
  title,
  description,
  icon,
  iconVariant = 'primary',
  action,
  titleComponent = 'h2',
  showDivider = true,
}: SectionHeaderProps) {
  return (
    <>
      <StyledHeaderRow direction="row" spacing={2} showDivider={showDivider}>
        <StyledHeaderMain>
          <IconTile icon={icon} variant={iconVariant} />
          <StyledHeaderText>
            <StyledTitle variant="subtitle1" component={titleComponent}>
              {title}
            </StyledTitle>
            {description ? (
              <StyledDescription variant="caption">{description}</StyledDescription>
            ) : null}
          </StyledHeaderText>
        </StyledHeaderMain>
        {action ?? null}
      </StyledHeaderRow>
      {showDivider ? <SectionDivider /> : null}
    </>
  )
}
