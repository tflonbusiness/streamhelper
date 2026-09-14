import { ExternalLink, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getTelegramSupportUrl,
  getTelegramSupportUsername,
} from '@/lib/subscription-plan'

export function TelegramActivationNotice() {
  const username = getTelegramSupportUsername()
  const telegramUrl = getTelegramSupportUrl()

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Send className="size-5" aria-hidden />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base">Subscription activation</CardTitle>
            <CardDescription>
              Contact us on Telegram to upgrade to a paid plan
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Message our support team — we will help you choose a plan and activate
          a subscription for your team.
        </p>
        <Button variant="default" className="w-full sm:w-auto" asChild>
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
            Message @{username}
            <ExternalLink className="ml-2 size-4" aria-hidden />
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
