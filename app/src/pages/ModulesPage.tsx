import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { Gamepad2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { PageHeader, SectionHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { MOCK_GAMES } from '@/lib/games-mock'
import {
  getEnabledModuleIds,
  MODULE_CATALOG,
  setModuleEnabled,
} from '@/lib/modules'
import { alpha, useTheme } from '@mui/material/styles'
import { cardSx } from '@/theme/colors'

export function ModulesPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const accountId = user?.accountId
  const [enabledIds, setEnabledIds] = useState<string[]>([])

  useEffect(() => {
    if (accountId) {
      setEnabledIds(getEnabledModuleIds(accountId))
    }
  }, [accountId])

  function handleToggle(moduleId: string, enabled: boolean) {
    if (!accountId) {
      return
    }
    setEnabledIds(setModuleEnabled(accountId, moduleId, enabled))
  }

  const gamesEnabled = enabledIds.includes('casino-stream-games')
  const enabledCount = enabledIds.length

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Modules"
        description="Tools for your team's streamers"
        icon={Gamepad2}
        iconVariant="primary"
      />

      {enabledCount > 0 ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1.5,
            borderRadius: 1,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.2),
            bgcolor: alpha(theme.palette.primary.main, 0.06),
            fontSize: '0.875rem',
          }}
        >
          <Sparkles size={16} color={theme.palette.primary.light} aria-hidden />
          <Typography variant="body2">
            <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
              {enabledCount}
            </Typography>{' '}
            {enabledCount === 1 ? 'module connected' : 'modules connected'}
          </Typography>
        </Box>
      ) : null}

      <Grid container spacing={2}>
        {MODULE_CATALOG.map((module) => {
          const hasToggle = module.hasToggle !== false
          const isEnabled = enabledIds.includes(module.id)
          const isAvailable = module.status === 'available'
          const switchId = `module-${module.id}`
          const isConnected = hasToggle && isEnabled && isAvailable

          return (
            <Grid key={module.id} size={{ xs: 12, md: 6 }}>
              <Card
                elevation={0}
                sx={{
                  ...cardSx,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  ...(isConnected
                    ? {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                      }
                    : {}),
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
                          label={
                            isAvailable
                              ? hasToggle && isEnabled
                                ? 'Connected'
                                : 'Available'
                              : 'Soon'
                          }
                          size="small"
                          sx={
                            isConnected
                              ? {
                                  bgcolor: theme.palette.primary.main,
                                  color: theme.palette.primary.contrastText,
                                  fontWeight: 600,
                                }
                              : {
                                  bgcolor: alpha(theme.palette.text.primary, 0.08),
                                }
                          }
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
                      justifyContent: hasToggle ? 'space-between' : 'flex-end',
                      gap: 2,
                    }}
                  >
                    {isAvailable ? (
                      hasToggle ? (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {isEnabled ? 'Connected' : 'Disabled'}
                          </Typography>
                          <Switch
                            id={switchId}
                            checked={isEnabled}
                            onChange={(_, checked) =>
                              handleToggle(module.id, checked)
                            }
                            slotProps={{
                              input: {
                                'aria-label': `${isEnabled ? 'Disable' : 'Enable'} ${module.name}`,
                              },
                            }}
                          />
                        </>
                      ) : module.widgetRoute ? (
                        <Button
                          component={Link}
                          to={module.widgetRoute}
                          variant="contained"
                        >
                          Open
                        </Button>
                      ) : null
                    ) : (
                      <Chip
                        label="Coming soon"
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.text.primary, 0.08) }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        Settings are saved locally until the server is connected
      </Typography>

      {gamesEnabled ? (
        <Stack spacing={1.5} component="section">
          <SectionHeader
            title="Games"
            description="Available chat games for your stream"
          />
          <Grid container spacing={1.5}>
            {MOCK_GAMES.map((game) => (
              <Grid key={game.id} size={{ xs: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    ...cardSx,
                    transition: 'border-color 0.2s, background-color 0.2s',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      minHeight: 112,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      textAlign: 'center',
                      p: 2,
                      '&:last-child': { pb: 2 },
                    }}
                  >
                    <IconTile
                      icon={game.icon}
                      variant={game.iconVariant}
                      size="lg"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {game.name}
                    </Typography>
                    <Chip
                      label={game.tag}
                      size="small"
                      sx={{
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                        fontSize: '0.625rem',
                        height: 20,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Typography variant="caption" color="text.secondary">
            Game launching will be available later
          </Typography>
        </Stack>
      ) : null}
    </Stack>
  )
}
