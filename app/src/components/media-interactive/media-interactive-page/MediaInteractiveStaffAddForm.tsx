import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'react-i18next'
import { inputFieldSx } from '@/theme/colors'

type MediaInteractiveStaffAddFormProps = {
  url: string
  target: 'queue' | 'backup'
  disabled?: boolean
  onUrlChange: (url: string) => void
  onTargetChange: (target: 'queue' | 'backup') => void
  onSubmit: () => void
}

const StyledFormRoot = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1.25),
}))

const StyledFormRow = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  [theme.breakpoints.up('sm')]: {
    flexWrap: 'nowrap',
  },
}))

const StyledUrlField = styled(TextField)({
  flex: '1 1 220px',
  minWidth: 0,
})

const StyledTargetControl = styled(FormControl)(({ theme }) => ({
  flex: '0 0 auto',
  minWidth: 148,
  [theme.breakpoints.up('sm')]: {
    width: 160,
  },
}))

const StyledSubmitButton = styled(Button)(({ theme }) => ({
  flexShrink: 0,
  height: 40,
  [theme.breakpoints.up('sm')]: {
    alignSelf: 'center',
  },
}))

export function MediaInteractiveStaffAddForm({
  url,
  target,
  disabled,
  onUrlChange,
  onTargetChange,
  onSubmit,
}: MediaInteractiveStaffAddFormProps) {
  const { t } = useTranslation()

  return (
    <StyledFormRoot>
      <StyledFormRow>
        <StyledUrlField
          size="small"
          label={t('mediaInteractive.youtubeUrl')}
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          disabled={disabled}
          sx={inputFieldSx}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && url.trim()) {
              e.preventDefault()
              onSubmit()
            }
          }}
        />
        <StyledTargetControl size="small" disabled={disabled}>
          <InputLabel id="media-interactive-staff-target-label">
            {t('mediaInteractive.staffTarget')}
          </InputLabel>
          <Select
            labelId="media-interactive-staff-target-label"
            label={t('mediaInteractive.staffTarget')}
            value={target}
            onChange={(e) =>
              onTargetChange(e.target.value as 'queue' | 'backup')
            }
          >
            <MenuItem value="queue">{t('mediaInteractive.toQueue')}</MenuItem>
            <MenuItem value="backup">{t('mediaInteractive.toBackup')}</MenuItem>
          </Select>
        </StyledTargetControl>
        <StyledSubmitButton
          type="button"
          variant="contained"
          disabled={disabled || !url.trim()}
          startIcon={<AddIcon fontSize="small" />}
          onClick={onSubmit}
        >
          {t('mediaInteractive.addTrack')}
        </StyledSubmitButton>
      </StyledFormRow>
    </StyledFormRoot>
  )
}
