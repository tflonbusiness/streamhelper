import { useEffect, useMemo, useState } from 'react'
import type { ChatRollRecord } from '@/api/chat-roll'
import {
  areChatRollSettingsDraftsEqual,
  chatRollSettingsDraftFromRecord,
  type ChatRollSessionSettingsDraft,
} from '@/lib/chat-roll-session-settings'

function recordSettingsSnapshot(record: ChatRollRecord) {
  return chatRollSettingsDraftFromRecord(record)
}

export function useChatRollSessionSettingsDraft(record: ChatRollRecord) {
  const serverSnapshot = useMemo(
    () => recordSettingsSnapshot(record),
    [
      record.id,
      record.keyword,
      record.widgetKeywordPrefix,
      record.combineMode,
      record.excludeWinnerAfterRoll,
      record.replyInChat,
      record.winnerResponseEnabled,
      record.winnerResponseSeconds,
      record.roleSettings,
    ],
  )

  const [draft, setDraft] = useState(serverSnapshot)

  useEffect(() => {
    setDraft(serverSnapshot)
  }, [record.id])

  useEffect(() => {
    if (areChatRollSettingsDraftsEqual(draft, serverSnapshot)) {
      setDraft(serverSnapshot)
    }
  }, [serverSnapshot, draft])

  const isDirty = !areChatRollSettingsDraftsEqual(draft, serverSnapshot)

  function resetDraft() {
    setDraft(serverSnapshot)
  }

  function updateDraft(
    updater: (current: ChatRollSessionSettingsDraft) => ChatRollSessionSettingsDraft,
  ) {
    setDraft((current) => updater(current))
  }

  return {
    draft,
    isDirty,
    resetDraft,
    updateDraft,
    setDraft,
  }
}
