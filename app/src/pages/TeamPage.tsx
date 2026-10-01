import { useTranslation } from 'react-i18next'
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
import { useTheme, type Theme } from '@mui/material/styles'
import GroupIcon from '@mui/icons-material/Group'
import LinkIcon from '@mui/icons-material/Link'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import type { RowAction } from '@/components/RowActionsMenu'
import { type FormEvent, useState } from 'react'
import { type AccountMember } from '@/api/auth'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { EntitlementOverLimitAlert } from '@/components/EntitlementOverLimitAlert'
import { RowActionsMenu } from '@/components/RowActionsMenu'
import { StatusAlert } from '@/components/StatusAlert'
import {
  canMutateWithEntitlements,
  isAtModeratorCap,
} from '@/lib/entitlements'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import {
  useAccountMembers,
  useCreateModerator,
  useModeratorInviteLink,
  useRevokeModerator,
} from '@/queries/use-team'
import { cardSx, inputFieldSx, mutedChipSx, toneChipSx } from '@/theme/colors'

function memberRoleChip(
  role: AccountMember['role'],
  palette: Theme['palette'],
  t: ReturnType<typeof useTranslation>['t'],
) {
  const isOwner = role === 'owner'

  return (
    <Chip
      label={isOwner ? t('auth.owner') : t('team.roleModerator')}
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
  t: ReturnType<typeof useTranslation>['t'],
) {
  if (isActive) {
    return (
      <Chip
        label={t('team.activeStatus')}
        size="small"
        sx={toneChipSx(palette.success.light)}
      />
    )
  }

  return (
    <Chip label={t('team.revoked')} size="small" sx={mutedChipSx(theme)} />
  )
}

export function TeamPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [moderatorName, setModeratorName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [copyingMemberId, setCopyingMemberId] = useState<number | null>(null)

  const {
    data: membersResult,
    isLoading: loadingMembers,
    error: membersQueryError,
  } = useAccountMembers(user?.accountId)

  const members = membersResult?.members ?? []
  const membersEnvelope = membersResult?.envelope
  const createModeratorDisabled =
    !canMutateWithEntitlements(membersEnvelope) ||
    isAtModeratorCap(membersEnvelope)

  const createMutation = useCreateModerator(user?.accountId)
  const revokeMutation = useRevokeModerator(user?.accountId)
  const inviteLinkMutation = useModeratorInviteLink(user?.accountId)

  const membersError =
    membersQueryError instanceof Error
      ? membersQueryError.message
      : membersQueryError
        ? t('team.couldNotLoadTeam')
        : null

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

    setCreateError(null)

    try {
      await createMutation.mutateAsync(moderatorName)
      setCreateDialogOpen(false)
      resetCreateForm()
      showSuccess(t('team.createModeratorSuccess'))
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : t('team.couldNotCreateModerator'),
      )
    }
  }

  async function handleCopyInviteLink(member: AccountMember) {
    if (!user?.accountId || user.role !== 'owner' || !member.hasInviteLink) {
      return
    }

    setCopyingMemberId(member.userId)

    try {
      const joinUrl = await inviteLinkMutation.mutateAsync(member.userId)
      await navigator.clipboard.writeText(joinUrl)
      showSuccess(t('team.linkCopied', { name: member.name }))
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t('team.couldNotCopyLink'),
      )
    } finally {
      setCopyingMemberId(null)
    }
  }

  async function handleRevokeModerator(member: AccountMember) {
    if (
      !user?.accountId ||
      user.role !== 'owner' ||
      member.role !== 'moderator' ||
      !member.isActive
    ) {
      return
    }

    try {
      await revokeMutation.mutateAsync(member.userId)
      showSuccess(t('team.moderatorRevoked'))
    } catch (error) {
      showError(
        error instanceof Error ? error.message : t('team.couldNotRevoke'),
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
          copyingMemberId === member.userId
            ? t('common.copying')
            : t('team.copyLink'),
        icon: <LinkIcon fontSize="small" aria-hidden />,
        disabled: copyingMemberId === member.userId,
        onClick: () => void handleCopyInviteLink(member),
      })
    }

    if (user?.role === 'owner') {
      actions.push({
        id: 'revoke',
        label: t('team.revoke'),
        icon: <PersonRemoveIcon fontSize="small" aria-hidden />,
        destructive: true,
        onClick: () => void handleRevokeModerator(member),
      })
    }

    return actions
  }

  const memberColumns: AppTableColumn<AccountMember>[] = [
    {
      id: 'name',
      header: t('common.name'),
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
      header: t('common.role'),
      width: 140,
      minWidth: 140,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) => memberRoleChip(member.role, theme.palette, t),
    },
    {
      id: 'status',
      header: t('common.status'),
      width: 100,
      minWidth: 100,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) =>
        memberStatusChip(member.isActive, theme.palette, theme, t),
    },
    {
      id: 'action',
      header: '',
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
              ariaLabel={t('team.actionsFor', { name: member.name })}
            />
          </Box>
        ) : null
      },
    },
  ]

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t('team.title')}
        description={t('team.description')}
        icon={GroupIcon}
        iconVariant="info"
      />
      <Card elevation={0} sx={cardSx}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <SectionHeader
            title={t('team.membersTitle')}
            description={t('team.manageModeratorAccess')}
            icon={GroupIcon}
            iconVariant="info"
            action={
              user?.role === 'owner' && user.accountId ? (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<PersonAddIcon fontSize="small" aria-hidden />}
                  onClick={() => setCreateDialogOpen(true)}
                  disabled={createModeratorDisabled}
                >
                  {t('common.add')}
                </Button>
              ) : undefined
            }
          />

          <Stack spacing={2}>
            <EntitlementOverLimitAlert envelope={membersEnvelope} />
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
              <StatusAlert tone="info">{t('team.onlyOwnerSoFar')}</StatusAlert>
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
        <DialogTitle>{t('common.add')}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              {t('team.createDialogBody1')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('team.createDialogBody2')}
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
                label={t('team.nameLabel')}
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
                label={t('common.role')}
                value={t('team.roleModerator')}
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
            disabled={createMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="team-create-moderator-form"
            variant="contained"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? t('common.adding') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
