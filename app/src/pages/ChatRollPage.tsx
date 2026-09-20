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
import ReplayIcon from '@mui/icons-material/Replay'
import { type ReactNode, useEffect, useState } from 'react'
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
import { PageHeader } from '@/components/PageHeader'
import { useAuth } from '@/context/AuthContext'
import { useNotification } from '@/context/NotificationContext'
import {
  CHAT_ROLL_ROLE_CHIP_LABEL,
  CHAT_ROLL_ROLE_META,
  type ChatRollPageState,
  type ChatRollParticipant,
  type ChatRollRoleId,
  type WeightCombineMode,
  clampRoleWeight,
  computeParticipantCoefficient,
  formatCoefficient,
  getEligibleParticipants,
  loadChatRollState,
  pickWeightedParticipant,
  saveChatRollState,
} from '@/lib/chat-roll'

function NameListCard({
  title,
  emptyLabel,
  removeAriaLabel,
  rows,
  renderRowExtra,
  onClearAll,
  onRemove,
}: {
  title: string
  emptyLabel: string
  removeAriaLabel: string
  rows: { id: string; displayName: string }[]
  renderRowExtra?: (row: { id: string; displayName: string }) => ReactNode
  onClearAll: () => void
  onRemove: (id: string) => void
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
            disabled={rows.length === 0}
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

export function ChatRollPage() {
  const { user } = useAuth()
  const { showError, showSuccess } = useNotification()
  const accountId = user?.accountId

  const [state, setState] = useState<ChatRollPageState | null>(null)
  const [keywordError, setKeywordError] = useState<string | null>(null)

  useEffect(() => {
    if (accountId === undefined) {
      return
    }
    setState(loadChatRollState(accountId))
  }, [accountId])

  useEffect(() => {
    if (accountId === undefined || state === null) {
      return
    }
    saveChatRollState(accountId, state)
  }, [accountId, state])

  function updateState(patch: Partial<ChatRollPageState>) {
    setState((current) => (current ? { ...current, ...patch } : current))
  }

  function handleKeywordChange(value: string) {
    const trimmed = value.trim()
    if (!trimmed) {
      setKeywordError('Keyword is required')
    } else {
      setKeywordError(null)
    }
    updateState({ keyword: value })
  }

  function handleRoleToggle(roleId: ChatRollRoleId, enabled: boolean) {
    if (!state) {
      return
    }
    updateState({
      roles: {
        ...state.roles,
        [roleId]: { ...state.roles[roleId], enabled },
      },
    })
  }

  function handleRoleWeightChange(roleId: ChatRollRoleId, raw: string) {
    if (!state) {
      return
    }
    const parsed = Number.parseFloat(raw)
    updateState({
      roles: {
        ...state.roles,
        [roleId]: {
          ...state.roles[roleId],
          weight: clampRoleWeight(parsed),
        },
      },
    })
  }

  function removeParticipant(id: string) {
    if (!state) {
      return
    }
    updateState({
      participants: state.participants.filter((row) => row.id !== id),
    })
  }

  function removeWinner(id: string) {
    if (!state) {
      return
    }
    updateState({
      winners: state.winners.filter((row) => row.id !== id),
    })
  }

  function handleRoll() {
    if (!state) {
      return
    }

    const winner = pickWeightedParticipant(
      state.participants,
      state.roles,
      state.combineMode,
    )

    if (!winner) {
      showError('No eligible participants to roll.')
      return
    }

    updateState({
      winners: [
        {
          id: `w-${Date.now()}`,
          displayName: winner.displayName,
        },
        ...state.winners,
      ],
      participants: state.excludeWinnerAfterRoll
        ? state.participants.filter((participant) => participant.id !== winner.id)
        : state.participants,
    })
    showSuccess(`${winner.displayName} won the roll.`)
  }

  function renderParticipantExtra(participant: ChatRollParticipant) {
    if (!state) {
      return null
    }

    const coefficient = computeParticipantCoefficient(
      participant,
      state.roles,
      state.combineMode,
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
        <CoefficientChip
          label={formatCoefficient(coefficient)}
          size="small"
        />
      </ParticipantExtraStack>
    )
  }

  if (!state) {
    return null
  }

  const eligibleCount = getEligibleParticipants(
    state.participants,
    state.roles,
    state.combineMode,
  ).length

  return (
    <PageStack>
      <PageHeader
        title="Chat Roll"
        description="Weighted chat giveaway for your stream"
        icon={CasinoIcon}
        iconVariant="info"
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
                  value={state.keyword}
                  onChange={(event) => handleKeywordChange(event.target.value)}
                  error={Boolean(keywordError)}
                  helperText={keywordError ?? ' '}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 9 }}>
                <FormControl component="fieldset" size="small" fullWidth>
                  <CombineFormLabel>Weight combine</CombineFormLabel>
                  <CombineRadioGroup
                    row
                    value={state.combineMode}
                    onChange={(event) =>
                      updateState({
                        combineMode: event.target.value as WeightCombineMode,
                      })
                    }
                  >
                    <CombineOption
                      value="highest"
                      control={<Radio size="small" />}
                      label="Highest"
                    />
                    <CombineOption
                      value="sum"
                      control={<Radio size="small" />}
                      label="Sum"
                    />
                  </CombineRadioGroup>
                  <ExclusionToggleRow>
                    <Switch
                      size="small"
                      checked={state.excludeWinnerAfterRoll}
                      onChange={(event) =>
                        updateState({
                          excludeWinnerAfterRoll: event.target.checked,
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
                      checked={state.replyInChat}
                      onChange={(event) =>
                        updateState({ replyInChat: event.target.checked })
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
                  const setting = state.roles[role.id]
                  return (
                    <Grid key={role.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <RoleRowStack enabled={setting.enabled}>
                        <Switch
                          size="small"
                          checked={setting.enabled}
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
                          disabled={!setting.enabled}
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
          disabled={eligibleCount === 0}
        >
          Roll
        </RollButton>
      </RollActionBar>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <NameListCard
            title="Participants"
            emptyLabel="No participants yet."
            removeAriaLabel="Remove participant"
            rows={state.participants}
            renderRowExtra={(row) =>
              renderParticipantExtra(row as ChatRollParticipant)
            }
            onClearAll={() => updateState({ participants: [] })}
            onRemove={removeParticipant}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <NameListCard
            title="Winners"
            emptyLabel="No winners yet."
            removeAriaLabel="Remove winner"
            rows={state.winners}
            onClearAll={() => updateState({ winners: [] })}
            onRemove={removeWinner}
          />
        </Grid>
      </Grid>
    </PageStack>
  )
}
