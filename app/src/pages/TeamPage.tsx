import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme, alpha, type Theme } from '@mui/material/styles'
import { Link2, UserPlus, Users, UserX } from 'lucide-react'
import type { RowAction } from '@/components/RowActionsMenu'
import { type FormEvent, useCallback, useEffect, useState } from 'react'
import {
  createModerator,
  fetchAccountMembers,
  fetchModeratorInviteLink,
  revokeModerator,
  type AccountMember,
} from '@/api/auth'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { RowActionsMenu } from '@/components/RowActionsMenu'
import { StatusAlert } from '@/components/StatusAlert'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import { cardSx, inputFieldSx, mutedChipSx, toneChipSx } from '@/theme/colors'

function roleBadge(role: AccountMember['role']) {
  return role === 'owner' ? 'Owner' : 'Moderator'
}

function memberRoleChip(role: AccountMember['role'], palette: Theme['palette']) {
  const isOwner = role === 'owner'

  return (
    <Chip
      label={roleBadge(role)}
      size="small"
      sx={toneChipSx(
        isOwner ? palette.primary.light : palette.info.light,
      )}
    />
  )
}

function memberStatusChip(
  isActive: boolean,
  palette: Theme['palette'],
  theme: Theme,
) {
  if (isActive) {
    return (
      <Chip
        label="Active"
        size="small"
        sx={toneChipSx(palette.success.light)}
      />
    )
  }

  return (
    <Chip label="Revoked" size="small" sx={mutedChipSx(theme)} />
  )
}

export function TeamPage() {
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [members, setMembers] = useState<AccountMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [membersError, setMembersError] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [moderatorName, setModeratorName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
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
    setModeratorName('')
    setCreateError(null)
  }

  function handleCreateDialogChange(open: boolean) {
    setCreateDialogOpen(open)
    if (!open) {
      resetCreateForm()
    }
  }

  async function handleCreateModerator(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user?.accountId || user.role !== 'owner') {
      return
    }

    setIsCreating(true)
    setCreateError(null)

    try {
      await createModerator(user.accountId, moderatorName)
      setCreateDialogOpen(false)
      resetCreateForm()
      await loadMembers()
      showSuccess(
        'Copy the link and share it with the moderator.',
      )
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : 'Could not create moderator',
      )
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopyInviteLink(member: AccountMember) {
    if (!user?.accountId || user.role !== 'owner' || !member.hasInviteLink) {
      return
    }

    setCopyingMemberId(member.userId)

    try {
      const joinUrl = await fetchModeratorInviteLink(user.accountId, member.userId)
      await navigator.clipboard.writeText(joinUrl)
      showSuccess(`Link for ${member.name} copied.`)
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Could not copy link',
      )
    } finally {
      setCopyingMemberId(null)
    }
  }

  async function handleRevokeModerator(member: AccountMember) {
    if (!user?.accountId || member.role !== 'moderator' || !member.isActive) {
      return
    }

    try {
      await revokeModerator(user.accountId, member.userId)
      await loadMembers()
      showSuccess('Moderator access revoked.')
    } catch (error) {
      showError(
        error instanceof Error ? error.message : 'Could not revoke access',
      )
    }
  }

  function memberActions(member: AccountMember): RowAction[] {
    if (member.role !== 'moderator' || !member.isActive) {
      return []
    }

    const actions: RowAction[] = []

    if (user?.role === 'owner' && member.hasInviteLink) {
      actions.push({
        id: 'copy-link',
        label:
          copyingMemberId === member.userId ? 'Copying…' : 'Copy link',
        icon: <Link2 size={16} aria-hidden />,
        disabled: copyingMemberId === member.userId,
        onClick: () => void handleCopyInviteLink(member),
      })
    }

    actions.push({
      id: 'revoke',
      label: 'Revoke',
      icon: <UserX size={16} aria-hidden />,
      destructive: true,
      onClick: () => void handleRevokeModerator(member),
    })

    return actions
  }

  const memberColumns: AppTableColumn<AccountMember>[] = [
    {
      id: 'name',
      header: 'Name',
      width: '100%',
      sx: {
        fontWeight: 500,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      render: (member) => member.name,
    },
    {
      id: 'role',
      header: 'Role',
      width: 100,
      minWidth: 100,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) => memberRoleChip(member.role, theme.palette),
    },
    {
      id: 'status',
      header: 'Status',
      width: 100,
      minWidth: 100,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) => memberStatusChip(member.isActive, theme.palette, theme),
    },
    {
      id: 'action',
      header: 'Actions',
      align: 'right',
      width: 80,
      minWidth: 80,
      sx: { px: 1, whiteSpace: 'nowrap' },
      render: (member) => {
        const actions = memberActions(member)

        return actions.length > 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <RowActionsMenu
              actions={actions}
              ariaLabel={`Actions for ${member.name}`}
            />
          </Box>
        ) : null
      },
    },
  ]

  return (
    <Stack spacing={4}>
      <PageHeader
        title="Team"
        description="Invite moderators and manage access"
        icon={Users}
        iconVariant="info"
      />
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 3, alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.info.main, 0.14),
                  color: theme.palette.info.light,
                }}
              >
                <Users size={20} aria-hidden />
              </Box>
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Members
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage moderator access
                </Typography>
              </Stack>
            </Stack>
            {user?.role === 'owner' && user.accountId ? (
              <Button
                type="button"
                variant="contained"
                startIcon={<UserPlus size={16} aria-hidden />}
                onClick={() => setCreateDialogOpen(true)}
              >
                Add
              </Button>
            ) : null}
          </Stack>

          <Stack spacing={2}>
            {loadingMembers ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Stack>
            ) : null}
            {membersError ? (
              <StatusAlert tone="error">{membersError}</StatusAlert>
            ) : null}
            {!loadingMembers && members.length > 0 ? (
              <AppTable
                columns={memberColumns}
                rows={members}
                getRowKey={(member) => member.userId}
              />
            ) : null}
            {!loadingMembers && !membersError && members.length === 1 ? (
              <StatusAlert tone="info">Only the owner so far</StatusAlert>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={createDialogOpen}
        onClose={() => handleCreateDialogChange(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              The moderator will get access to the team dashboard: view
              the home page, manage streamer modules, and revoke access for
              other moderators. Only the owner can add new members.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a name and share the link — they will join the team
              through it.
            </Typography>
          </Stack>
          <Box
            component="form"
            id="team-create-moderator-form"
            onSubmit={handleCreateModerator}
          >
            <Stack spacing={2.5}>
              <TextField
                id="moderator-name"
                label="Name"
                value={moderatorName}
                onChange={(event) => setModeratorName(event.target.value)}
                required
                slotProps={{ htmlInput: { minLength: 2, maxLength: 100 } }}
                autoFocus
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              <TextField
                id="moderator-role"
                label="Role"
                value="Moderator"
                disabled
                fullWidth
                size="small"
                sx={inputFieldSx}
              />
              {createError ? (
                <StatusAlert tone="error">{createError}</StatusAlert>
              ) : null}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => handleCreateDialogChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="team-create-moderator-form"
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Adding…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
