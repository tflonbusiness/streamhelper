import { Loader2 } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { Card, CardContent } from '@/components/ui/card'

export function LoadingScreen() {
  return (
    <PageShell>
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <p>Loading...</p>
        </CardContent>
      </Card>
    </PageShell>
  )
}
