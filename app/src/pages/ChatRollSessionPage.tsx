import {
  Button,
  FormControl,
  Grid,
  IconButton,
  Radio,
  Switch,
} from '@mui/material'
import CasinoIcon from '@mui/icons-material/Casino'
import DeleteIcon from '@mui/icons-material/Delete'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { type ReactNode, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { ChatRollParticipant } from '@/api/chat-roll'
import { isChatRollReadOnly } from '@/api/chat-roll'
import {
  CoefficientChip,
  CombineFormLabel,
  CombineOption,
  CombineRadioGroup,
  EmptyListText,
  ExclusionToggleLabel,
  ExclusionToggleRow,
  KeywordField,
  ListCard,
  ListCardContent,
  ListHeaderStack,
  ListRowName,
  ListRowStack,
  ListRowsStack,
  ListTitle,
  PageStack,
  ParticipantExtraStack,
  RoleLabel,
  RoleRowStack,
  RolesSection,
  RoleTagChip,
  RoleWeightField,
  SettingsCard,
  SettingsCardContent,
  SettingsSectionLabel,
  RollActionBar,
  RollButton,
  SettingsStack,
  SettingsTitle,
} from '@/components/chat-roll/chatRollPageStyles'
import { ChatRollDeactivateSessionDialog } from '@/components/chat-roll/session/ChatRollDeactivateSessionDialog'
import { ChatRollSessionArchiveDialog } from '@/components/chat-roll/session/ChatRollSessionArchiveDialog'
import { ChatRollSessionErrorState } from '@/components/chat-roll/session/ChatRollSessionErrorState'
import { ChatRollSessionHeaderSection } from '@/components/chat-roll/session/ChatRollSessionHeaderSection'
import { ChatRollSessionLoadingState } from '@/components/chat-roll/session/ChatRollSessionLoadingState'
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { useSetBreadcrumbLabel } from '@/context/BreadcrumbContext'
import { useNotification } from '@/context/NotificationContext'
import {
  CHAT_ROLL_ROLE_CHIP_LABEL,
  CHAT_ROLL_ROLE_META,
  type ChatRollRoleId,
  type WeightCombineMode,
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

function NameListCard({
  title,
  emptyLabel,
  removeAriaLabel,
  rows,
  renderRowExtra,
  onClearAll,
  onRemove,
  readOnly,
}: {
  title: string
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
        <ListHeaderStack>
          <ListTitle variant="subtitle1">{title}</ListTitle>
          <Button
            size="small"
            variant="text"
            onClick={onClearAll}
            disabled={rows.length === 0 || readOnly}
          >
            Clear all
          </Button>
        </ListHeaderStack>

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
  const { id } = useParams()
  const chatRollId = Number.parseInt(id ?? '', 10)
  const isValidId = Number.isFinite(chatRollId)
  const { user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const [keywordError, setKeywordError] = useState<string | null>(null)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [archiveSessionDialogOpen, setArchiveSessionDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)

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

  const error = !isValidId
    ? 'Session not found'
    : sessionError instanceof Error
      ? sessionError.message
      : sessionError
        ? 'Could not load chat roll session'
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
    return <ChatRollSessionErrorState message={error ?? 'Session not found'} />
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
            : 'Could not save settings',
        )
      },
    })
  }

  function handleKeywordBlur() {
    const trimmed = keywordDraft.trim()
    if (!trimmed) {
      setKeywordError('Keyword is required')
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
        showSuccess(`${win.displayName} won the roll.`)
      },
      onError: (rollError) => {
        showError(
          rollError instanceof Error
            ? rollError.message
            : 'No eligible participants to roll.',
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
            label={CHAT_ROLL_ROLE_CHIP_LABEL[roleId]}
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

  return (
    <PageStack>
      <PageHeader
        title="Chat Roll"
        description="Weighted chat giveaway for your stream"
        icon={CasinoIcon}
        iconVariant="info"
      />

      <ChatRollSessionHeaderSection
        accountId={accountId}
        chatRollId={chatRollId}
        record={record}
        onOpenArchiveDialog={() => setArchiveSessionDialogOpen(true)}
        onOpenDeactivateDialog={() => setDeactivateDialogOpen(true)}
      />

      <SettingsCard elevation={0}>
        <SettingsCardContent>
          <SettingsTitle variant="subtitle2">Settings</SettingsTitle>

          <SettingsStack>
            <Grid container spacing={1.5} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                <KeywordField
                  label="Keyword"
                  size="small"
                  value={keywordDraft}
                  onChange={(event) => {
                    setKeywordDraft(event.target.value)
                    if (event.target.value.trim()) {
                      setKeywordError(null)
                    }
                  }}
                  onBlur={handleKeywordBlur}
                  error={Boolean(keywordError)}
                  helperText={keywordError ?? ' '}
                  fullWidth
                  disabled={settingsDisabled}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                <FormControl component="fieldset" size="small" fullWidth>
                  <CombineFormLabel>Weight combine</CombineFormLabel>
                  <CombineRadioGroup
                    row
                    value={record.combineMode}
                    onChange={(event) =>
                      patchRecord({
                        combine_mode: event.target.value as WeightCombineMode,
                      })
                    }
                  >
                    <CombineOption
                      value="highest"
                      control={<Radio size="small" disabled={settingsDisabled} />}
                      label="Highest"
                      disabled={settingsDisabled}
                    />
                    <CombineOption
                      value="sum"
                      control={<Radio size="small" disabled={settingsDisabled} />}
                      label="Sum"
                      disabled={settingsDisabled}
                    />
                  </CombineRadioGroup>
                  <ExclusionToggleRow>
                    <Switch
                      size="small"
                      checked={record.excludeWinnerAfterRoll}
                      disabled={settingsDisabled}
                      onChange={(event) =>
                        patchRecord({
                          exclude_winner_after_roll: event.target.checked,
                        })
                      }
                    />
                    <ExclusionToggleLabel variant="body2">
                      Exclude winner from pool after roll
                    </ExclusionToggleLabel>
                  </ExclusionToggleRow>
                  <ExclusionToggleRow>
                    <Switch
                      size="small"
                      checked={record.replyInChat}
                      disabled={settingsDisabled}
                      onChange={(event) =>
                        patchRecord({ reply_in_chat: event.target.checked })
                      }
                    />
                    <ExclusionToggleLabel variant="body2">
                      Reply in Kick chat when someone joins
                    </ExclusionToggleLabel>
                  </ExclusionToggleRow>
                </FormControl>
              </Grid>
            </Grid>

            <RolesSection>
              <SettingsSectionLabel>Eligible roles</SettingsSectionLabel>
              <Grid container spacing={1}>
                {CHAT_ROLL_ROLE_META.map((role) => {
                  const setting = record.roleSettings[role.id]
                  return (
                    <Grid key={role.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <RoleRowStack enabled={setting.enabled}>
                        <Switch
                          size="small"
                          checked={setting.enabled}
                          disabled={settingsDisabled}
                          onChange={(event) =>
                            handleRoleToggle(role.id, event.target.checked)
                          }
                        />
                        <RoleLabel variant="body2" noWrap>
                          {role.label}
                        </RoleLabel>
                        <RoleWeightField
                          size="small"
                          type="number"
                          label="×"
                          value={setting.weight}
                          disabled={!setting.enabled || settingsDisabled}
                          onChange={(event) =>
                            handleRoleWeightChange(role.id, event.target.value)
                          }
                          slotProps={{
                            htmlInput: { min: 0.1, max: 100, step: 0.1 },
                          }}
                        />
                      </RoleRowStack>
                    </Grid>
                  )
                })}
              </Grid>
            </RolesSection>
          </SettingsStack>
        </SettingsCardContent>
      </SettingsCard>

      <RollActionBar>
        <RollButton
          variant="contained"
          startIcon={<ReplayIcon />}
          onClick={handleRoll}
          disabled={readOnly || eligibleCount === 0 || rollMutation.isPending}
        >
          Roll
        </RollButton>
        <Button
          variant="outlined"
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
          {record.isAcceptingParticipants ? 'Pause entries' : 'Resume entries'}
        </Button>
      </RollActionBar>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <NameListCard
            title="Participants"
            emptyLabel="No participants yet."
            removeAriaLabel="Remove participant"
            rows={participants}
            renderRowExtra={(row) =>
              renderParticipantExtra(
                participants.find(
                  (participant) => participant.id === row.id,
                )!,
              )
            }
            readOnly={readOnly}
            onClearAll={() =>
              deleteAllParticipantsMutation.mutate(undefined, {
                onError: () => showError('Could not clear participants.'),
              })
            }
            onRemove={(participantId) =>
              deleteParticipantMutation.mutate(participantId, {
                onError: () => showError('Could not remove participant.'),
              })
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NameListCard
            title="Winners"
            emptyLabel="No winners yet."
            removeAriaLabel="Remove winner"
            rows={wins}
            readOnly={readOnly}
            onClearAll={() =>
              deleteAllWinsMutation.mutate(undefined, {
                onError: () => showError('Could not clear winners.'),
              })
            }
            onRemove={(winId) =>
              deleteWinMutation.mutate(winId, {
                onError: () => showError('Could not remove winner.'),
              })
            }
          />
        </Grid>
      </Grid>

      <ChatRollSessionArchiveDialog
        accountId={accountId}
        chatRollId={chatRollId}
        record={record}
        open={archiveSessionDialogOpen}
        onClose={() => setArchiveSessionDialogOpen(false)}
      />
      <ChatRollDeactivateSessionDialog
        accountId={accountId}
        chatRollId={chatRollId}
        open={deactivateDialogOpen}
        onClose={() => setDeactivateDialogOpen(false)}
      />
    </PageStack>
  )
}
