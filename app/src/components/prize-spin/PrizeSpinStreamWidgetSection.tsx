import { Button, Card, CardContent, Stack } from '@mui/material'
import { ExternalLink, Link2, Monitor, Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PrizeSpinWidgetSettingsDialog } from '@/components/prize-spin/PrizeSpinWidgetSettingsDialog'
import { SectionHeader } from '@/components/SectionHeader'
import { useNotification } from '@/context/NotificationContext'
import {
  buildPrizeSpinObsOverlayUrl,
  buildPrizeSpinOverlayPath,
} from '@/lib/prize-spin-overlay-url'
import { cardSx } from '@/theme/colors'

type PrizeSpinStreamWidgetSectionProps = {
  accountId?: number
  ucid?: string
}

export function PrizeSpinStreamWidgetSection({
  accountId,
  ucid,
}: PrizeSpinStreamWidgetSectionProps) {
  const { showSuccess, showError } = useNotification()
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false)

  const overlayHref = ucid ? buildPrizeSpinOverlayPath(ucid) : null
  const obsOverlayUrl = ucid ? buildPrizeSpinObsOverlayUrl(ucid) : null

  async function handleCopyObsLink() {
    if (!obsOverlayUrl) {
      return
    }

    try {
      await navigator.clipboard.writeText(obsOverlayUrl)
      showSuccess('OBS link copied.')
    } catch {
      showError('Could not copy OBS link.')
    }
  }

  return (
    <>
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <SectionHeader
            title="Stream Widget"
            description="OBS overlay settings and links for your live prize spin session"
            icon={Monitor}
            iconVariant="info"
            action={
              accountId ? (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<Settings2 size={16} aria-hidden />}
                  onClick={() => setWidgetDialogOpen(true)}
                >
                  Widget settings
                </Button>
              ) : null
            }
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {overlayHref ? (
              <Button
                component={Link}
                to={overlayHref}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<ExternalLink size={16} aria-hidden />}
              >
                Open overlay
              </Button>
            ) : (
              <Button
                type="button"
                variant="outlined"
                startIcon={<ExternalLink size={16} aria-hidden />}
                disabled
              >
                Open overlay
              </Button>
            )}
            <Button
              type="button"
              variant="outlined"
              startIcon={<Link2 size={16} aria-hidden />}
              disabled={!obsOverlayUrl}
              onClick={() => void handleCopyObsLink()}
            >
              OBS link
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {accountId !== undefined ? (
        <PrizeSpinWidgetSettingsDialog
          accountId={accountId}
          open={widgetDialogOpen}
          onClose={() => setWidgetDialogOpen(false)}
        />
      ) : null}
    </>
  )
}
