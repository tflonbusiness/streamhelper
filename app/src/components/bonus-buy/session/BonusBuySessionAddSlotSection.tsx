import { Box, Button, Grid, Stack, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { alpha } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
import { type FormEvent, useState } from 'react'
import type { BonusBuyRecord } from '@/api/bonus-buy'
import { isBonusBuyActive } from '@/api/bonus-buy'
import { IconTile } from '@/components/IconTile'
import {
  StyledSessionCard,
  StyledSessionCardContent,
} from '@/components/prize-spin/session/prizeSpinSessionStyles'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import { useCreateBonusBuySlot } from '@/queries/use-bonus-buy'
import { colors, inputFieldSx } from '@/theme/colors'

type BonusBuySessionAddSlotSectionProps = {
  accountId: number
  bonusBuyId: number
  record: BonusBuyRecord
}

const SectionHeader = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  alignItems: 'stretch',
  justifyContent: 'space-between',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}))

const SectionTitleRow = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  minWidth: 0,
  flex: 1,
})

const FormPanel = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: 12,
  backgroundColor: alpha(colors.neutral[100], 0.02),
  padding: theme.spacing(2),
  transition: 'opacity 0.15s ease',
}))

export const BonusBuySessionAddSlotSection = (
  props: BonusBuySessionAddSlotSectionProps,
) => {
  const { showSuccess } = useNotification()
  const createSlotMutation = useCreateBonusBuySlot(
    props.accountId,
    props.bonusBuyId,
  )
  const active = isBonusBuyActive(props.record)

  const [slotName, setSlotName] = useState('')
  const [nickProvider, setNickProvider] = useState('')
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  async function handleAddSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!active) {
      return
    }

    const trimmedSlot = slotName.trim()
    const parsedPurchase = Number.parseFloat(purchaseAmount)

    if (!trimmedSlot) {
      setFormError('Slot name is required')
      return
    }

    if (!Number.isFinite(parsedPurchase) || parsedPurchase <= 0) {
      setFormError('Purchase amount must be greater than zero')
      return
    }

    try {
      await createSlotMutation.mutateAsync({
        name: trimmedSlot,
        purchaseAmount: parsedPurchase.toFixed(2),
        providerName: nickProvider.trim() || undefined,
      })
      setSlotName('')
      setNickProvider('')
      setPurchaseAmount('')
      showSuccess('Slot added.')
    } catch (addError) {
      setFormError(
        addError instanceof Error ? addError.message : 'Could not add slot',
      )
    }
  }

  return (
    <StyledSessionCard elevation={0}>
      <StyledSessionCardContent>
        <Box component="form" onSubmit={handleAddSlot}>
          <SectionHeader direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <SectionTitleRow>
              <IconTile icon={AddIcon} variant="success" />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                  Quick add slot
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                  Enter slot details and purchase amount in USD
                </Typography>
              </Box>
            </SectionTitleRow>
            <Button
              type="submit"
              variant="contained"
              disabled={!active || createSlotMutation.isPending}
              startIcon={<AddIcon fontSize="small" aria-hidden />}
              sx={{ alignSelf: { xs: 'flex-end', sm: 'auto' }, flexShrink: 0 }}
            >
              {createSlotMutation.isPending ? 'Adding…' : 'Add slot'}
            </Button>
          </SectionHeader>
          <FormPanel sx={!active ? { opacity: 0.55 } : undefined}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  id="session-slot-name"
                  label="Slot"
                  required
                  value={slotName}
                  onChange={(event) => setSlotName(event.target.value)}
                  disabled={!active || createSlotMutation.isPending}
                  fullWidth
                  size="small"
                  sx={inputFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  id="session-nick-provider"
                  label="Nickname"
                  value={nickProvider}
                  onChange={(event) => setNickProvider(event.target.value)}
                  disabled={!active || createSlotMutation.isPending}
                  fullWidth
                  size="small"
                  sx={inputFieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  id="session-purchase"
                  label="Purchase ($)"
                  required
                  type="number"
                  slotProps={{
                    htmlInput: { step: '0.01', min: 0, inputMode: 'decimal' },
                  }}
                  value={purchaseAmount}
                  onChange={(event) => setPurchaseAmount(event.target.value)}
                  disabled={!active || createSlotMutation.isPending}
                  fullWidth
                  size="small"
                  sx={inputFieldSx}
                />
              </Grid>
            </Grid>
            {formError ? (
              <Box sx={{ mt: 2 }}>
                <StatusAlert tone="error">{formError}</StatusAlert>
              </Box>
            ) : null}
          </FormPanel>
        </Box>
      </StyledSessionCardContent>
    </StyledSessionCard>
  )
}
