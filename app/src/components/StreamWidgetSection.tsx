import type { ReactNode } from 'react'
import { Card, CardContent } from '@mui/material'
import MonitorIcon from '@mui/icons-material/Monitor'
import { SectionHeader } from '@/components/SectionHeader'
import type { TileIcon } from '@/components/IconTile'
import { StreamWidgetLayoutActions } from '@/components/StreamWidgetLayoutActions'
import { cardSx } from '@/theme/colors'

export type StreamWidgetSectionProps = {
  title: string
  description: string
  settingsLabel: string
  onOpenSettings: () => void
  overlayHref: string | null
  openOverlayLabel: string
  obsLinkLabel: string
  obsOverlayUrl: string
  onCopyObsLink: () => void
  headerIcon?: TileIcon
}

export function StreamWidgetSection(props: StreamWidgetSectionProps) {
  const HeaderIcon = props.headerIcon ?? MonitorIcon

  return (
    <Card elevation={0} sx={{ ...cardSx, boxShadow: 'none', width: '100%' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <SectionHeader
          title={props.title}
          description={props.description}
          icon={HeaderIcon}
          iconVariant="info"
          showDivider={false}
        />
        <StreamWidgetLayoutActions {...props} />
      </CardContent>
    </Card>
  )
}
