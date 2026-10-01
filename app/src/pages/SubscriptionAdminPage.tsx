import { Chip, Grid, Stack } from '@mui/material'
import CreditCardIcon from '@mui/icons-material/CreditCard'
import { alpha, useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  fetchSubscriptionAdminAccount,
  searchSubscriptionAdminAccounts,
  SUBSCRIPTION_ADMIN_PAGE_SIZE,
  updateSubscriptionAdminAccount,
  type SubscriptionAdminAccountDetail,
  type SubscriptionAdminSearchItem,
  type SubscriptionAdminSortField,
} from '@/api/internal-subscriptions'
import { AppTable } from '@/components/AppTable'
import { PageHeader } from '@/components/PageHeader'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { SubscriptionAdminDetailPanel } from '@/pages/subscription-admin/SubscriptionAdminDetailPanel'
import { SubscriptionAdminSearchToolbar } from '@/pages/subscription-admin/SubscriptionAdminSearchToolbar'
import {
  buildSubscriptionAdminTableColumns,
  type SubscriptionAdminSortState,
} from '@/pages/subscription-admin/subscriptionAdminTableColumns'
import { mutedChipSx, toneChipSx } from '@/theme/colors'

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
  if (account.subscription.planTier === 'trial') {
    return 'active-trial'
  }
  return 'active-paid'
}

export function SubscriptionAdminPage() {
  const { t, i18n } = useTranslation()
  const theme = useTheme()
  const { showSuccess } = useNotification()
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<SubscriptionAdminSearchItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SubscriptionAdminSortState>({
    field: 'updatedAt',
    direction: 'desc',
  })
  const [selected, setSelected] = useState<SubscriptionAdminAccountDetail | null>(null)
  const [mode, setMode] = useState<AdminMode>('trial')
  const [paidPlan, setPaidPlan] = useState<'pro' | 'max'>('pro')
  const [endsAtLocal, setEndsAtLocal] = useState(defaultEndsAtLocal)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accessChip = useCallback(
    (account: SubscriptionAdminSearchItem | SubscriptionAdminAccountDetail) => {
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
    },
    [t, theme],
  )

  const runSearch = useCallback(async () => {
    setSearching(true)
    setError(null)
    try {
      const response = await searchSubscriptionAdminAccounts({
        query: submittedQuery,
        page,
        pageSize: SUBSCRIPTION_ADMIN_PAGE_SIZE,
        sortBy: sort.field,
        sortOrder: sort.direction,
      })
      setResults(response.items)
      setTotal(response.total)
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : t('errors.failedToLoadSession'),
      )
      setResults([])
      setTotal(0)
    } finally {
      setSearching(false)
    }
  }, [page, sort.direction, sort.field, submittedQuery, t])

  function submitSearch() {
    const trimmed = query.trim()
    if (trimmed.length === 1) {
      return
    }
    setPage(1)
    setSubmittedQuery(trimmed)
  }

  const handleSortField = useCallback((field: SubscriptionAdminSortField) => {
    setSort((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { field, direction: 'asc' }
    })
    setPage(1)
  }, [])

  async function selectAccount(accountId: number) {
    setError(null)
    try {
      const detail = await fetchSubscriptionAdminAccount(accountId)
      setSelected(detail)
      if (!accountHasAccess(detail.subscription)) {
        setMode('revoked')
      } else if (detail.subscription.planTier === 'trial') {
        setMode('trial')
      } else {
        setMode('paid')
        setPaidPlan(detail.subscriptionPlan === 'max' ? 'max' : 'pro')
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
    void runSearch()
  }, [runSearch])

  const tableColumns = useMemo(
    () =>
      buildSubscriptionAdminTableColumns({
        t,
        theme,
        locale: i18n.language,
        sort,
        onSortField: handleSortField,
      }),
    [handleSortField, i18n.language, sort, t, theme],
  )

  const trimmedQuery = query.trim()
  const canSubmit = trimmedQuery.length === 0 || trimmedQuery.length >= 2
  const isFiltered = submittedQuery.length > 0

  const searchToolbar = (
    <SubscriptionAdminSearchToolbar
      query={query}
      submittedQuery={submittedQuery}
      total={total}
      searching={searching}
      canSubmit={canSubmit}
      isFiltered={isFiltered}
      onQueryChange={setQuery}
      onSubmit={submitSearch}
    />
  )

  return (
    <Stack spacing={3}>
      <PageHeader
        title={t('subscriptionAdmin.title')}
        description={t('subscriptionAdmin.description')}
        icon={CreditCardIcon}
        iconVariant="info"
      />

      {error ? <StatusAlert tone="error">{error}</StatusAlert> : null}

      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 9 }}>
          <AppTable
            columns={tableColumns}
            rows={results}
            getRowKey={(row) => row.accountId}
            loading={searching}
            toolbar={searchToolbar}
            emptyMessage={
              !searching ? t('subscriptionAdmin.noResults') : undefined
            }
            pagination={{
              count: total,
              page,
              rowsPerPage: SUBSCRIPTION_ADMIN_PAGE_SIZE,
              onPageChange: setPage,
            }}
            onRowClick={(row) => void selectAccount(row.accountId)}
            getRowSx={(row) =>
              selected?.accountId === row.accountId
                ? {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    boxShadow: `inset 3px 0 0 ${theme.palette.primary.main}`,
                  }
                : undefined
            }
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }}>
          <SubscriptionAdminDetailPanel
            selected={selected}
            mode={mode}
            paidPlan={paidPlan}
            endsAtLocal={endsAtLocal}
            saving={saving}
            accessChip={accessChip}
            onModeChange={setMode}
            onPaidPlanChange={setPaidPlan}
            onEndsAtChange={setEndsAtLocal}
            onSave={() => void handleSave()}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
