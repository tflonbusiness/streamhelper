import { Gamepad2, Layers, Users } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { BrandHeader } from '@/components/BrandHeader'
import { IconTile } from '@/components/IconTile'
import { KickLoginButton } from '@/components/KickLoginButton'
import { PageShell } from '@/components/PageShell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const features = [
  {
    icon: Gamepad2,
    variant: 'primary' as const,
    title: 'Chat games',
    description: 'Interactive games for Kick chat',
  },
  {
    icon: Users,
    variant: 'info' as const,
    title: 'Team access',
    description: 'Manage admins and permissions',
  },
  {
    icon: Layers,
    variant: 'purple' as const,
    title: 'OBS overlays',
    description: 'Browser sources for your stream',
  },
]

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const joinError = searchParams.get('join_error')
  const authError = searchParams.get('auth_error')

  return (
    <PageShell>
      <Card>
        <CardHeader>
          <BrandHeader description="Streamer dashboard" />
        </CardHeader>
        <CardContent className="space-y-6">
          {joinError ? (
            <Alert variant="destructive">
              <AlertDescription>
                This link is invalid or has been revoked.
              </AlertDescription>
            </Alert>
          ) : null}

          {authError ? (
            <Alert variant="destructive">
              <AlertDescription>
                {authError === 'state'
                  ? 'Your sign-in session expired. Click "Sign in with Kick" again.'
                  : 'Could not sign in with Kick. Check your app settings and try again.'}
              </AlertDescription>
            </Alert>
          ) : null}

          <KickLoginButton />

          <div className="grid gap-3 border-t pt-6 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center gap-2 rounded-lg border bg-background/50 p-3 text-center"
              >
                <IconTile icon={feature.icon} variant={feature.variant} size="sm" />
                <p className="text-sm font-medium">{feature.title}</p>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}
