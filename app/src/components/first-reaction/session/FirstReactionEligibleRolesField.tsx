import GroupIcon from '@mui/icons-material/Group'
import { Alert, Stack, Switch, Typography } from '@mui/material'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { FirstReactionSettings } from '@/api/first-reaction'
import {
  RoleLabel,
  RoleRowStack,
} from '@/components/chat-roll/chatRollPageStyles'
import type { ChatRollRoleId } from '@/lib/chat-roll'
import { getChatRollRoleMeta } from '@/lib/chat-roll'
import {
  hasEnabledFirstReactionParticipantRole,
  resolveFirstReactionRoleSettings,
  setFirstReactionRoleEnabled,
} from '@/lib/first-reaction-role-settings'

type FirstReactionEligibleRolesFieldProps = {
  settings: FirstReactionSettings
  disabled: boolean
  onChange: (settings: FirstReactionSettings) => void
}

export function FirstReactionEligibleRolesField(
  props: FirstReactionEligibleRolesFieldProps,
) {
  const { t } = useTranslation()
  const roleMeta = useMemo(() => getChatRollRoleMeta(t), [t])
  const roles = resolveFirstReactionRoleSettings(props.settings.roleSettings)
  const showNoRolesError = !hasEnabledFirstReactionParticipantRole(props.settings)

  return (
    <Stack spacing={1.25}>
      <Stack direction="row" spacing={1} alignItems="center">
        <GroupIcon fontSize="small" color="action" aria-hidden />
        <Typography variant="body2" color="text.secondary">
          {t('firstReaction.eligibleRolesHelper')}
        </Typography>
      </Stack>
      {showNoRolesError ? (
        <Alert severity="error" variant="outlined">
          {t('firstReaction.noEligibleRolesError')}
        </Alert>
      ) : null}
      <Stack spacing={1}>
        {roleMeta.map((role) => {
          const setting = roles[role.id]
          return (
            <RoleRowStack key={role.id} enabled={setting.enabled}>
              <Switch
                size="small"
                checked={setting.enabled}
                disabled={props.disabled}
                onChange={(event) =>
                  props.onChange(
                    setFirstReactionRoleEnabled(
                      props.settings,
                      role.id as ChatRollRoleId,
                      event.target.checked,
                    ),
                  )
                }
              />
              <RoleLabel variant="body2">{role.label}</RoleLabel>
            </RoleRowStack>
          )
        })}
      </Stack>
    </Stack>
  )
}
