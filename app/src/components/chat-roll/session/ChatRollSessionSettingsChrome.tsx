import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import { useTranslation } from 'react-i18next'
import {
  SettingsSaveButton,
  SettingsUnsavedAlert,
} from '@/components/chat-roll/chatRollPageStyles'
import { SectionHeader } from '@/components/SectionHeader'

type ChatRollSessionSettingsChromeProps = {
  readOnly: boolean
  isDirty: boolean
  canSave: boolean
  isSaving: boolean
  onSave: () => void
}

export function ChatRollSessionSettingsChrome(
  props: ChatRollSessionSettingsChromeProps,
) {
  const { t } = useTranslation()
  return (
    <>
      <SectionHeader
        title={t('chatRoll.settingsTitle')}
        icon={SettingsIcon}
        iconVariant="info"
        action={
          !props.readOnly ? (
            <SettingsSaveButton
              variant="contained"
              size="small"
              color="primary"
              startIcon={<SaveIcon fontSize="small" aria-hidden />}
              disabled={!props.canSave}
              onClick={props.onSave}
            >
              {props.isSaving ? t('common.saving') : t('common.save')}
            </SettingsSaveButton>
          ) : undefined
        }
      />

      {!props.readOnly && props.isDirty ? (
        <SettingsUnsavedAlert severity="warning" variant="outlined">
          {t('chatRoll.settingsUnsavedBanner')}
        </SettingsUnsavedAlert>
      ) : null}
    </>
  )
}
