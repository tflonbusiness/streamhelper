import { Gamepad2, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconTile } from '@/components/IconTile'
import { PageHeader, SectionHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/context/AuthContext'
import { MOCK_GAMES } from '@/lib/games-mock'
import {
  getEnabledModuleIds,
  MODULE_CATALOG,
  setModuleEnabled,
} from '@/lib/modules'

export function ModulesPage() {
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
    <div className="space-y-8">
      <PageHeader
        title="Modules"
        description="Tools for your team's streamers"
        icon={Gamepad2}
        iconVariant="primary"
      />

      {enabledCount > 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
          <Sparkles className="size-4 text-primary" aria-hidden />
          <span>
            <strong className="text-foreground">{enabledCount}</strong>{' '}
            {enabledCount === 1 ? 'module connected' : 'modules connected'}
          </span>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {MODULE_CATALOG.map((module) => {
          const hasToggle = module.hasToggle !== false
          const isEnabled = enabledIds.includes(module.id)
          const isAvailable = module.status === 'available'
          const switchId = `module-${module.id}`

          return (
            <Card
              key={module.id}
              className={
                hasToggle && isEnabled && isAvailable
                  ? 'border-primary/30 bg-primary/5'
                  : !isAvailable
                    ? 'opacity-80'
                    : undefined
              }
            >
              <CardHeader>
                <div className="flex gap-3">
                  <IconTile
                    icon={module.icon}
                    variant={module.iconVariant}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base">{module.name}</CardTitle>
                      <Badge
                        variant={
                          hasToggle && isEnabled && isAvailable
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {isAvailable
                          ? hasToggle && isEnabled
                            ? 'Connected'
                            : 'Available'
                          : 'Soon'}
                      </Badge>
                    </div>
                    <CardDescription>{module.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter
                className={
                  hasToggle ? 'justify-between gap-4' : 'justify-end gap-4'
                }
              >
                {isAvailable ? (
                  hasToggle ? (
                    <>
                      <Label htmlFor={switchId} className="text-sm font-normal">
                        {isEnabled ? 'Connected' : 'Disabled'}
                      </Label>
                      <Switch
                        id={switchId}
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggle(module.id, checked)
                        }
                        aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${module.name}`}
                      />
                    </>
                  ) : module.widgetRoute ? (
                    <Button asChild>
                      <Link to={module.widgetRoute}>Open</Link>
                    </Button>
                  ) : null
                ) : (
                  <Badge variant="secondary">Coming soon</Badge>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <CardDescription className="block text-xs">
        Settings are saved locally until the server is connected
      </CardDescription>

      {gamesEnabled ? (
        <section className="space-y-3">
          <SectionHeader
            title="Games"
            description="Available chat games for your stream"
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {MOCK_GAMES.map((game) => (
              <Card
                key={game.id}
                className="group transition-colors hover:border-primary/30 hover:bg-primary/5"
              >
                <CardContent className="flex min-h-28 flex-col items-center justify-center gap-2 p-4 text-center">
                  <IconTile icon={game.icon} variant={game.iconVariant} size="lg" />
                  <p className="text-sm font-medium leading-tight">{game.name}</p>
                  <Badge variant="secondary" className="text-[10px]">
                    {game.tag}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          <CardDescription className="text-xs">
            Game launching will be available later
          </CardDescription>
        </section>
      ) : null}
    </div>
  )
}
