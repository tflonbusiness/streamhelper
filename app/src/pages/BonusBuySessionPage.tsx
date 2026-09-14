import {
  ArrowLeft,
  CircleStop,
  ExternalLink,
  Link2,
  Palette,
  Pencil,
  Plus,
} from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { endBonusBuy, fetchBonusBuy, type BonusBuyRecord } from '@/api/bonus-buy'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuth } from '@/context/AuthContext'
import { MODULE_CATALOG } from '@/lib/modules'
import { cn } from '@/lib/utils'

const bonusBuyModule = MODULE_CATALOG.find((module) => module.id === 'bonus-buy')!

type MockSlot = {
  id: number
  slotName: string
  nickProvider: string
  purchaseAmount: number
  winAmount: number | null
}

type SessionStats = {
  spent: number
  profit: number
  currentBalance: number
  averageX: number
}

function formatUsd(amount: number | string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(typeof amount === 'string' ? Number.parseFloat(amount) : amount)
}

function formatMultiplier(value: number): string {
  if (value === 0) {
    return '0x'
  }

  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}x` : `${rounded.toFixed(1)}x`
}

function computeStats(startBalance: number, slots: MockSlot[]): SessionStats {
  const spent = slots.reduce((sum, slot) => sum + slot.purchaseAmount, 0)
  const totalWin = slots.reduce(
    (sum, slot) => sum + (slot.winAmount ?? 0),
    0,
  )
  const profit = totalWin - spent
  const currentBalance = startBalance - spent + totalWin
  const averageX = spent > 0 ? totalWin / spent : 0

  return { spent, profit, currentBalance, averageX }
}

function StatCard({
  label,
  value,
  valueClassName,
  action,
}: {
  label: string
  value: string
  valueClassName?: string
  action?: React.ReactNode
}) {
  return (
    <Card className="border-border/80 bg-card">
      <CardContent className="space-y-2 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('text-xl font-semibold tabular-nums', valueClassName)}>
            {value}
          </p>
          {action}
        </div>
      </CardContent>
    </Card>
  )
}

export function BonusBuySessionPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [record, setRecord] = useState<BonusBuyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [slots, setSlots] = useState<MockSlot[]>([])
  const [nextSlotId, setNextSlotId] = useState(1)
  const [titleDraft, setTitleDraft] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [startBalanceDraft, setStartBalanceDraft] = useState('')
  const [isEditingStartBalance, setIsEditingStartBalance] = useState(false)
  const [slotName, setSlotName] = useState('')
  const [nickProvider, setNickProvider] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [stubNotice, setStubNotice] = useState<string | null>(null)
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [endError, setEndError] = useState<string | null>(null)

  const loadRecord = useCallback(async () => {
    if (!user?.accountId || !id) {
      return
    }

    const bonusBuyId = Number.parseInt(id, 10)
    if (!Number.isFinite(bonusBuyId)) {
      setError('Invalid bonus buy id')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const row = await fetchBonusBuy(user.accountId, bonusBuyId)
      setRecord(row)
      setTitleDraft(row.title)
      setStartBalanceDraft(row.startBalance)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Could not load bonus buy',
      )
    } finally {
      setLoading(false)
    }
  }, [id, user?.accountId])

  useEffect(() => {
    void loadRecord()
  }, [loadRecord])

  const startBalance = useMemo(() => {
    const parsed = Number.parseFloat(startBalanceDraft)
    return Number.isFinite(parsed) ? parsed : 0
  }, [startBalanceDraft])

  const stats = useMemo(
    () => computeStats(startBalance, slots),
    [startBalance, slots],
  )

  function showStub(message: string) {
    setStubNotice(message)
  }

  function handleTitleSave() {
    const trimmed = titleDraft.trim()
    if (!trimmed) {
      return
    }

    if (record) {
      setRecord({ ...record, title: trimmed })
    }

    setIsEditingTitle(false)
  }

  function handleStartBalanceSave() {
    const parsed = Number.parseFloat(startBalanceDraft)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return
    }

    setStartBalanceDraft(parsed.toFixed(2))
    if (record) {
      setRecord({ ...record, startBalance: parsed.toFixed(2) })
    }

    setIsEditingStartBalance(false)
  }

  function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!record?.isActive) {
      return
    }

    const trimmedSlot = slotName.trim()
    const parsedPurchase = Number.parseFloat(purchaseAmount)

    if (!trimmedSlot) {
      setFormError('Slot name is required')
      return
    }

    if (!Number.isFinite(parsedPurchase) || parsedPurchase <= 0) {
      setFormError('Purchase amount must be greater than zero')
      return
    }

    setSlots((current) => [
      ...current,
      {
        id: nextSlotId,
        slotName: trimmedSlot,
        nickProvider: nickProvider.trim(),
        purchaseAmount: parsedPurchase,
        winAmount: null,
      },
    ])
    setNextSlotId((current) => current + 1)
    setSlotName('')
    setPurchaseAmount('')
  }

  function handleEndDialogChange(open: boolean) {
    setEndDialogOpen(open)
    if (!open) {
      setEndError(null)
    }
  }

  async function handleEndSession() {
    if (!user?.accountId || !record) {
      return
    }

    setIsEnding(true)
    setEndError(null)

    try {
      const updated = await endBonusBuy(user.accountId, record.id)
      setRecord(updated)
      setEndDialogOpen(false)
    } catch (endSessionError) {
      setEndError(
        endSessionError instanceof Error
          ? endSessionError.message
          : 'Could not end bonus buy session',
      )
    } finally {
      setIsEnding(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={bonusBuyModule.name}
          description={bonusBuyModule.description}
          icon={bonusBuyModule.icon}
          iconVariant={bonusBuyModule.iconVariant}
        />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !record) {
    return (
      <div className="space-y-8">
        <PageHeader
          title={bonusBuyModule.name}
          description={bonusBuyModule.description}
          icon={bonusBuyModule.icon}
          iconVariant={bonusBuyModule.iconVariant}
        />
        <StatusAlert tone="error">{error ?? 'Session not found'}</StatusAlert>
        <Button asChild variant="outline">
          <Link to="/bonus-buy">Back to history</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={bonusBuyModule.name}
        description={bonusBuyModule.description}
        icon={bonusBuyModule.icon}
        iconVariant={bonusBuyModule.iconVariant}
      />

      <Card className="border-border/80 bg-card">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="shrink-0">
              <Link to="/bonus-buy" aria-label="Back to history">
                <ArrowLeft className="size-4" aria-hidden />
              </Link>
            </Button>

            <div className="flex min-w-0 items-center gap-2">
              {isEditingTitle ? (
                <Input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      handleTitleSave()
                    }
                    if (event.key === 'Escape') {
                      setTitleDraft(record.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  onBlur={handleTitleSave}
                  className="h-9 max-w-[16rem]"
                  autoFocus
                />
              ) : (
                <h1 className="truncate text-lg font-semibold">
                  {record.title}{' '}
                  <span className="text-muted-foreground">#{record.id}</span>
                </h1>
              )}

              {!record.isActive ? (
                <Badge variant="outline" className="shrink-0 text-muted-foreground">
                  Ended
                </Badge>
              ) : null}

              {!isEditingTitle && record.isActive ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  aria-label="Edit title"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Pencil className="size-3.5" aria-hidden />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {record.isActive ? (
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={() => handleEndDialogChange(true)}
              >
                <CircleStop className="size-4" aria-hidden />
                End bonus buy
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => showStub('Widget style — coming soon')}
            >
              <Palette className="size-4" aria-hidden />
              Widget style
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => showStub('OBS link — coming soon')}
            >
              <Link2 className="size-4" aria-hidden />
              OBS link
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => showStub('Overlay — coming soon')}
            >
              <ExternalLink className="size-4" aria-hidden />
              Overlay
            </Button>
          </div>
        </CardContent>
      </Card>

      {stubNotice ? (
        <StatusAlert tone="info">{stubNotice}</StatusAlert>
      ) : null}

      {!record.isActive ? (
        <StatusAlert tone="warning">
          This bonus buy session has ended.
        </StatusAlert>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Start balance"
          value={formatUsd(startBalance)}
          action={
            isEditingStartBalance ? (
              <Input
                value={startBalanceDraft}
                onChange={(event) => setStartBalanceDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleStartBalanceSave()
                  }
                  if (event.key === 'Escape') {
                    setStartBalanceDraft(record.startBalance)
                    setIsEditingStartBalance(false)
                  }
                }}
                onBlur={handleStartBalanceSave}
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="h-8 w-24 px-2 text-sm"
                autoFocus
              />
            ) : record.isActive ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Edit start balance"
                onClick={() => setIsEditingStartBalance(true)}
              >
                <Pencil className="size-3.5" aria-hidden />
              </Button>
            ) : null
          }
        />
        <StatCard
          label="Current balance"
          value={formatUsd(stats.currentBalance)}
          valueClassName="text-emerald-400"
        />
        <StatCard label="Spent" value={formatUsd(stats.spent)} />
        <StatCard
          label="Profit"
          value={formatUsd(stats.profit)}
          valueClassName={stats.profit >= 0 ? 'text-emerald-400' : undefined}
        />
        <StatCard label="Average X" value={formatMultiplier(stats.averageX)} />
      </div>

      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Quick add slot</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleAddSlot}>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="session-slot-name">
                  Slot <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="session-slot-name"
                  value={slotName}
                  onChange={(event) => setSlotName(event.target.value)}
                  placeholder="Slot name"
                  disabled={!record.isActive}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="session-nick-provider">Nick / provider</Label>
                <Input
                  id="session-nick-provider"
                  value={nickProvider}
                  onChange={(event) => setNickProvider(event.target.value)}
                  placeholder="Nickname or provider"
                  disabled={!record.isActive}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="session-purchase">
                  Purchase ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="session-purchase"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={purchaseAmount}
                  onChange={(event) => setPurchaseAmount(event.target.value)}
                  placeholder="Purchase amount"
                  disabled={!record.isActive}
                />
              </div>
            </div>

            {formError ? (
              <StatusAlert tone="error">{formError}</StatusAlert>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!record.isActive}>
                <Plus className="size-4" aria-hidden />
                Add slot
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            Bonus list ({slots.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bonuses added yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot</TableHead>
                  <TableHead>Nick / provider</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead>Win</TableHead>
                  <TableHead>Multiplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">{slot.slotName}</TableCell>
                    <TableCell>{slot.nickProvider || '—'}</TableCell>
                    <TableCell>{formatUsd(slot.purchaseAmount)}</TableCell>
                    <TableCell className="text-muted-foreground">Pending</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={endDialogOpen} onOpenChange={handleEndDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End bonus buy session?</DialogTitle>
            <DialogDescription>
              This marks the session as ended. You can still view stats and the
              bonus list, but adding new slots will be disabled.
            </DialogDescription>
          </DialogHeader>
          {endError ? (
            <StatusAlert tone="error">{endError}</StatusAlert>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleEndDialogChange(false)}
              disabled={isEnding}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleEndSession()}
              disabled={isEnding}
            >
              {isEnding ? 'Ending…' : 'End session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
