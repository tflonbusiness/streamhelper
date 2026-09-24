import { Button, Card, CardContent, Chip, Stack } from '@mui/material'
import LinkIcon from '@mui/icons-material/Link'
import MonitorIcon from '@mui/icons-material/Monitor'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SettingsIcon from '@mui/icons-material/Settings'
import { styled, useTheme } from '@mui/material/styles'
import { SectionHeader } from '@/components/SectionHeader'
import { mutedChipSx } from '@/theme/colors'

type ChatRollStreamWidgetSectionProps = {
  chatRollId: number
}

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
}))

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
}))

const StyledActionsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  alignItems: 'flex-start',
}))

const ActionButton = styled(Button)(() => ({
  minHeight: 36.5,
}))

const HeaderActionStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
}))

export const ChatRollStreamWidgetSection = (
  _props: ChatRollStreamWidgetSectionProps,
) => {
  const theme = useTheme()

  return (
    <StyledCard elevation={0}>
      <StyledCardContent>
        <SectionHeader
          title="Stream Widget"
          description={`OBS overlay settings and links for chat roll.`}
          icon={MonitorIcon}
          iconVariant="info"
          action={
            <HeaderActionStack>
              <Chip label="Coming soon" size="small" sx={mutedChipSx(theme)} />
              <Button
                type="button"
                variant="outlined"
                size="small"
                disabled
                startIcon={<SettingsIcon fontSize="small" aria-hidden />}
              >
                Widget styles
              </Button>
            </HeaderActionStack>
          }
        />
        <StyledActionsStack direction={{ xs: 'column', sm: 'row' }}>
          <ActionButton
            type="button"
            variant="outlined"
            disabled
            startIcon={<OpenInNewIcon fontSize="small" aria-hidden />}
          >
            Open overlay
          </ActionButton>
          <ActionButton
            type="button"
            variant="outlined"
            disabled
            startIcon={<LinkIcon fontSize="small" aria-hidden />}
          >
            OBS link
          </ActionButton>
        </StyledActionsStack>
      </StyledCardContent>
    </StyledCard>
  )
}
