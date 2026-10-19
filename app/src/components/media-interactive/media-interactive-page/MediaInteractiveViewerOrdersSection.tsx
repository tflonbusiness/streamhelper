import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import RedeemIcon from '@mui/icons-material/Redeem'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { KickChannelRewardOption } from '@/api/media-interactive'
import { SectionHeader } from '@/components/SectionHeader'
import {
  StyledCard,
  StyledCardContent,
  StyledRewardGrid,
  StyledRewardTile,
  StyledRewardTileBadges,
  StyledRewardTileBody,
  StyledRewardTileReason,
  StyledRewardTileSwitch,
  StyledViewerOrdersLimitPanel,
  StyledViewerOrdersRewardsHeader,
  StyledViewerOrdersStepBadge,
  StyledViewerOrdersStepRow,
  StyledViewerOrdersSteps,
} from '@/components/media-interactive/media-interactive-page/media-interactive-page-styles'
import { useNotification } from '@/context/NotificationContext'
import { inputFieldSx } from '@/theme/colors'
import {
  useKickChannelRewards,
  useMediaInteractiveMutations,
  useMediaInteractiveSettings,
} from '@/queries/use-media-interactive'

type MediaInteractiveViewerOrdersSectionProps = {
  accountId: number
}

function formatDurationHint(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s} s`
  if (s === 0) return `${m} min`
  return `${m} min ${s} s`
}

function RewardTile({
  reward,
  checked,
  disabled,
  onToggle,
}: {
  reward: KickChannelRewardOption
  checked: boolean
  disabled: boolean
  onToggle: () => void
}) {
  const { t } = useTranslation()
  const missingLinkInput = !reward.isUserInputRequired
  const isInactive = !reward.isEnabled
  const canEnable = !missingLinkInput
  const switchDisabled = disabled || (missingLinkInput && !checked)
  const tileUnavailable = missingLinkInput && !checked

  return (
    <StyledRewardTile
      selected={checked}
      disabled={disabled && !checked}
      unavailable={tileUnavailable}
      role="button"
      tabIndex={switchDisabled ? -1 : 0}
      onClick={() => {
        if (!switchDisabled) onToggle()
      }}
      onKeyDown={(e) => {
        if (switchDisabled) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
    >
      <StyledRewardTileBody>
        <Typography variant="body2" fontWeight={600} component="p" sx={{ m: 0 }}>
          {reward.title}
        </Typography>
        <StyledRewardTileBadges>
          <Chip
            size="small"
            label={t('mediaInteractive.kickRewardCost', { cost: reward.cost })}
            color={checked ? 'primary' : 'default'}
            variant={checked ? 'filled' : 'outlined'}
          />
          {isInactive && (
            <Chip
              size="small"
              label={t('mediaInteractive.kickRewardDisabled')}
              variant="outlined"
            />
          )}
          {missingLinkInput && (
            <Chip
              size="small"
              color="warning"
              variant="outlined"
              label={t('mediaInteractive.kickRewardNoInputShort')}
            />
          )}
          {checked && canEnable && (
            <Chip
              size="small"
              color="success"
              variant="outlined"
              icon={<CheckCircleOutlineOutlinedIcon />}
              label={t('mediaInteractive.viewerOrdersRewardActive')}
            />
          )}
        </StyledRewardTileBadges>
        {missingLinkInput && (
          <StyledRewardTileReason component="p">
            {t('mediaInteractive.kickRewardUnavailableReason')}
          </StyledRewardTileReason>
        )}
      </StyledRewardTileBody>
      <StyledRewardTileSwitch>
        <Switch
          checked={checked}
          disabled={switchDisabled}
          onClick={(e) => e.stopPropagation()}
          onChange={() => {
            if (!switchDisabled) onToggle()
          }}
          inputProps={{ 'aria-label': reward.title }}
        />
      </StyledRewardTileSwitch>
    </StyledRewardTile>
  )
}

export function MediaInteractiveViewerOrdersSection({
  accountId,
}: MediaInteractiveViewerOrdersSectionProps) {
  const { t } = useTranslation()
  const { showError, showSuccess } = useNotification()
  const { data: settings, isLoading: settingsLoading } =
    useMediaInteractiveSettings(accountId)
  const {
    data: kickRewards,
    isLoading: rewardsLoading,
    isError: rewardsError,
    error: rewardsErrorDetail,
  } = useKickChannelRewards(accountId, true)
  const mutations = useMediaInteractiveMutations(accountId)

  const selectedIds = settings?.kickRewardIds ?? []
  const [maxDurationDraft, setMaxDurationDraft] = useState<number | null>(null)

  useEffect(() => {
    if (settings && maxDurationDraft === null) {
      setMaxDurationDraft(settings.maxViewerTrackDurationSeconds)
    }
  }, [settings, maxDurationDraft])

  const limitDirty = useMemo(() => {
    if (!settings || maxDurationDraft === null) return false
    return settings.maxViewerTrackDurationSeconds !== maxDurationDraft
  }, [settings, maxDurationDraft])

  const toggleReward = (reward: KickChannelRewardOption) => {
    const isOn = selectedIds.includes(reward.id)
    if (!reward.isUserInputRequired && !isOn) {
      return
    }
    const next = isOn
      ? selectedIds.filter((id) => id !== reward.id)
      : [...selectedIds, reward.id]
    void mutations.patchSettings
      .mutateAsync({ kickRewardIds: next })
      .catch(() => {
        showError(t('mediaInteractive.viewerOrdersSaveError'))
      })
  }

  const saveMaxDuration = () => {
    if (maxDurationDraft === null) return
    void mutations.patchSettings
      .mutateAsync({ maxViewerTrackDurationSeconds: maxDurationDraft })
      .then(() => showSuccess(t('mediaInteractive.viewerOrdersLimitSaved')))
      .catch(() => showError(t('mediaInteractive.viewerOrdersSaveError')))
  }

  const loading = settingsLoading || rewardsLoading
  const selectedCount = selectedIds.length
  const steps = [
    t('mediaInteractive.viewerOrdersStep1'),
    t('mediaInteractive.viewerOrdersStep2'),
    t('mediaInteractive.viewerOrdersStep3'),
  ]

  return (
    <StyledCard>
      <StyledCardContent>
        <SectionHeader
          title={t('mediaInteractive.viewerOrdersTitle')}
          description={t('mediaInteractive.viewerOrdersDescription')}
          icon={RedeemIcon}
          iconVariant="primary"
          showDivider={false}
        />

        <StyledViewerOrdersSteps>
          {steps.map((text, index) => (
            <StyledViewerOrdersStepRow key={index}>
              <StyledViewerOrdersStepBadge aria-hidden>
                {index + 1}
              </StyledViewerOrdersStepBadge>
              <Typography variant="body2" color="text.secondary">
                {text}
              </Typography>
            </StyledViewerOrdersStepRow>
          ))}
        </StyledViewerOrdersSteps>

        {loading ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t('mediaInteractive.kickRewardsLoading')}
            </Typography>
          </Stack>
        ) : rewardsError ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {rewardsErrorDetail instanceof Error &&
            rewardsErrorDetail.message.toLowerCase().includes('sign in')
              ? t('mediaInteractive.kickRewardsReauthHint')
              : t('mediaInteractive.kickRewardsLoadError')}
          </Alert>
        ) : kickRewards && kickRewards.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t('mediaInteractive.kickRewardsEmpty')}
          </Alert>
        ) : (
          <Box sx={{ mt: 2.5 }}>
            <StyledViewerOrdersRewardsHeader>
              <Typography
                variant="subtitle2"
                component="span"
                sx={{ m: 0, flexShrink: 0 }}
              >
                {t('mediaInteractive.viewerOrdersRewardsListTitle')}
              </Typography>
              <Chip
                size="small"
                label={t('mediaInteractive.viewerOrdersSelectedCount', {
                  count: selectedCount,
                })}
                color={selectedCount > 0 ? 'primary' : 'default'}
                variant={selectedCount > 0 ? 'filled' : 'outlined'}
              />
            </StyledViewerOrdersRewardsHeader>

            {selectedCount === 0 && (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                {t('mediaInteractive.viewerOrdersNoneEnabled')}
              </Alert>
            )}

            <StyledRewardGrid component="div">
              {kickRewards?.map((reward) => (
                <RewardTile
                  key={reward.id}
                  reward={reward}
                  checked={selectedIds.includes(reward.id)}
                  disabled={mutations.patchSettings.isPending}
                  onToggle={() => toggleReward(reward)}
                />
              ))}
            </StyledRewardGrid>
          </Box>
        )}

        <StyledViewerOrdersLimitPanel>
          <Typography variant="subtitle2" gutterBottom>
            {t('mediaInteractive.viewerOrdersLimitTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('mediaInteractive.viewerOrdersLimitHint')}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', sm: 'flex-end' }}
          >
            <TextField
              size="small"
              type="number"
              label={t('mediaInteractive.maxDuration')}
              value={maxDurationDraft ?? ''}
              disabled={maxDurationDraft === null}
              onChange={(e) => setMaxDurationDraft(Number(e.target.value))}
              helperText={
                maxDurationDraft !== null
                  ? t('mediaInteractive.viewerOrdersDurationPreview', {
                      formatted: formatDurationHint(maxDurationDraft),
                    })
                  : undefined
              }
              sx={{ ...inputFieldSx, minWidth: { sm: 220 } }}
            />
            <Button
              variant={limitDirty ? 'contained' : 'outlined'}
              size="small"
              disabled={
                maxDurationDraft === null ||
                mutations.patchSettings.isPending ||
                !limitDirty
              }
              onClick={saveMaxDuration}
              sx={{ flexShrink: 0, height: 40 }}
            >
              {t('mediaInteractive.viewerOrdersSaveLimit')}
            </Button>
          </Stack>
        </StyledViewerOrdersLimitPanel>
      </StyledCardContent>
    </StyledCard>
  )
}
