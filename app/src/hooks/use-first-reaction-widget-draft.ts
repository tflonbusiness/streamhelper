import { useEffect, useMemo, useState } from 'react'
import type {
  FirstReactionWidget,
  FirstReactionWidgetStyle,
  FirstReactionWidgetStylePreset,
} from '@/api/first-reaction'
import {
  applyFirstReactionWidgetPresetFromList,
  matchFirstReactionWidgetPresetFromList,
} from '@/lib/first-reaction-widget-presets'
import { validateFirstReactionWidgetStyle } from '@/lib/first-reaction-widget-style-validation'

type UseFirstReactionWidgetDraftOptions = {
  widgetSettings: FirstReactionWidget | undefined
  widgetPresets: FirstReactionWidgetStylePreset[]
  onSave: (
    draft: FirstReactionWidget,
    presets: FirstReactionWidgetStylePreset[],
  ) => Promise<void>
  onError?: (message: string) => void
}

export function useFirstReactionWidgetDraft({
  widgetSettings,
  widgetPresets,
  onSave,
  onError,
}: UseFirstReactionWidgetDraftOptions) {
  const [widgetDraft, setWidgetDraft] = useState<FirstReactionWidget | null>(
    null,
  )
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (widgetSettings) {
      setWidgetDraft(widgetSettings)
    }
  }, [widgetSettings])

  const styleDraftValidationError = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return validateFirstReactionWidgetStyle(widgetDraft.style)
  }, [widgetDraft])

  const activeWidgetPresetId = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return matchFirstReactionWidgetPresetFromList(widgetDraft, widgetPresets)
  }, [widgetDraft, widgetPresets])

  function updateWidgetDraft<K extends keyof FirstReactionWidget>(
    key: K,
    value: FirstReactionWidget[K],
  ) {
    setWidgetDraft((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    )
  }

  function updateStyleDraft<K extends keyof FirstReactionWidgetStyle>(
    key: K,
    value: FirstReactionWidgetStyle[K],
  ) {
    setWidgetDraft((previous) =>
      previous
        ? { ...previous, style: { ...previous.style, [key]: value } }
        : previous,
    )
  }

  function applyWidgetPreset(presetId: number) {
    const preset = widgetPresets.find((entry) => entry.id === presetId)
    if (!preset) {
      return
    }

    setWidgetDraft((previous) =>
      previous ? applyFirstReactionWidgetPresetFromList(previous, preset) : previous,
    )
  }

  async function saveWidgetStyle() {
    if (!widgetDraft) {
      return
    }

    const validationError = validateFirstReactionWidgetStyle(widgetDraft.style)
    if (validationError) {
      onError?.(validationError)
      return
    }

    setIsSaving(true)
    try {
      await onSave(widgetDraft, widgetPresets)
    } catch (saveError) {
      onError?.(
        saveError instanceof Error
          ? saveError.message
          : 'Could not save widget settings',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return {
    widgetDraft,
    styleDraftValidationError,
    activeWidgetPresetId,
    isSaving,
    updateWidgetDraft,
    updateStyleDraft,
    applyWidgetPreset,
    saveWidgetStyle,
  }
}
