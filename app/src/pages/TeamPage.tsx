import { Link2, UserPlus, Users, UserX } from 'lucide-react'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createAdmin,
  fetchAccountMembers,
  fetchAdminInviteLink,
  revokeAdmin,
  type AccountMember,
  type CreateAdminResult,
} from '@/api/auth'
import { PageHeader } from '@/components/PageHeader'
import { Alert, AlertDescription } from '@/components/ui/alert'
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

function roleBadge(role: AccountMember['role']) {
  return role === 'owner' ? 'Owner' : 'Admin'
}

export function TeamPage() {
  const { user } = useAuth()
  const [members, setMembers] = useState<AccountMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [createdLink, setCreatedLink] = useState<CreateAdminResult | null>(null)
  const [teamMessage, setTeamMessage] = useState<string | null>(null)
  const [teamError, setTeamError] = useState<string | null>(null)
  const [copyingMemberId, setCopyingMemberId] = useState<number | null>(null)

  const loadMembers = useCallback(async () => {
    if (!user?.accountId) {
      return
    }

    setLoadingMembers(true)
    setMembersError(null)

    try {
      const roster = await fetchAccountMembers(user.accountId)
      setMembers(roster)
    } catch (error) {
      setMembersError(
        error instanceof Error ? error.message : 'Could not load team',
      )
    } finally {
      setLoadingMembers(false)
    }
  }, [user?.accountId])

  useEffect(() => {
    void loadMembers()
  }, [loadMembers])

  function resetCreateForm() {
    setAdminName('')
    setCreateError(null)
  }

  function handleCreateDialogChange(open: boolean) {
    setCreateDialogOpen(open)
    if (!open) {
      resetCreateForm()
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.accountId || user.role !== 'owner') {
      return
    }

    setIsCreating(true)
    setCreateError(null)
    setTeamMessage(null)
    setTeamError(null)
    setCreatedLink(null)

    try {
      const result = await createAdmin(user.accountId, adminName)
      setCreatedLink(result)
      setTeamMessage('Copy the link and share it with the administrator.')
      setCreateDialogOpen(false)
      resetCreateForm()
      await loadMembers()
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create admin',
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopyInviteLink(member: AccountMember) {
    if (!user?.accountId || user.role !== 'owner' || !member.hasInviteLink) {
      return
    }

    setTeamMessage(null)
    setTeamError(null)
    setCopyingMemberId(member.userId)

    try {
      const joinUrl = await fetchAdminInviteLink(user.accountId, member.userId)
      await navigator.clipboard.writeText(joinUrl)
      setTeamMessage(`Link for ${member.name} copied.`)
    } catch (error) {
      setTeamError(
        error instanceof Error
          ? error.message
          : 'Could not copy link',
      )
    } finally {
      setCopyingMemberId(null)
    }
  }

  async function handleRevokeAdmin(member: AccountMember) {
    if (!user?.accountId || member.role !== 'admin' || !member.isActive) {
      return
    }

    setTeamMessage(null)
    setTeamError(null)

    try {
      await revokeAdmin(user.accountId, member.userId)
      await loadMembers()
      setTeamMessage('Administrator access revoked.')
    } catch (error) {
      setTeamError(
        error instanceof Error
          ? error.message
          : 'Could not revoke access',
      )
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Team"
        description="Members with dashboard access"
        icon={Users}
        iconVariant="info"
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-400">
              <Users className="size-5" aria-hidden />
            </div>
            <div className="space-y-1.5">
              <CardTitle>Members</CardTitle>
              <CardDescription>Manage administrator access</CardDescription>
            </div>
          </div>
          {user?.role === 'owner' && user.accountId ? (
            <Button type="button" onClick={() => setCreateDialogOpen(true)}>
              <UserPlus className="size-4" aria-hidden />
              Add
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingMembers ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : null}
          {membersError ? (
            <Alert variant="destructive">
              <AlertDescription>{membersError}</AlertDescription>
            </Alert>
          ) : null}
          {!loadingMembers && members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{roleBadge(member.role)}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.isActive ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Revoked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.role === 'admin' && member.isActive ? (
                        <div className="flex justify-end gap-2">
                          {user?.role === 'owner' && member.hasInviteLink ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={copyingMemberId === member.userId}
                              onClick={() => void handleCopyInviteLink(member)}
                            >
                              <Link2 className="size-3.5" aria-hidden />
                              {copyingMemberId === member.userId
                                ? 'Copying…'
                                : 'Copy link'}
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => void handleRevokeAdmin(member)}
                          >
                            <UserX className="size-3.5" aria-hidden />
                            Revoke
                          </Button>
                        </div>
                      ) : (
                        <CardDescription>—</CardDescription>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
          {!loadingMembers && !membersError && members.length === 1 ? (
            <Alert>
              <AlertDescription>Only the owner so far</AlertDescription>
            </Alert>
          ) : null}

          {createdLink ? (
            <Alert variant="success">
              <AlertDescription className="space-y-2">
                <p>
                  Link for <strong>{createdLink.name}</strong>:
                </p>
                <code className="block break-all text-xs">{createdLink.joinUrl}</code>
              </AlertDescription>
            </Alert>
          ) : null}

          {teamMessage ? (
            <Alert variant="success">
              <AlertDescription>{teamMessage}</AlertDescription>
            </Alert>
          ) : null}
          {teamError ? (
            <Alert variant="destructive">
              <AlertDescription>{teamError}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={createDialogOpen} onOpenChange={handleCreateDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add</DialogTitle>
            <DialogDescription className="space-y-2 text-left">
              <span className="block">
                The administrator will get access to the team dashboard: view
                the home page, manage streamer modules, and revoke access for
                other admins. Only the owner can add new members.
              </span>
              <span className="block">
                Enter a name and share the link — they will join the team
                through it.
              </span>
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={handleCreateAdmin}>
            <div className="grid gap-2">
              <Label htmlFor="admin-name">Name</Label>
              <Input
                id="admin-name"
                value={adminName}
                onChange={(event) => setAdminName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="admin-role">Role</Label>
              <Input id="admin-role" value="Admin" disabled />
            </div>
            {createError ? (
              <Alert variant="destructive">
                <AlertDescription>{createError}</AlertDescription>
              </Alert>
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
                {isCreating ? 'Adding…' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
