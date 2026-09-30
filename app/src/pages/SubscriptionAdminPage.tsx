import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormLabel,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import TimerIcon from '@mui/icons-material/Timer'
import TuneIcon from '@mui/icons-material/Tune'
import { alpha, useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fetchSubscriptionAdminAccount,
  searchSubscriptionAdminAccounts,
  updateSubscriptionAdminAccount,
  type SubscriptionAdminAccountDetail,
  type SubscriptionAdminSearchItem,
} from '@/api/internal-subscriptions'
import { PageHeader } from '@/components/PageHeader'
import { SectionHeader } from '@/components/SectionHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { cardSx, inputFieldSx, mutedChipSx, toneChipSx } from '@/theme/colors'

type AdminMode = 'revoked' | 'trial' | 'paid'

function defaultEndsAtLocal(): string {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString()
}

function accountHasAccess(
  subscription: SubscriptionAdminSearchItem['subscription'],
): boolean {
  return subscription.hasAccess === true
}

function accessKind(
  account: SubscriptionAdminSearchItem | SubscriptionAdminAccountDetail,
): AdminMode | 'active-trial' | 'active-paid' | 'none' {
  if (!accountHasAccess(account.subscription)) {
    return 'none'
  }
  if (account.subscription.kind === 'trial') {
    return 'active-trial'
  }
  return 'active-paid'
}

export function SubscriptionAdminPage() {
  const { t } = useTranslation()
  const theme = useTheme()
  const { showSuccess } = useNotification()
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SubscriptionAdminSearchItem[]>([])
  const [selected, setSelected] = useState<SubscriptionAdminAccountDetail | null>(null)
  const [mode, setMode] = useState<AdminMode>('trial')
  const [paidPlan, setPaidPlan] = useState<'pro' | 'studio'>('pro')
  const [endsAtLocal, setEndsAtLocal] = useState(defaultEndsAtLocal)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function accessChip(
    account: SubscriptionAdminSearchItem | SubscriptionAdminAccountDetail,
  ) {
    const kind = accessKind(account)
    if (kind === 'none') {
      return (
        <Chip
          label={t('subscriptionAdmin.chipNoAccess')}
          size="small"
          sx={mutedChipSx(theme)}
        />
      )
    }
    if (kind === 'active-trial') {
      return (
        <Chip
          label={t('subscriptionAdmin.chipTrial')}
          size="small"
          sx={toneChipSx(theme.palette.info.light)}
        />
      )
    }
    return (
      <Chip
        label={t('subscriptionAdmin.chipPaid', { plan: account.subscriptionPlan })}
        size="small"
        sx={toneChipSx(theme.palette.success.light)}
      />
    )
  }

  const runSearch = useCallback(async () => {
    const trimmed = query.trim()
    if (trimmed.length < 1) {
      setResults([])
      return
    }

    setSearching(true)
    setError(null)
    try {
      const items = await searchSubscriptionAdminAccounts(trimmed)
      setResults(items)
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : t('errors.failedToLoadSession'),
      )
      setResults([])
    } finally {
      setSearching(false)
    }
  }, [query, t])

  async function selectAccount(accountId: number) {
    setError(null)
    try {
      const detail = await fetchSubscriptionAdminAccount(accountId)
      setSelected(detail)
      if (!accountHasAccess(detail.subscription)) {
        setMode('revoked')
      } else if (detail.subscription.kind === 'trial') {
        setMode('trial')
      } else {
        setMode('paid')
        setPaidPlan(detail.subscriptionPlan === 'studio' ? 'studio' : 'pro')
      }
      if (detail.subscription.endsAt) {
        const parsed = new Date(detail.subscription.endsAt)
        if (!Number.isNaN(parsed.getTime())) {
          const pad = (n: number) => String(n).padStart(2, '0')
          setEndsAtLocal(
            `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
          )
        }
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t('errors.failedToLoadSession'),
      )
    }
  }

  async function handleSave() {
    if (!selected) {
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload =
        mode === 'revoked'
          ? { mode: 'revoked' as const }
          : {
              mode,
              endsAt: localInputToIso(endsAtLocal),
              ...(mode === 'paid' ? { paidPlan } : {}),
            }

      const updated = await updateSubscriptionAdminAccount(
        selected.accountId,
        payload,
      )
      setSelected(updated)
      setResults((prev) =>
        prev.map((row) =>
          row.accountId === updated.accountId ? { ...row, ...updated } : row,
        ),
      )
      showSuccess(t('subscriptionAdmin.savedSuccess', { name: updated.name }))
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : t('errors.failedToLoadSession'),
      )
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timer = window.setTimeout(() => {
      void runSearch()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [query, runSearch])

  const trimmedQuery = query.trim()
  const showNoResults =
    trimmedQuery.length >= 2 && !searching && results.length === 0

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('subscriptionAdmin.title')}
        description={t('subscriptionAdmin.description')}
        icon={CreditCardIcon}
        iconVariant="info"
      />

      {error ? <StatusAlert tone="error">{error}</StatusAlert> : null}

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={cardSx}>
            <CardContent sx={{ pt: 1 }}>
              <SectionHeader
                title={t('subscriptionAdmin.searchSectionTitle')}
                description={t('subscriptionAdmin.searchHint')}
                icon={SearchIcon}
                iconVariant="info"
                showDivider={false}
              />

              <TextField
                label={t('subscriptionAdmin.searchLabel')}
                placeholder={t('subscriptionAdmin.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                fullWidth
                sx={{ ...inputFieldSx, mt: 2 }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Box sx={{ mt: 2, minHeight: 120 }}>
                {trimmedQuery.length < 2 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('subscriptionAdmin.searchPrompt')}
                  </Typography>
                ) : null}

                {searching ? (
                  <Stack spacing={1}>
                    {[0, 1, 2].map((key) => (
                      <Skeleton key={key} variant="rounded" height={64} />
                    ))}
                  </Stack>
                ) : null}

                {showNoResults ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('subscriptionAdmin.noResults')}
                  </Typography>
                ) : null}

                {!searching && results.length > 0 ? (
                  <List
                    disablePadding
                    sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    {results.map((row, index) => {
                      const isSelected = selected?.accountId === row.accountId
                      return (
                        <ListItemButton
                          key={row.accountId}
                          selected={isSelected}
                          onClick={() => void selectAccount(row.accountId)}
                          sx={{
                            alignItems: 'flex-start',
                            py: 1.5,
                            borderTop:
                              index === 0
                                ? undefined
                                : `1px solid ${theme.palette.divider}`,
                            '&.Mui-selected': {
                              backgroundColor: alpha(
                                theme.palette.primary.main,
                                0.08,
                              ),
                            },
                          }}
                        >
                          <ListItemText
                            primary={
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                flexWrap="wrap"
                                useFlexGap
                              >
                                <Typography variant="subtitle2" component="span">
                                  {row.name}
                                </Typography>
                                {accessChip(row)}
                              </Stack>
                            }
                            secondary={
                              <Stack
                                component="span"
                                spacing={0.25}
                                sx={{ mt: 0.5 }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="span"
                                  display="block"
                                >
                                  #{row.accountId}
                                  {row.channelSlug ? ` · @${row.channelSlug}` : ''}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="span"
                                  display="block"
                                  sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}
                                >
                                  {row.ucid}
                                </Typography>
                              </Stack>
                            }
                          />
                        </ListItemButton>
                      )
                    })}
                  </List>
                ) : null}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card
            sx={{
              ...cardSx,
              minHeight: { lg: 420 },
              ...(selected
                ? {}
                : {
                    borderStyle: 'dashed',
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  }),
            }}
          >
            <CardContent sx={{ pt: 1 }}>
              {!selected ? (
                <Stack
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ py: { xs: 4, md: 8 }, textAlign: 'center' }}
                >
                  <TuneIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                  <Typography variant="h6">
                    {t('subscriptionAdmin.emptySelectTitle')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" maxWidth={360}>
                    {t('subscriptionAdmin.emptySelectBody')}
                  </Typography>
                </Stack>
              ) : (
                <>
                  <SectionHeader
                    title={t('subscriptionAdmin.editSectionTitle')}
                    description={selected.name}
                    icon={TuneIcon}
                    iconVariant="primary"
                    showDivider={false}
                    action={accessChip(selected)}
                  />

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    sx={{ mt: 2, mb: 3 }}
                    useFlexGap
                  >
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('subscriptionAdmin.fieldAccountId')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selected.accountId}
                      </Typography>
                    </Stack>
                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">
                        {t('subscriptionAdmin.fieldPlan')}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selected.subscriptionPlan}
                      </Typography>
                    </Stack>
                    {selected.owners.length > 0 ? (
                      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('subscriptionAdmin.fieldOwners')}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
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
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontFamily: 'monospace', display: 'block', mb: 3 }}
                  >
                    {selected.ucid}
                  </Typography>

                  <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
                    <FormLabel sx={{ mb: 1, fontWeight: 600 }}>
                      {t('subscriptionAdmin.modeLabel')}
                    </FormLabel>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      value={mode}
                      onChange={(_event, value: AdminMode | null) => {
                        if (value) {
                          setMode(value)
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
                          py: 1.25,
                        },
                      }}
                    >
                      <ToggleButton value="revoked">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <BlockIcon fontSize="small" />
                          <span>{t('subscriptionAdmin.modeRevoked')}</span>
                        </Stack>
                      </ToggleButton>
                      <ToggleButton value="trial">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TimerIcon fontSize="small" />
                          <span>{t('subscriptionAdmin.modeTrial')}</span>
                        </Stack>
                      </ToggleButton>
                      <ToggleButton value="paid">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CreditCardIcon fontSize="small" />
                          <span>{t('subscriptionAdmin.modePaid')}</span>
                        </Stack>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </FormControl>

                  {mode === 'paid' ? (
                    <FormControl fullWidth sx={{ ...inputFieldSx, mb: 2 }}>
                      <FormLabel sx={{ mb: 1 }}>{t('subscriptionAdmin.paidPlanLabel')}</FormLabel>
                      <Select
                        value={paidPlan}
                        onChange={(event) =>
                          setPaidPlan(event.target.value as 'pro' | 'studio')
                        }
                      >
                        <MenuItem value="pro">Pro</MenuItem>
                        <MenuItem value="studio">Studio</MenuItem>
                      </Select>
                    </FormControl>
                  ) : null}

                  {mode !== 'revoked' ? (
                    <TextField
                      label={t('subscriptionAdmin.endsAtLabel')}
                      type="datetime-local"
                      value={endsAtLocal}
                      onChange={(event) => setEndsAtLocal(event.target.value)}
                      fullWidth
                      sx={{ ...inputFieldSx, mb: 3 }}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  ) : null}

                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    fullWidth
                  >
                    {saving ? t('common.saving') : t('subscriptionAdmin.saveCta')}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
