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
import { type SubmitEvent, useState } from 'react'
import { PRIZE_SPIN_DEFAULT_TITLE } from '@/components/prize-spin/prize-spin-page-utils'
import { useNotification } from '@/context/NotificationContext'
import { useCreatePrizeSpin } from '@/queries/use-prize-spins'

type PrizeSpinCreateDialogProps = {
  accountId: number
  open: boolean
  onClose: () => void
  onCreated?: () => void
}

const StyledDescription = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}))

const StyledFormStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(2.5),
}))

const StyledTitleField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.default,
  },
}))

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(2),
}))

export const PrizeSpinCreateDialog = (props: PrizeSpinCreateDialogProps) => {
  const { showSuccess, showError } = useNotification()
  const [title, setTitle] = useState(PRIZE_SPIN_DEFAULT_TITLE)
  const createMutation = useCreatePrizeSpin(props.accountId)

  const handleClose = () => {
    props.onClose()
    setTitle(PRIZE_SPIN_DEFAULT_TITLE)

    if (!createMutation.isPending) {
      createMutation.reset()
    }
  }

  const handleCreate = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()

    createMutation.mutate(title, {
      onSuccess: () => {
        showSuccess('Prize spin session created.')
        props.onCreated?.()
        handleClose()
        createMutation.reset()
      },
      onError: () => showError('Could not create prize spin session.'),
    })
  }

  return (
    <Dialog
      open={props.open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>New Session</DialogTitle>
      <DialogContent>
        <StyledDescription variant="body2">
          Create a prize spin session with a title for your stream.
        </StyledDescription>
        <Box
          component="form"
          id="prize-spin-create-form"
          onSubmit={handleCreate}
        >
          <StyledFormStack>
            <StyledTitleField
              id="prize-spin-title"
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              slotProps={{ htmlInput: { maxLength: 200 } }}
              autoFocus
              fullWidth
              size="small"
            />
          </StyledFormStack>
        </Box>
      </DialogContent>
      <StyledDialogActions>
        <Button
          type="button"
          variant="outlined"
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="prize-spin-create-form"
          variant="contained"
          loading={createMutation.isPending}
          loadingPosition="start"
        >
          Create
        </Button>
      </StyledDialogActions>
    </Dialog>
  )
}
