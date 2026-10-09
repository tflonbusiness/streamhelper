import { useLayoutEffect, useRef, useState } from 'react'
import type { BonusBuySlot } from '@/api/bonus-buy'
import type { BonusBuyWidgetTheme } from '@/lib/bonus-buy-widget-presentation'
import {
  StyledSlotListContainer,
  StyledSlotScrollTrack,
} from '@/components/bonus-buy/widget/bonus-buy-widget-styles'
import { BonusBuyWidgetSlotRow } from '@/components/bonus-buy/widget/BonusBuyWidgetSlotRow'

const AUTO_SCROLL_SECONDS_PER_ITEM = 3.5
const SLOT_LIST_GAP_PX = 10

type BonusBuyWidgetSlotListProps = {
  listSlots: BonusBuySlot[]
  theme: BonusBuyWidgetTheme
  currencyCode: string
}

function measureSingleListHeight(track: HTMLElement, slotCount: number): number {
  const children = Array.from(track.children) as HTMLElement[]
  if (children.length < slotCount || slotCount === 0) {
    return 0
  }

  let height = 0
  for (let index = 0; index < slotCount; index += 1) {
    height += children[index].offsetHeight
    if (index < slotCount - 1) {
      height += SLOT_LIST_GAP_PX
    }
  }

  return height
}

export function BonusBuyWidgetSlotList({
  listSlots,
  theme,
  currencyCode,
}: BonusBuyWidgetSlotListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)

  const autoScrollDuration = Math.max(
    listSlots.length * AUTO_SCROLL_SECONDS_PER_ITEM,
    12,
  )
  const slotsToRender = autoScrollEnabled
    ? [...listSlots, ...listSlots]
    : listSlots

  useLayoutEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track || listSlots.length === 0) {
      setAutoScrollEnabled(false)
      return
    }

    function updateAutoScroll() {
      const currentContainer = containerRef.current
      const currentTrack = trackRef.current
      if (!currentContainer || !currentTrack) {
        return
      }
      const singleListHeight = measureSingleListHeight(
        currentTrack,
        listSlots.length,
      )
      setAutoScrollEnabled(singleListHeight > currentContainer.clientHeight)
    }

    updateAutoScroll()

    const observer = new ResizeObserver(updateAutoScroll)
    observer.observe(container)
    observer.observe(track)

    return () => observer.disconnect()
  }, [listSlots])

  return (
    <StyledSlotListContainer ref={containerRef} widgetTheme={theme}>
      <StyledSlotScrollTrack
        ref={trackRef}
        autoScrollEnabled={autoScrollEnabled}
        autoScrollDuration={autoScrollDuration}
      >
        {slotsToRender.map((slot, index) => (
          <BonusBuyWidgetSlotRow
            key={`${autoScrollEnabled ? Math.floor(index / listSlots.length) : 0}-${slot.id}`}
            slot={slot}
            theme={theme}
            currencyCode={currencyCode}
          />
        ))}
      </StyledSlotScrollTrack>
    </StyledSlotListContainer>
  )
}
