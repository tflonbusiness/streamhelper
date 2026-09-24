import { useEffect, useMemo, useState } from 'react'
import type { BonusBuyWidgetSettings, BonusBuyWidgetStylePreset } from '@/api/bonus-buy'
import {
  applyBonusBuyWidgetPresetFromList,
  matchBonusBuyWidgetPresetFromList,
} from '@/lib/bonus-buy-widget-presets'
import { validateBonusBuyWidgetDraft } from '@/lib/bonus-buy-widget-validation'

type UseBonusBuyWidgetDraftOptions = {
  widgetSettings: BonusBuyWidgetSettings | undefined
  widgetPresets: BonusBuyWidgetStylePreset[]
  onSave: (draft: BonusBuyWidgetSettings, presets: BonusBuyWidgetStylePreset[]) => Promise<void>
  onError?: (message: string) => void
}

export function useBonusBuyWidgetDraft({
  widgetSettings,
  widgetPresets,
  onSave,
  onError,
}: UseBonusBuyWidgetDraftOptions) {
  const [widgetDraft, setWidgetDraft] = useState<BonusBuyWidgetSettings | null>(null)
  const [lastValidWidgetDraft, setLastValidWidgetDraft] =
    useState<BonusBuyWidgetSettings | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (widgetSettings) {
      setWidgetDraft(widgetSettings)
      setLastValidWidgetDraft(widgetSettings)
    }
  }, [widgetSettings])

  useEffect(() => {
    if (!widgetDraft) {
      return
    }

    if (validateBonusBuyWidgetDraft(widgetDraft) === null) {
      setLastValidWidgetDraft(widgetDraft)
    }
  }, [widgetDraft])

  const widgetDraftValidationError = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return validateBonusBuyWidgetDraft(widgetDraft)
  }, [widgetDraft])

  const widgetPreviewTheme = lastValidWidgetDraft ?? widgetDraft

  const widgetPreviewDimensionLabel = widgetDraft
    ? `${widgetDraft.width} × ${widgetDraft.height}`
    : undefined

  const activeWidgetPresetId = useMemo(() => {
    if (!widgetDraft) {
      return null
    }
    return matchBonusBuyWidgetPresetFromList(widgetDraft, widgetPresets)
  }, [widgetDraft, widgetPresets])

  function updateWidgetDraft<K extends keyof BonusBuyWidgetSettings>(
    key: K,
    value: BonusBuyWidgetSettings[K],
  ) {
    setWidgetDraft((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    )
  }

  function applyWidgetPreset(presetId: number) {
    const preset = widgetPresets.find((entry) => entry.id === presetId)
    if (!preset) {
      return
    }

    setWidgetDraft((previous) =>
      previous ? applyBonusBuyWidgetPresetFromList(previous, preset) : previous,
    )
  }

  async function saveWidgetStyle() {
    if (!widgetDraft) {
      return
    }

    const validationError = validateBonusBuyWidgetDraft(widgetDraft)
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
    widgetDraftValidationError,
    widgetPreviewTheme,
    widgetPreviewDimensionLabel,
    activeWidgetPresetId,
    isSaving,
    updateWidgetDraft,
    applyWidgetPreset,
    saveWidgetStyle,
  }
}
