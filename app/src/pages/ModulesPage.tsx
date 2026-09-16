import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import { Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { PageHeader } from '@/components/PageHeader'
import { MODULE_CATALOG } from '@/lib/modules'
import { cardSx } from '@/theme/colors'

export function ModulesPage() {
  const theme = useTheme()

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Modules"
        description="Tools for your team's streamers"
        icon={Gamepad2}
        iconVariant="primary"
      />

      <Grid container spacing={2}>
        {MODULE_CATALOG.map((module) => {
          const isAvailable = module.status === 'available'

          return (
            <Grid key={module.id} size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  ...cardSx,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(!isAvailable ? { opacity: 0.8 } : {}),
                }}
              >
                <CardContent
                  sx={{
                    p: 2.5,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    '&:last-child': { pb: 2.5 },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                    <IconTile
                      icon={module.icon}
                      variant={module.iconVariant}
                    />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 0.5, flexWrap: 'wrap', alignItems: 'center' }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {module.name}
                        </Typography>
                        <Chip
                          label={isAvailable ? 'Available' : 'Soon'}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.text.primary, 0.08),
                          }}
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {module.description}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      mt: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 2,
                    }}
                  >
                    {isAvailable && module.widgetRoute ? (
                      <Button
                        component={Link}
                        to={module.widgetRoute}
                        variant="contained"
                      >
                        Open
                      </Button>
                    ) : (
                      <Button variant="contained" disabled>
                        Coming soon
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Stack>
  )
}
