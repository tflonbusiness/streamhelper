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
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import { styled, useTheme, type Theme } from '@mui/material/styles'
import GroupIcon from '@mui/icons-material/Group'
import LinkIcon from '@mui/icons-material/Link'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import type { RowAction } from '@/components/RowActionsMenu'
import { type FormEvent, useMemo, useState } from 'react'
import {
  TEAM_MEMBERS_PAGE_SIZE,
  type AccountMember,
  type AccountMemberRoleFilter,
  type AccountMemberSortField,
  type AccountMemberSortOrder,
  type AccountMemberStatusFilter,
} from '@/api/auth'
import { AppTable, type AppTableColumn } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { EntitlementNoticesSection } from '@/components/EntitlementNoticesSection'
import { RowActionsMenu } from '@/components/RowActionsMenu'
import { StatusAlert } from '@/components/StatusAlert'
import { formatDateTime } from '@/lib/format-date-time'
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
import { MODULE_PAGE_SECTION_SPACING } from '@/lib/module-page-layout'
import {
  MutedStatusChip,
  StatusToneChip,
  statusBadgeColors,
} from '@/components/StatusToneChip'
import { cardSx, colors, inputFieldSx } from '@/theme/colors'

const StyledFilterFormControl = styled(FormControl)({
  minWidth: 140,
})

const StyledFilterSelect = styled(Select)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledFilterToolbar = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}))

const sortableHeaderIconSx = (theme: Theme, active: boolean) => ({
  color: 'inherit',
  '& .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.45,
    color: theme.palette.text.secondary,
  },
  '&:hover .MuiTableSortLabel-icon': {
    opacity: active ? 1 : 0.7,
  },
})

type MemberSortState = {
  field: AccountMemberSortField
  direction: AccountMemberSortOrder
}

function sortableMemberHeader(
  label: string,
  field: AccountMemberSortField,
  sort: MemberSortState,
  onSortField: (field: AccountMemberSortField) => void,
  theme: Theme,
) {
  const active = sort.field === field

  return (
    <TableSortLabel
      active={active}
      direction={active ? sort.direction : 'asc'}
      onClick={() => onSortField(field)}
      sx={sortableHeaderIconSx(theme, active)}
    >
      {label}
    </TableSortLabel>
  )
}

function memberRoleChip(
  role: AccountMember['role'],
  t: ReturnType<typeof useTranslation>['t'],
) {
  const isOwner = role === 'owner'

  return (
    <StatusToneChip
      label={isOwner ? t('auth.owner') : t('team.roleModerator')}
      color={isOwner ? colors.brand[400] : statusBadgeColors.open}
    />
  )
}

function memberStatusChip(
  isActive: boolean,
  t: ReturnType<typeof useTranslation>['t'],
) {
  if (isActive) {
    return (
      <StatusToneChip
        label={t('team.activeStatus')}
        color={statusBadgeColors.live}
      />
    )
  }

  return <MutedStatusChip label={t('team.revoked')} />
}

export function TeamPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [moderatorName, setModeratorName] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [generateLinkMember, setGenerateLinkMember] =
    useState<AccountMember | null>(null)
  const [generateLinkError, setGenerateLinkError] = useState<string | null>(
    null,
  )
  const [revokeMember, setRevokeMember] = useState<AccountMember | null>(null)
  const [revokeError, setRevokeError] = useState<string | null>(null)
  const [membersPage, setMembersPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState<AccountMemberRoleFilter>('all')
  const [statusFilter, setStatusFilter] =
    useState<AccountMemberStatusFilter>('true')
  const [sort, setSort] = useState<MemberSortState>({
    field: 'role',
    direction: 'asc',
  })

  const listParams = useMemo(
    () => ({
      page: membersPage,
      limit: TEAM_MEMBERS_PAGE_SIZE,
      role: roleFilter,
      status: statusFilter,
      sortBy: sort.field,
      sortOrder: sort.direction,
    }),
    [
      membersPage,
      roleFilter,
      statusFilter,
      sort.field,
      sort.direction,
    ],
  )

  const {
    data: membersResult,
    isLoading: loadingMembers,
    isFetching: fetchingMembers,
    error: membersQueryError,
  } = useAccountMembers(user?.accountId, listParams)

  const members = membersResult?.members ?? []
  const membersTotal = membersResult?.total ?? 0
  const membersEnvelope = membersResult?.envelope
  const isInitialMembersLoading = loadingMembers && !membersResult
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

  function handleGenerateLinkDialogChange(open: boolean) {
    if (!open) {
      setGenerateLinkMember(null)
      setGenerateLinkError(null)
    }
  }

  function openGenerateLinkDialog(member: AccountMember) {
    setGenerateLinkMember(member)
    setGenerateLinkError(null)
  }

  async function handleConfirmGenerateLink() {
    if (!generateLinkMember || !user?.accountId || user.role !== 'owner') {
      return
    }

    setGenerateLinkError(null)

    try {
      const joinUrl = await inviteLinkMutation.mutateAsync(
        generateLinkMember.userId,
      )
      try {
        await navigator.clipboard.writeText(joinUrl)
      } catch {
        setGenerateLinkError(t('team.couldNotCopyLink'))
        return
      }
      showSuccess(
        t('team.linkCopied', { name: generateLinkMember.name }),
      )
      handleGenerateLinkDialogChange(false)
    } catch (error) {
      setGenerateLinkError(
        error instanceof Error
          ? error.message
          : t('team.couldNotGenerateLink'),
      )
    }
  }

  async function handleConfirmRevoke() {
    if (
      !revokeMember ||
      !user?.accountId ||
      user.role !== 'owner' ||
      revokeMember.role !== 'moderator' ||
      !revokeMember.isActive
    ) {
      return
    }

    setRevokeError(null)

    try {
      await revokeMutation.mutateAsync(revokeMember.userId)
      showSuccess(t('team.moderatorRevoked'))
      setRevokeMember(null)
    } catch (error) {
      setRevokeError(
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
        id: 'generate-link',
        label: t('team.generateLink'),
        icon: <LinkIcon fontSize="small" aria-hidden />,
        onClick: () => openGenerateLinkDialog(member),
      })
    }

    if (user?.role === 'owner') {
      actions.push({
        id: 'revoke',
        label: t('team.revoke'),
        icon: <PersonRemoveIcon fontSize="small" aria-hidden />,
        destructive: true,
        onClick: () => {
          setRevokeMember(member)
          setRevokeError(null)
        },
      })
    }

    return actions
  }

  function handleSortField(field: AccountMemberSortField) {
    setSort((previous) => {
      if (previous.field === field) {
        return {
          field,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { field, direction: 'asc' }
    })
    setMembersPage(1)
  }

  const memberColumns: AppTableColumn<AccountMember>[] = [
    {
      id: 'name',
      header: sortableMemberHeader(
        t('common.name'),
        'name',
        sort,
        handleSortField,
        theme,
      ),
      width: '40%',
      minWidth: 120,
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
      header: sortableMemberHeader(
        t('common.role'),
        'role',
        sort,
        handleSortField,
        theme,
      ),
      width: 140,
      minWidth: 140,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) => memberRoleChip(member.role, t),
    },
    {
      id: 'status',
      header: sortableMemberHeader(
        t('common.status'),
        'status',
        sort,
        handleSortField,
        theme,
      ),
      width: 100,
      minWidth: 100,
      sx: { px: 1.5, whiteSpace: 'nowrap' },
      render: (member) =>
        memberStatusChip(member.isActive, t),
    },
    {
      id: 'createdAt',
      header: sortableMemberHeader(
        t('common.created'),
        'createdAt',
        sort,
        handleSortField,
        theme,
      ),
      width: 168,
      minWidth: 168,
      sx: { px: 1.5, whiteSpace: 'nowrap', color: 'text.secondary' },
      render: (member) => (
        <time dateTime={member.createdAt}>{formatDateTime(member.createdAt)}</time>
      ),
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
    <Stack spacing={MODULE_PAGE_SECTION_SPACING}>
      <PageHeader
        title={t('team.title')}
        description={t('team.description')}
        icon={GroupIcon}
        iconVariant="info"
      />
      <EntitlementNoticesSection
        envelope={membersEnvelope}
        variant="team"
        placement="standalone"
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
            {isInitialMembersLoading ? (
              <Stack spacing={1.5}>
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
                <Skeleton variant="rounded" height={40} />
              </Stack>
            ) : null}
            {membersError ? (
              <StatusAlert tone="error">{membersError}</StatusAlert>
            ) : null}
            {!isInitialMembersLoading && !membersError ? (
              <AppTable
                columns={memberColumns}
                rows={members}
                getRowKey={(member) => member.userId}
                loading={fetchingMembers}
                emptyMessage={t('team.noMembersMatchFilters')}
                toolbar={
                  <StyledFilterToolbar>
                    <StyledFilterFormControl size="small">
                      <InputLabel id="team-role-filter-label">
                        {t('common.role')}
                      </InputLabel>
                      <StyledFilterSelect
                        labelId="team-role-filter-label"
                        label={t('common.role')}
                        value={roleFilter}
                        onChange={(event) => {
                          setRoleFilter(
                            event.target.value as AccountMemberRoleFilter,
                          )
                          setMembersPage(1)
                        }}
                      >
                        <MenuItem value="all">{t('common.all')}</MenuItem>
                        <MenuItem value="owner">{t('auth.owner')}</MenuItem>
                        <MenuItem value="moderator">
                          {t('team.roleModerator')}
                        </MenuItem>
                      </StyledFilterSelect>
                    </StyledFilterFormControl>
                    <StyledFilterFormControl size="small">
                      <InputLabel id="team-status-filter-label">
                        {t('common.status')}
                      </InputLabel>
                      <StyledFilterSelect
                        labelId="team-status-filter-label"
                        label={t('common.status')}
                        value={statusFilter}
                        onChange={(event) => {
                          setStatusFilter(
                            event.target.value as AccountMemberStatusFilter,
                          )
                          setMembersPage(1)
                        }}
                      >
                        <MenuItem value="true">{t('common.active')}</MenuItem>
                        <MenuItem value="false">{t('common.inactive')}</MenuItem>
                        <MenuItem value="all">{t('common.all')}</MenuItem>
                      </StyledFilterSelect>
                    </StyledFilterFormControl>
                  </StyledFilterToolbar>
                }
                pagination={{
                  count: membersTotal,
                  page: membersPage,
                  onPageChange: setMembersPage,
                  rowsPerPage: TEAM_MEMBERS_PAGE_SIZE,
                }}
              />
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

      <Dialog
        open={generateLinkMember !== null}
        onClose={() => handleGenerateLinkDialogChange(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {generateLinkMember
            ? t('team.generateLinkDialogTitle', { name: generateLinkMember.name })
            : t('team.generateLink')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <StatusAlert tone="warning">
              {t('team.generateLinkWarning')}
            </StatusAlert>
            {generateLinkError ? (
              <StatusAlert tone="error">{generateLinkError}</StatusAlert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => handleGenerateLinkDialogChange(false)}
            disabled={inviteLinkMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => void handleConfirmGenerateLink()}
            disabled={inviteLinkMutation.isPending}
          >
            {inviteLinkMutation.isPending
              ? t('team.generatingLink')
              : t('team.generateLinkAction')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={revokeMember !== null}
        onClose={() => {
          if (!revokeMutation.isPending) {
            setRevokeMember(null)
            setRevokeError(null)
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {revokeMember
            ? t('team.revokeDialogTitle', { name: revokeMember.name })
            : t('team.revoke')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <StatusAlert tone="warning">{t('team.revokeDialogWarning')}</StatusAlert>
            {revokeError ? (
              <StatusAlert tone="error">{revokeError}</StatusAlert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              setRevokeMember(null)
              setRevokeError(null)
            }}
            disabled={revokeMutation.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={() => void handleConfirmRevoke()}
            disabled={revokeMutation.isPending}
          >
            {revokeMutation.isPending ? t('team.revoking') : t('team.revoke')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
