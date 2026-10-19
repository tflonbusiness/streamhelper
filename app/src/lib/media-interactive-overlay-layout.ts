/** Matches `MediaInteractivePlayerCard` overlay + video chrome (8px theme spacing). */
const MUI_SPACING_PX = 8

const OVERLAY_AUDIO_THUMB_PX = 52
const OVERLAY_AUDIO_PADDING_Y_PX = MUI_SPACING_PX * 1.25 * 2

const OVERLAY_VIDEO_THUMB_PX = 44
const OVERLAY_VIDEO_PADDING_TOP_PX = MUI_SPACING_PX * 1.25
const OVERLAY_VIDEO_PADDING_BOTTOM_PX = MUI_SPACING_PX * 1.125

export const MEDIA_INTERACTIVE_OVERLAY_AUDIO_BAR_HEIGHT_PX =
  OVERLAY_AUDIO_THUMB_PX + OVERLAY_AUDIO_PADDING_Y_PX

export const MEDIA_INTERACTIVE_OVERLAY_VIDEO_TRACK_BAR_HEIGHT_PX =
  OVERLAY_VIDEO_THUMB_PX +
  OVERLAY_VIDEO_PADDING_TOP_PX +
  OVERLAY_VIDEO_PADDING_BOTTOM_PX

export type MediaInteractiveObsViewportInput = {
  showVideo: boolean
  overlayWidth: number
  overlayHeight: number
  audioOverlayWidth: number
  /** False when overlay player card is hidden (no track). */
  showTrackBar: boolean
}

export function resolveMediaInteractiveObsViewport(
  input: MediaInteractiveObsViewportInput,
): { width: number; height: number } {
  if (!input.showVideo) {
    const height = input.showTrackBar
      ? MEDIA_INTERACTIVE_OVERLAY_AUDIO_BAR_HEIGHT_PX
      : 0
    return {
      width: input.audioOverlayWidth,
      height,
    }
  }

  const trackBarHeight = input.showTrackBar
    ? MEDIA_INTERACTIVE_OVERLAY_VIDEO_TRACK_BAR_HEIGHT_PX
    : 0

  return {
    width: input.overlayWidth,
    height: trackBarHeight + input.overlayHeight,
  }
}
