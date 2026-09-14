import { Gift, Plus } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createBonusBuy,
  fetchBonusBuys,
  type BonusBuyRecord,
} from '@/api/bonus-buy'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

function formatUsd(amount: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.parseFloat(amount))
}

const DEFAULT_TITLE = 'Bonus Buy'
const DEFAULT_START_BALANCE = '0'

function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge
        variant="secondary"
        className="border-transparent bg-emerald-500/15 text-emerald-400"
      >
        Active
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Inactive
    </Badge>
  )
}

export function BonusBuyPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<BonusBuyRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [recordsError, setRecordsError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [startBalance, setStartBalance] = useState(DEFAULT_START_BALANCE)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadRecords = useCallback(async () => {
    if (!user?.accountId) {
      return
    }

    setLoadingRecords(true)
    setRecordsError(null)

    try {
      const rows = await fetchBonusBuys(user.accountId)
      setRecords(rows)
    } catch (error) {
      setRecordsError(
        error instanceof Error
          ? error.message
          : 'Could not load bonus buy history',
      )
    } finally {
      setLoadingRecords(false)
    }
  }, [user?.accountId])

  useEffect(() => {
    void loadRecords()
  }, [loadRecords])

  function resetCreateForm() {
    setTitle(DEFAULT_TITLE)
    setStartBalance(DEFAULT_START_BALANCE)
    setCreateError(null)
  }

  function handleCreateDialogChange(open: boolean) {
    setCreateDialogOpen(open)
    if (open) {
      resetCreateForm()
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.accountId) {
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      await createBonusBuy(user.accountId, title, startBalance)
      setCreateDialogOpen(false)
      resetCreateForm()
      await loadRecords()
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create bonus buy',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Bonus Buy"
        description="Bonus buy widget for your stream"
        icon={Gift}
        iconVariant="warning"
        action={
          user?.accountId ? (
            <Button type="button" onClick={() => handleCreateDialogChange(true)}>
              <Plus className="size-4" aria-hidden />
              New
            </Button>
          ) : null
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Bonus buy sessions for this account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingRecords ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : null}
          {recordsError ? (
            <StatusAlert tone="error">{recordsError}</StatusAlert>
          ) : null}
          {!loadingRecords && records.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Start balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.title}</TableCell>
                    <TableCell>{formatUsd(record.startBalance)}</TableCell>
                    <TableCell>
                      <StatusBadge isActive={record.isActive} />
                    </TableCell>
                    <TableCell>{record.createdByName}</TableCell>
                    <TableCell>{formatDateTime(record.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/bonus-buy/${record.id}`}>Open</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
          {!loadingRecords && !recordsError && records.length === 0 ? (
            <StatusAlert tone="info">No bonus buy sessions yet</StatusAlert>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Bonus Buy</DialogTitle>
            <DialogDescription>
              Create a bonus buy session with a title and starting balance in USD.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleCreate}>
            <div className="grid gap-2">
              <Label htmlFor="bonus-buy-title">Title</Label>
              <Input
                id="bonus-buy-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={200}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bonus-buy-balance">Start balance (USD)</Label>
              <Input
                id="bonus-buy-balance"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={startBalance}
                onChange={(event) => setStartBalance(event.target.value)}
                required
              />
            </div>
            {createError ? (
              <StatusAlert tone="error">{createError}</StatusAlert>
            ) : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleCreateDialogChange(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating…' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
