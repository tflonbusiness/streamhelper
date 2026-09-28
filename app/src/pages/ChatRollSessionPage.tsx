import { Button, Grid, IconButton, Stack } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import DeleteIcon from '@mui/icons-material/Delete'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import GroupIcon from '@mui/icons-material/Group'
import ReplayIcon from '@mui/icons-material/Replay'
import SettingsIcon from '@mui/icons-material/Settings'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ChatRollParticipant } from '@/api/chat-roll'
import { isChatRollReadOnly } from '@/api/chat-roll'
import type { IconTileVariant, TileIcon } from '@/components/IconTile'
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
import { ChatRollSessionSettingsLeftPanel } from '@/components/chat-roll/session/ChatRollSessionSettingsLeftPanel'
import { ChatRollSessionLoadingState } from '@/components/chat-roll/session/ChatRollSessionLoadingState'
import { chatRollModule } from '@/components/chat-roll/session/chat-roll-session-utils'
import { ModuleSessionPageHeader } from '@/components/ModuleSessionPageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import {
  getChatRollRoleChipLabel,
  getChatRollRoleMeta,
  type ChatRollRoleId,
  clampRoleWeight,
  computeParticipantCoefficient,
  formatCoefficient,
  getEligibleParticipants,
} from '@/lib/chat-roll'
import {
  useChatRollSession,
  useDeleteAllChatRollParticipants,
  useDeleteAllChatRollWins,
  useDeleteChatRollParticipant,
  useDeleteChatRollWin,
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
  readOnly: boolean
}) {
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
              Clear all
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
              <ListRowStack key={row.id}>
                <ListRowName variant="body2" noWrap>
                  {row.displayName}
                </ListRowName>
                {renderRowExtra?.(row)}
                <IconButton
                  size="small"
                  aria-label={removeAriaLabel}
                  onClick={() => onRemove(row.id)}
                  disabled={readOnly}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
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
  const { showError, showSuccess } = useNotification()
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const {
    data: session,
    isLoading,
    error: sessionError,
  } = useChatRollSession(user?.accountId, isValidId ? chatRollId : Number.NaN)

  const record = session?.record ?? null
  const participants = session?.participants ?? []
  const wins = session?.wins ?? []
  const readOnly = record ? isChatRollReadOnly(record) : false
  const accountId = user?.accountId

  const patchMutation = usePatchChatRollSession(accountId, chatRollId)
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

  const error = !isValidId
    ? t('chatRoll.sessionNotFound')
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? t('chatRoll.couldNotLoadSession')
        : null

  useSetBreadcrumbLabel(record ? `${record.title} #${record.id}` : null)

  useEffect(() => {
    if (record) {
      setKeywordDraft(record.keyword)
    }
  }, [record?.keyword])

  if (isLoading) {
    return <ChatRollSessionLoadingState />
  }

  if (error || !record || accountId === undefined) {
    return (
      <ChatRollSessionErrorState
        message={error ?? t('chatRoll.sessionNotFound')}
      />
    )
  }

  function patchRecord(body: Parameters<typeof patchMutation.mutate>[0]) {
    if (readOnly) {
      return
    }

    patchMutation.mutate(body, {
      onError: (patchError) => {
        showError(
          patchError instanceof Error
            ? patchError.message
            : t('chatRoll.couldNotSaveSettings'),
        )
      },
    })
  }

  function handleKeywordBlur() {
    const trimmed = keywordDraft.trim()
    if (!trimmed) {
      setKeywordError(t('chatRoll.keywordRequired'))
      setKeywordDraft(record!.keyword)
      return
    }

    setKeywordError(null)
    if (trimmed !== record!.keyword) {
      patchRecord({ keyword: trimmed })
    }
  }

  function handleRoleToggle(roleId: ChatRollRoleId, enabled: boolean) {
    patchRecord({
      role_settings: {
        ...record!.roleSettings,
        [roleId]: { ...record!.roleSettings[roleId], enabled },
      },
    })
  }

  function handleRoleWeightChange(roleId: ChatRollRoleId, raw: string) {
    const parsed = Number.parseFloat(raw)
    patchRecord({
      role_settings: {
        ...record!.roleSettings,
        [roleId]: {
          ...record!.roleSettings[roleId],
          weight: clampRoleWeight(parsed),
        },
      },
    })
  }

  function handleRoll() {
    rollMutation.mutate(undefined, {
      onSuccess: (win) => {
        showSuccess(t('chatRoll.rollWon', { name: win.displayName }))
      },
      onError: (rollError) => {
        showError(
          rollError instanceof Error
            ? rollError.message
            : t('chatRoll.noEligibleParticipants'),
        )
      },
    })
  }

  function renderParticipantExtra(participant: ChatRollParticipant) {
    const coefficient = computeParticipantCoefficient(
      {
        id: String(participant.id),
        displayName: participant.displayName,
        roleIds: participant.roleIds,
      },
      record!.roleSettings,
      record!.combineMode,
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

  const eligibleCount = getEligibleParticipants(
    participants.map((participant) => ({
      id: String(participant.id),
      displayName: participant.displayName,
      roleIds: participant.roleIds,
    })),
    record.roleSettings,
    record.combineMode,
  ).length

  const settingsDisabled = readOnly || patchMutation.isPending

  const sessionPrimaryActions = (
    <>
      <RollButton
        variant="contained"
        size="small"
        startIcon={<ReplayIcon />}
        onClick={handleRoll}
        disabled={readOnly || eligibleCount === 0 || rollMutation.isPending}
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
        disabled={readOnly || patchMutation.isPending}
        onClick={() =>
          patchRecord({
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
        primaryActions={sessionPrimaryActions}
      />

      <WorkspaceGrid container spacing={3}>
        <Grid size={{ xs: 12, lg: 3 }} sx={workspaceColumnSx}>
          <SettingsCard elevation={0}>
            <SettingsCardContent>
              <SectionHeader
                title={t('chatRoll.settingsTitle')}
                icon={SettingsIcon}
                iconVariant="info"
              />

              <SettingsStack>
                <ChatRollSessionSettingsLeftPanel
                  record={record}
                  keywordDraft={keywordDraft}
                  keywordError={keywordError}
                  settingsDisabled={settingsDisabled}
                  onKeywordChange={(value) => {
                    setKeywordDraft(value)
                    if (value.trim()) {
                      setKeywordError(null)
                    }
                  }}
                  onKeywordBlur={handleKeywordBlur}
                  onCombineModeChange={(mode) =>
                    patchRecord({ combine_mode: mode })
                  }
                  onExcludeWinnerChange={(checked) =>
                    patchRecord({ exclude_winner_after_roll: checked })
                  }
                  onReplyInChatChange={(checked) =>
                    patchRecord({ reply_in_chat: checked })
                  }
                  onWinnerResponseEnabledChange={(checked) =>
                    patchRecord({ winner_response_enabled: checked })
                  }
                  onWinnerResponseSecondsChange={(seconds) =>
                    patchRecord({
                      winner_response_seconds: Math.min(300, Math.max(5, seconds)),
                    })
                  }
                  roleMeta={roleMeta}
                  onRoleToggle={handleRoleToggle}
                  onRoleWeightChange={handleRoleWeightChange}
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
            title={t('chatRoll.participantsTitle')}
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
            title={t('chatRoll.winnersTitle')}
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
    </PageStack>
  )
}
