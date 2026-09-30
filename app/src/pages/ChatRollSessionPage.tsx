import { Button, Grid, IconButton, Stack, Tooltip } from '@mui/material'
import { styled, useTheme } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupIcon from '@mui/icons-material/Group'
import ReplayIcon from '@mui/icons-material/Replay'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useBlocker, useParams } from 'react-router-dom'
import type {
  ChatRollParticipant,
  ChatRollRecord,
  ChatRollWin,
} from '@/api/chat-roll'
import { isChatRollReadOnly } from '@/api/chat-roll'
import type { IconTileVariant, TileIcon } from '@/components/IconTile'
import { formatChatRollLiveSessionHint } from '@/components/chat-roll/chat-roll-page/chat-roll-page-utils'
import {
  CoefficientChip,
  EmptyListText,
  ListCard,
  ListCardContent,
  ListRowName,
  ListRowStack,
  ListRowsStack,
  ParticipantExtraStack,
  RoleTagChip,
  SettingsCard,
  SettingsCardContent,
  RollButton,
  SettingsStack,
} from '@/components/chat-roll/chatRollPageStyles'
import { ChatRollSessionArchiveDialog } from '@/components/chat-roll/session/ChatRollSessionArchiveDialog'
import { ChatRollSessionErrorState } from '@/components/chat-roll/session/ChatRollSessionErrorState'
import { ChatRollSessionHeaderSection } from '@/components/chat-roll/session/ChatRollSessionHeaderSection'
import { ChatRollKickChatSection } from '@/components/chat-roll/session/ChatRollKickChatSection'
import { ChatRollWinResponseChip } from '@/components/chat-roll/session/ChatRollWinResponseChip'
import { ChatRollSessionSettingsChrome } from '@/components/chat-roll/session/ChatRollSessionSettingsChrome'
import { ChatRollSessionSettingsLeftPanel } from '@/components/chat-roll/session/ChatRollSessionSettingsLeftPanel'
import { ChatRollSessionLoadingState } from '@/components/chat-roll/session/ChatRollSessionLoadingState'
import { ChatRollRollRevealOverlay } from '@/components/chat-roll/session/ChatRollRollRevealOverlay'
import { ChatRollSessionUnsavedLeaveDialog } from '@/components/chat-roll/session/ChatRollSessionUnsavedLeaveDialog'
import { chatRollModule, getChatRollWinRowBorderColor } from '@/components/chat-roll/session/chat-roll-session-utils'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import { useChatRollSessionSettingsDraft } from '@/hooks/useChatRollSessionSettingsDraft'
import {
  getChatRollRoleChipLabel,
  getChatRollRoleMeta,
  computeParticipantCoefficient,
  formatCoefficient,
} from '@/lib/chat-roll'
import {
  buildChatRollSettingsPatch,
  parseWinnerResponseSecondsDraftInput,
  updateRoleWeightInDraft,
  validateChatRollSettingsDraftKeyword,
  validateChatRollSettingsDraftRoleWeights,
  validateChatRollSettingsDraftWinnerResponseSeconds,
} from '@/lib/chat-roll-session-settings'
import {
  useChatRollSession,
  useDeleteAllChatRollParticipants,
  useDeleteAllChatRollWins,
  useDeleteChatRollParticipant,
  useDeleteChatRollWin,
  useGoLiveChatRollSession,
  usePatchChatRollSession,
  useRollChatRoll,
} from '@/queries/use-chat-roll-session'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const WORKSPACE_MIN_HEIGHT = 680

const WorkspaceGrid = styled(Grid)(({ theme }) => ({
  alignItems: 'stretch',
  [theme.breakpoints.up('lg')]: {
    minHeight: WORKSPACE_MIN_HEIGHT,
  },
}))

const workspaceColumnSx = {
  display: 'flex',
  minWidth: 0,
  minHeight: 0,
}

function NameListCard({
  title,
  icon,
  iconVariant = 'info',
  emptyLabel,
  removeAriaLabel,
  rows,
  renderRowExtra,
  onClearAll,
  onRemove,
  onCopyRow,
  resolveRowBorderColor,
  readOnly,
}: {
  title: string
  icon: TileIcon
  iconVariant?: IconTileVariant
  emptyLabel: string
  removeAriaLabel: string
  rows: { id: number; displayName: string }[]
  renderRowExtra?: (row: { id: number; displayName: string }) => ReactNode
  onClearAll: () => void
  onRemove: (id: number) => void
  onCopyRow?: (row: { id: number; displayName: string }) => void
  resolveRowBorderColor?: (row: { id: number; displayName: string }) => string
  readOnly: boolean
}) {
  const { t } = useTranslation()

  return (
    <ListCard elevation={0}>
      <ListCardContent>
        <SectionHeader
          title={title}
          icon={icon}
          iconVariant={iconVariant}
          action={
            <Button
              size="small"
              variant="text"
              onClick={onClearAll}
              disabled={rows.length === 0 || readOnly}
            >
              {t('common.clearAll')}
            </Button>
          }
        />

        {rows.length === 0 ? (
          <EmptyListText variant="body2" color="text.secondary">
            {emptyLabel}
          </EmptyListText>
        ) : (
          <ListRowsStack>
            {rows.map((row) => (
              <ListRowStack
                key={row.id}
                sx={
                  resolveRowBorderColor
                    ? { borderColor: resolveRowBorderColor(row) }
                    : undefined
                }
              >
                <ListRowName variant="body2" noWrap>
                  {row.displayName}
                </ListRowName>
                {renderRowExtra?.(row)}
                {onCopyRow ? (
                  <Tooltip
                    title={t('table.copyNickAria', { nick: row.displayName })}
                    arrow
                  >
                    <span style={{ display: 'inline-flex' }}>
                      <IconButton
                        size="small"
                        aria-label={t('table.copyNickAria', {
                          nick: row.displayName,
                        })}
                        onClick={() => onCopyRow(row)}
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} aria-hidden />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : null}
                <Tooltip title={removeAriaLabel} arrow>
                  <span style={{ display: 'inline-flex' }}>
                    <IconButton
                      size="small"
                      aria-label={removeAriaLabel}
                      onClick={() => onRemove(row.id)}
                      disabled={readOnly}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListRowStack>
            ))}
          </ListRowsStack>
        )}
      </ListCardContent>
    </ListCard>
  )
}

export function ChatRollSessionPage() {
  const { t } = useTranslation()
  const { id } = useParams()
  const chatRollId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(chatRollId)
  const { user } = useAuth()
  const {
    data: session,
    isLoading,
    error: sessionError,
  } = useChatRollSession(user?.accountId, isValidId ? chatRollId : Number.NaN)

  const record = session?.record ?? null
  const accountId = user?.accountId

  const error = !isValidId
    ? t('chatRoll.sessionNotFound')
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? t('chatRoll.couldNotLoadSession')
        : null

  useSetBreadcrumbLabel(
    record
      ? `${t('chatRoll.historyCardIndex', { index: record.id })} ${record.title}`
      : null,
  )

  if (isLoading) {
    return <ChatRollSessionLoadingState />
  }

  if (error || !record || !session || accountId === undefined) {
    return (
      <ChatRollSessionErrorState
        message={error ?? t('chatRoll.sessionNotFound')}
      />
    )
  }

  return (
    <ChatRollSessionWorkspace
      accountId={accountId}
      chatRollId={chatRollId}
      record={record}
      participants={session.participants}
      wins={session.wins}
    />
  )
}

type ChatRollSessionWorkspaceProps = {
  accountId: number
  chatRollId: number
  record: ChatRollRecord
  participants: ChatRollParticipant[]
  wins: ChatRollWin[]
}

function ChatRollSessionWorkspace(props: ChatRollSessionWorkspaceProps) {
  const { t } = useTranslation()
  const theme = useTheme()
  const { showError, showSuccess } = useNotification()
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const [rollRevealOpen, setRollRevealOpen] = useState(false)
  const [rollRevealWin, setRollRevealWin] = useState<ChatRollWin | null>(null)

  const { record, participants, wins, accountId, chatRollId } = props
  const readOnly = isChatRollReadOnly(record)

  const settingsSaveMutation = usePatchChatRollSession(accountId, chatRollId)
  const sessionPatchMutation = usePatchChatRollSession(accountId, chatRollId)
  const goLiveMutation = useGoLiveChatRollSession(accountId, chatRollId)
  const liveActionPending = goLiveMutation.isPending
  const rollMutation = useRollChatRoll(accountId, chatRollId)
  const deleteParticipantMutation = useDeleteChatRollParticipant(
    accountId,
    chatRollId,
  )
  const deleteAllParticipantsMutation = useDeleteAllChatRollParticipants(
    accountId,
    chatRollId,
  )
  const deleteWinMutation = useDeleteChatRollWin(accountId, chatRollId)
  const deleteAllWinsMutation = useDeleteAllChatRollWins(accountId, chatRollId)

  const roleMeta = useMemo(() => getChatRollRoleMeta(t), [t])

  const rollRevealWinSynced = useMemo(() => {
    if (!rollRevealWin) {
      return null
    }
    return wins.find((row) => row.id === rollRevealWin.id) ?? rollRevealWin
  }, [rollRevealWin, wins])
  const { draft, isDirty, resetDraft, updateDraft } =
    useChatRollSessionSettingsDraft(record)

  const shouldBlockNavigation = isDirty && !readOnly
  const blocker = useBlocker(shouldBlockNavigation)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setLeaveDialogOpen(true)
    }
  }, [blocker.state])

  function patchSession(body: Parameters<typeof sessionPatchMutation.mutate>[0]) {
    if (readOnly) {
      return
    }

    sessionPatchMutation.mutate(body, {
      onError: (patchError) => {
        showError(
          patchError instanceof Error
            ? patchError.message
            : t('chatRoll.couldNotSaveSettings'),
        )
      },
    })
  }

  function handleCopyWinnerNick(displayName: string) {
    void navigator.clipboard
      .writeText(displayName)
      .then(() => showSuccess(t('chatRoll.winnerNickCopied')))
      .catch(() => showError(t('chatRoll.couldNotCopyWinnerNick')))
  }

  function handleSaveSettings() {
    if (!validateChatRollSettingsDraftKeyword(draft)) {
      setKeywordError(t('chatRoll.keywordRequired'))
      return
    }

    setKeywordError(null)

    if (!validateChatRollSettingsDraftWinnerResponseSeconds(draft)) {
      return
    }

    if (!validateChatRollSettingsDraftRoleWeights(draft)) {
      return
    }

    const body = buildChatRollSettingsPatch(record, draft)
    if (Object.keys(body).length === 0) {
      return
    }

    settingsSaveMutation.mutate(body, {
      onSuccess: () => {
        showSuccess(t('chatRoll.settingsSaved'))
      },
      onError: (patchError) => {
        showError(
          patchError instanceof Error
            ? patchError.message
            : t('chatRoll.couldNotSaveSettings'),
        )
      },
    })
  }

  function handleStayOnPage() {
    setLeaveDialogOpen(false)
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
  }

  function handleLeavePage() {
    setLeaveDialogOpen(false)
    resetDraft()
    if (blocker.state === 'blocked') {
      blocker.proceed()
    }
  }

  function handleRoll() {
    if (rollRevealOpen) {
      return
    }

    setRollRevealWin(null)
    setRollRevealOpen(true)

    rollMutation.mutate(undefined, {
      onSuccess: (win) => {
        setRollRevealWin(win)
      },
      onError: (rollError) => {
        setRollRevealOpen(false)
        setRollRevealWin(null)
        showError(
          rollError instanceof Error
            ? rollError.message
            : t('chatRoll.noEligibleParticipants'),
        )
      },
    })
  }

  function handleRollRevealClose() {
    const name = rollRevealWin?.displayName
    setRollRevealOpen(false)
    setRollRevealWin(null)
    if (name) {
      showSuccess(t('chatRoll.rollWon', { name }))
    }
  }

  function renderParticipantExtra(participant: ChatRollParticipant) {
    const coefficient = computeParticipantCoefficient(
      {
        id: String(participant.id),
        displayName: participant.displayName,
        roleIds: participant.roleIds,
      },
      record.roleSettings,
      record.combineMode,
    )

    return (
      <ParticipantExtraStack>
        {participant.roleIds.map((roleId) => (
          <RoleTagChip
            key={roleId}
            label={getChatRollRoleChipLabel(t, roleId)}
            size="small"
          />
        ))}
        <CoefficientChip label={formatCoefficient(coefficient)} size="small" />
      </ParticipantExtraStack>
    )
  }

  const settingsDisabled = readOnly || settingsSaveMutation.isPending
  const winnerResponseSecondsError =
    !validateChatRollSettingsDraftWinnerResponseSeconds(draft)
      ? t('chatRoll.winnerResponseSecondsOutOfRange')
      : null
  const canSaveSettings =
    isDirty &&
    validateChatRollSettingsDraftKeyword(draft) &&
    validateChatRollSettingsDraftWinnerResponseSeconds(draft) &&
    validateChatRollSettingsDraftRoleWeights(draft) &&
    !settingsSaveMutation.isPending &&
    !readOnly

  const sessionPrimaryActions = (
    <>
      <RollButton
        variant="contained"
        size="small"
        startIcon={<ReplayIcon />}
        onClick={handleRoll}
        disabled={
          readOnly ||
          participants.length <= 1 ||
          rollMutation.isPending ||
          rollRevealOpen
        }
      >
        {t('chatRoll.roll')}
      </RollButton>
      <Button
        variant="outlined"
        size="small"
        startIcon={
          record.isAcceptingParticipants ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )
        }
        disabled={readOnly || sessionPatchMutation.isPending}
        onClick={() =>
          patchSession({
            is_accepting_participants: !record.isAcceptingParticipants,
          })
        }
      >
        {record.isAcceptingParticipants
          ? t('chatRoll.pauseEntries')
          : t('chatRoll.resumeEntries')}
      </Button>
    </>
  )

  return (
    <PageStack>
      <ModuleSessionPageHeader module={chatRollModule} />

      <ChatRollSessionHeaderSection
        record={record}
        onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
        onGoLive={() => {
          goLiveMutation.mutate(undefined, {
            onSuccess: (updated) =>
              showSuccess(
                formatChatRollLiveSessionHint(
                  t,
                  updated.isAcceptingParticipants,
                ),
              ),
            onError: (error) =>
              showError(
                error instanceof Error
                  ? error.message
                  : t('chatRoll.couldNotGoLive'),
              ),
          })
        }}
        liveActionPending={liveActionPending}
        primaryActions={sessionPrimaryActions}
      />

      <WorkspaceGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <SettingsCard elevation={0}>
            <SettingsCardContent>
              <ChatRollSessionSettingsChrome
                readOnly={readOnly}
                isDirty={isDirty}
                canSave={canSaveSettings}
                isSaving={settingsSaveMutation.isPending}
                onSave={handleSaveSettings}
              />

              <SettingsStack>
                <ChatRollSessionSettingsLeftPanel
                  draft={draft}
                  keywordError={keywordError}
                  winnerResponseSecondsError={winnerResponseSecondsError}
                  settingsDisabled={settingsDisabled}
                  onKeywordChange={(value) => {
                    updateDraft((current) => ({ ...current, keyword: value }))
                    if (value.trim()) {
                      setKeywordError(null)
                    }
                  }}
                  onCombineModeChange={(mode) =>
                    updateDraft((current) => ({ ...current, combineMode: mode }))
                  }
                  onExcludeWinnerChange={(checked) =>
                    updateDraft((current) => ({
                      ...current,
                      excludeWinnerAfterRoll: checked,
                    }))
                  }
                  onWinnerResponseEnabledChange={(checked) =>
                    updateDraft((current) => ({
                      ...current,
                      winnerResponseEnabled: checked,
                    }))
                  }
                  onWinnerResponseSecondsChange={(raw) =>
                    updateDraft((current) => ({
                      ...current,
                      winnerResponseSeconds:
                        parseWinnerResponseSecondsDraftInput(raw),
                    }))
                  }
                  roleMeta={roleMeta}
                  onRoleToggle={(roleId, enabled) =>
                    updateDraft((current) => ({
                      ...current,
                      roleSettings: {
                        ...current.roleSettings,
                        [roleId]: { ...current.roleSettings[roleId], enabled },
                      },
                    }))
                  }
                  onRoleWeightChange={(roleId, raw) =>
                    updateDraft((current) =>
                      updateRoleWeightInDraft(current, roleId, raw),
                    )
                  }
                />
              </SettingsStack>
            </SettingsCardContent>
          </SettingsCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <ChatRollKickChatSection accountId={accountId} />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <NameListCard
            title={t('chatRoll.participantsTitle', { count: participants.length })}
            icon={GroupIcon}
            emptyLabel={t('chatRoll.noParticipants')}
            removeAriaLabel={t('chatRoll.removeParticipant')}
            rows={participants}
            renderRowExtra={(row) =>
              renderParticipantExtra(
                participants.find((participant) => participant.id === row.id)!,
              )
            }
            readOnly={readOnly}
            onClearAll={() =>
              deleteAllParticipantsMutation.mutate(undefined, {
                onError: () => showError(t('chatRoll.couldNotClearParticipants')),
              })
            }
            onRemove={(participantId) =>
              deleteParticipantMutation.mutate(participantId, {
                onError: () => showError(t('chatRoll.couldNotRemoveParticipant')),
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <NameListCard
            title={t('chatRoll.winnersTitle', { count: wins.length })}
            icon={EmojiEventsIcon}
            iconVariant="primary"
            emptyLabel={t('chatRoll.noWinners')}
            removeAriaLabel={t('chatRoll.removeWinner')}
            rows={wins}
            renderRowExtra={(row) => {
              const win = wins.find((entry) => entry.id === row.id)
              return win ? <ChatRollWinResponseChip win={win} /> : null
            }}
            readOnly={readOnly}
            onCopyRow={(row) => handleCopyWinnerNick(row.displayName)}
            resolveRowBorderColor={(row) => {
              const win = wins.find((entry) => entry.id === row.id)
              return win ? getChatRollWinRowBorderColor(win, theme) : theme.palette.divider
            }}
            onClearAll={() =>
              deleteAllWinsMutation.mutate(undefined, {
                onError: () => showError(t('chatRoll.couldNotClearWinners')),
              })
            }
            onRemove={(winId) =>
              deleteWinMutation.mutate(winId, {
                onError: () => showError(t('chatRoll.couldNotRemoveWinner')),
              })
            }
          />
        </Grid>
      </WorkspaceGrid>

      <ChatRollSessionArchiveDialog
        accountId={accountId}
        chatRollId={chatRollId}
        record={record}
        open={archiveSessionDialogOpen}
        onClose={() => setArchiveSessionDialogOpen(false)}
      />

      <ChatRollSessionUnsavedLeaveDialog
        open={leaveDialogOpen}
        onStay={handleStayOnPage}
        onLeave={handleLeavePage}
      />

      <ChatRollRollRevealOverlay
        open={rollRevealOpen}
        win={rollRevealWinSynced}
        onClose={handleRollRevealClose}
      />
    </PageStack>
  )
}
