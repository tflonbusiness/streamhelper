import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SaveIcon from '@mui/icons-material/Save'
import SettingsIcon from '@mui/icons-material/Settings'
import Tooltip from '@mui/material/Tooltip'
import { useTranslation } from 'react-i18next'
import {
  SettingsExpandButton,
  SettingsHeaderActions,
  SettingsSaveButton,
  SettingsUnsavedAlert,
  WorkspaceSectionHeader,
} from '@/components/chat-roll/chatRollPageStyles'
import { SectionHeader } from '@/components/SectionHeader'

type ChatRollSessionSettingsChromeProps = {
  readOnly: boolean
  isDirty: boolean
  canSave: boolean
  isSaving: boolean
  onSave: () => void
  onCollapse: () => void
}

export function ChatRollSessionSettingsChrome(
  props: ChatRollSessionSettingsChromeProps,
) {
  const { t } = useTranslation()
  const settingsTitle = t('chatRoll.settingsTitle')

  return (
    <WorkspaceSectionHeader>
      <SectionHeader
        title={settingsTitle}
        icon={SettingsIcon}
        iconVariant="info"
        showDivider={false}
        action={
          <SettingsHeaderActions>
            <Tooltip title={t('chatRoll.collapseSettingsPanel')}>
              <SettingsExpandButton
                onClick={props.onCollapse}
                aria-label={t('common.collapseDetailsAria', { title: settingsTitle })}
                aria-expanded={true}
              >
                <ChevronLeftIcon fontSize="small" aria-hidden />
              </SettingsExpandButton>
            </Tooltip>
            {!props.readOnly ? (
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
            ) : null}
          </SettingsHeaderActions>
        }
      />

      {!props.readOnly && props.isDirty ? (
        <SettingsUnsavedAlert severity="warning" variant="outlined">
          {t('chatRoll.settingsUnsavedBanner')}
        </SettingsUnsavedAlert>
      ) : null}
    </WorkspaceSectionHeader>
  )
}
