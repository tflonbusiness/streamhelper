import {
  Box,
  Button,
  Chip,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PersonIcon from '@mui/icons-material/Person'
import TimerIcon from '@mui/icons-material/Timer'
import TuneIcon from '@mui/icons-material/Tune'
import { alpha, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { SubscriptionAdminAccountDetail } from '@/api/internal-subscriptions'
import { DatetimeLocalTextField } from '@/components/DatetimeLocalTextField'
import { SectionHeader } from '@/components/SectionHeader'
import { cardSx, inputFieldSx } from '@/theme/colors'

export type SubscriptionAdminDetailMode = 'revoked' | 'trial' | 'paid'

type SubscriptionAdminDetailPanelProps = {
  selected: SubscriptionAdminAccountDetail | null
  mode: SubscriptionAdminDetailMode
  paidPlan: 'pro' | 'studio'
  endsAtLocal: string
  saving: boolean
  accessChip: (account: SubscriptionAdminAccountDetail) => ReactNode
  onModeChange: (mode: SubscriptionAdminDetailMode) => void
  onPaidPlanChange: (plan: 'pro' | 'studio') => void
  onEndsAtChange: (value: string) => void
  onSave: () => void
}

export function SubscriptionAdminDetailPanel({
  selected,
  mode,
  paidPlan,
  endsAtLocal,
  saving,
  accessChip,
  onModeChange,
  onPaidPlanChange,
  onEndsAtChange,
  onSave,
}: SubscriptionAdminDetailPanelProps) {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 16 },
        alignSelf: 'flex-start',
        width: '100%',
      }}
    >
      <Box
        sx={{
          ...cardSx,
          minHeight: { lg: 360 },
          borderRadius: 2,
          overflow: 'hidden',
          ...(selected
            ? {}
            : {
                borderStyle: 'dashed',
                backgroundColor: alpha(theme.palette.background.paper, 0.45),
              }),
        }}
      >
        <Box sx={{ p: 2.5 }}>
          {!selected ? (
            <Stack
              spacing={2}
              sx={{
                py: { xs: 5, lg: 8 },
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TuneIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {t('subscriptionAdmin.emptySelectTitle')}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 280 }}
              >
                {t('subscriptionAdmin.emptySelectBody')}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <SectionHeader
                title={t('subscriptionAdmin.editSectionTitle')}
                description={selected.name}
                icon={TuneIcon}
                iconVariant="primary"
                showDivider={false}
                action={accessChip(selected)}
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2,
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {t('subscriptionAdmin.fieldAccountId')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selected.accountId}
                  </Typography>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    {t('subscriptionAdmin.fieldPlan')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selected.subscriptionPlan}
                  </Typography>
                </Stack>
                {selected.channelSlug ? (
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {t('subscriptionAdmin.columnChannel')}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      @{selected.channelSlug}
                    </Typography>
                  </Stack>
                ) : null}
                {selected.owners.length > 0 ? (
                  <Stack spacing={0.75} sx={{ gridColumn: { sm: '1 / -1' } }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('subscriptionAdmin.fieldOwners')}
                    </Typography>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
                      {selected.owners.map((owner) => (
                        <Chip
                          key={owner.userId}
                          icon={<PersonIcon aria-hidden />}
                          label={owner.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Stack>
                ) : null}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontFamily: 'monospace',
                    gridColumn: { sm: '1 / -1' },
                    wordBreak: 'break-all',
                  }}
                >
                  {selected.ucid}
                </Typography>
              </Box>

              <FormControl component="fieldset" fullWidth>
                <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
                  {t('subscriptionAdmin.modeLabel')}
                </FormLabel>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  value={mode}
                  onChange={(_event, value: SubscriptionAdminDetailMode | null) => {
                    if (value) {
                      onModeChange(value)
                    }
                  }}
                  sx={{
                    flexWrap: 'wrap',
                    gap: 1,
                    '& .MuiToggleButtonGroup-grouped': {
                      flex: { xs: '1 1 100%', sm: '1 1 0' },
                      border: `1px solid ${theme.palette.divider} !important`,
                      borderRadius: '8px !important',
                      textTransform: 'none',
                      py: 1.1,
                    },
                  }}
                >
                  <ToggleButton value="revoked">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <BlockIcon fontSize="small" />
                      <span>{t('subscriptionAdmin.modeRevoked')}</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="trial">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <TimerIcon fontSize="small" />
                      <span>{t('subscriptionAdmin.modeTrial')}</span>
                    </Stack>
                  </ToggleButton>
                  <ToggleButton value="paid">
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <CreditCardIcon fontSize="small" />
                      <span>{t('subscriptionAdmin.modePaid')}</span>
                    </Stack>
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>

              {mode === 'paid' ? (
                <FormControl fullWidth sx={inputFieldSx}>
                  <FormLabel sx={{ mb: 1 }}>{t('subscriptionAdmin.paidPlanLabel')}</FormLabel>
                  <Select
                    value={paidPlan}
                    size="small"
                    onChange={(event) =>
                      onPaidPlanChange(event.target.value as 'pro' | 'studio')
                    }
                  >
                    <MenuItem value="pro">Pro</MenuItem>
                    <MenuItem value="studio">Studio</MenuItem>
                  </Select>
                </FormControl>
              ) : null}

              {mode !== 'revoked' ? (
                <DatetimeLocalTextField
                  label={t('subscriptionAdmin.endsAtLabel')}
                  value={endsAtLocal}
                  onChange={(event) => onEndsAtChange(event.target.value)}
                  fullWidth
                  size="small"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              ) : null}

              <Button
                variant="contained"
                size="large"
                onClick={onSave}
                disabled={saving}
                fullWidth
              >
                {saving ? t('common.saving') : t('subscriptionAdmin.saveCta')}
              </Button>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  )
}
