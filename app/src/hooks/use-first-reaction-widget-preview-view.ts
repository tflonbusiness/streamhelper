import { useEffect, useMemo, useState } from 'react'
import type { PublicFirstReactionWidgetActiveView } from '@/api/first-reaction'
import { buildFirstReactionWidgetPreviewDemoView } from '@/lib/first-reaction-widget-preview'
import type { FirstReactionWidgetStyle } from '@/lib/first-reaction-widget-style-defaults'
import { usePublicFirstReactionWidget } from '@/queries/use-first-reaction-widget'

type PreviewSize = { width: number; height: number }

export function useFirstReactionWidgetPreviewView(
  accountUcid: string | null,
  enabled: boolean,
  size: PreviewSize,
  styleDraft: FirstReactionWidgetStyle,
): { view: PublicFirstReactionWidgetActiveView; isLive: boolean } {
  const { data } = usePublicFirstReactionWidget(
    enabled && accountUcid ? accountUcid : null,
  )

  const [demoStartedAt, setDemoStartedAt] = useState(() => new Date())

  useEffect(() => {
    if (enabled) {
      setDemoStartedAt(new Date())
    }
  }, [enabled])

  return useMemo(() => {
    const sized = (view: PublicFirstReactionWidgetActiveView) => ({
      ...view,
      width: size.width,
      height: size.height,
      style: styleDraft,
    })

    if (
      data?.status === 'active' &&
      data.phase === 'accepting' &&
      data.keyword
    ) {
      return { view: sized(data), isLive: true }
    }

    return {
      view: buildFirstReactionWidgetPreviewDemoView(
        size.width,
        size.height,
        demoStartedAt,
        styleDraft,
      ),
      isLive: false,
    }
  }, [data, demoStartedAt, size.width, size.height, styleDraft])
}
