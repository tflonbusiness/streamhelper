import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { type FormEvent, useEffect, useState } from 'react'
import { StatusAlert } from '@/components/StatusAlert'
import { useNotification } from '@/context/NotificationContext'
import {
  usePatchPrizeSpinWidget,
  usePrizeSpinWidget,
} from '@/queries/use-prize-spins'

type PrizeSpinWidgetSettingsDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
}

const StyledLoadingText = styled(Typography)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2),
  paddingTop: theme.spacing(1),
}))

const StyledSizeField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const PrizeSpinWidgetSettingsDialog = (
  props: PrizeSpinWidgetSettingsDialogProps,
) => {
  const { showSuccess, showError } = useNotification()
  const [width, setWidth] = useState('500')
  const [height, setHeight] = useState('500')
  const [validationError, setValidationError] = useState<string | null>(null)

  const {
    data: widgetSettings,
    isLoading,
    error: loadError,
  } = usePrizeSpinWidget(props.accountId, props.open)

  const patchMutation = usePatchPrizeSpinWidget(props.accountId)

  useEffect(() => {
    if (props.open && widgetSettings) {
      setWidth(String(widgetSettings.width))
      setHeight(String(widgetSettings.height))
    }
  }, [props.open, widgetSettings])

  useEffect(() => {
    if (!loadError) {
      return
    }

    showError(
      loadError instanceof Error
        ? loadError.message
        : 'Could not load widget settings',
    )
  }, [loadError, showError])

  const handleClose = () => {
    props.onClose()
    setValidationError(null)

    if (!patchMutation.isPending) {
      patchMutation.reset()
    }
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedWidth = Number.parseInt(width, 10)
    const parsedHeight = Number.parseInt(height, 10)

    if (!Number.isFinite(parsedWidth) || parsedWidth < 200 || parsedWidth > 2400) {
      setValidationError('Width must be between 200 and 2400 px.')
      return
    }

    if (!Number.isFinite(parsedHeight) || parsedHeight < 200 || parsedHeight > 2400) {
      setValidationError('Height must be between 200 and 2400 px.')
      return
    }

    setValidationError(null)

    patchMutation.mutate(
      { width: parsedWidth, height: parsedHeight },
      {
        onSuccess: () => {
          showSuccess('Widget settings saved')
          handleClose()
          patchMutation.reset()
        },
        onError: (error) => {
          showError(
            error instanceof Error
              ? error.message
              : 'Could not save widget settings',
          )
        },
      },
    )
  }

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Widget settings</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <StyledLoadingText>Loading settings…</StyledLoadingText>
        ) : (
          <Box
            component="form"
            id="prize-spin-widget-settings-form"
            onSubmit={handleSave}
          >
            <StyledFormStack>
              <StyledSizeField
                label="Width"
                type="number"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                slotProps={{
                  htmlInput: { min: 200, max: 2400, step: 1 },
                }}
                fullWidth
                size="small"
              />
              <StyledSizeField
                label="Height"
                type="number"
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                slotProps={{
                  htmlInput: { min: 200, max: 2400, step: 1 },
                }}
                fullWidth
                size="small"
              />
              {validationError ? (
                <StatusAlert tone="error">{validationError}</StatusAlert>
              ) : null}
            </StyledFormStack>
          </Box>
        )}
      </DialogContent>
      <StyledDialogActions>
        <Button type="button" variant="outlined" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="prize-spin-widget-settings-form"
          variant="contained"
          loading={patchMutation.isPending}
          loadingPosition="start"
          disabled={isLoading}
        >
          Save
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
