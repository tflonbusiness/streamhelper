import Collapse from '@mui/material/Collapse'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SettingsGroupExpandIcon,
  SettingsGroupPanel,
  SettingsGroupTitleButton,
  SettingsGroupTitleMain,
} from '@/components/chat-roll/chatRollPageStyles'

type ChatRollSettingsCollapsibleGroupProps = {
  title: string
  titleIcon: ReactNode
  defaultExpanded?: boolean
  children: ReactNode
}

export function ChatRollSettingsCollapsibleGroup({
  title,
  titleIcon,
  defaultExpanded = true,
  children,
}: ChatRollSettingsCollapsibleGroupProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <SettingsGroupPanel>
      <SettingsGroupTitleButton
        type="button"
        expanded={expanded}
        aria-expanded={expanded}
        aria-label={
          expanded
            ? t('common.collapseDetailsAria', { title })
            : t('common.expandDetailsAria', { title })
        }
        onClick={() => setExpanded((value) => !value)}
      >
        <SettingsGroupTitleMain component="span" variant="inherit">
          {titleIcon}
          {title}
        </SettingsGroupTitleMain>
        <SettingsGroupExpandIcon expanded={expanded} aria-hidden />
      </SettingsGroupTitleButton>
      <Collapse in={expanded} timeout="auto">
        {children}
      </Collapse>
    </SettingsGroupPanel>
  )
}
