import { useEffect } from 'react'

export type ObsBrowserSourceSize = {
  width: number
  height: number
}

function captureRootLayoutSnapshot(root: HTMLElement | null) {
  return {
    bodyOverflow: document.body.style.overflow,
    htmlOverflow: document.documentElement.style.overflow,
    bodyBackground: document.body.style.background,
    htmlBackground: document.documentElement.style.background,
    bodyMinHeight: document.body.style.minHeight,
    htmlMinHeight: document.documentElement.style.minHeight,
    rootBackground: root?.style.background ?? '',
    rootMinHeight: root?.style.minHeight ?? '',
    rootWidth: root?.style.width ?? '',
    rootHeight: root?.style.height ?? '',
    rootOverflow: root?.style.overflow ?? '',
  }
}

function applyObsBrowserSourceLayout(
  root: HTMLElement | null,
  size?: ObsBrowserSourceSize,
) {
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  document.body.style.background = 'transparent'
  document.documentElement.style.background = 'transparent'
  document.body.style.minHeight = '0'
  document.documentElement.style.minHeight = '0'

  if (!root) {
    return
  }

  root.style.background = 'transparent'
  root.style.minHeight = '0'
  root.style.overflow = 'hidden'

  if (size && size.width > 0 && size.height > 0) {
    root.style.width = `${size.width}px`
    root.style.height = `${size.height}px`
  } else {
    root.style.width = ''
    root.style.height = ''
  }
}

function restoreObsBrowserSourceLayout(
  root: HTMLElement | null,
  snapshot: ReturnType<typeof captureRootLayoutSnapshot>,
) {
  document.body.style.overflow = snapshot.bodyOverflow
  document.documentElement.style.overflow = snapshot.htmlOverflow
  document.body.style.background = snapshot.bodyBackground
  document.documentElement.style.background = snapshot.htmlBackground
  document.body.style.minHeight = snapshot.bodyMinHeight
  document.documentElement.style.minHeight = snapshot.htmlMinHeight

  if (!root) {
    return
  }

  root.style.background = snapshot.rootBackground
  root.style.minHeight = snapshot.rootMinHeight
  root.style.width = snapshot.rootWidth
  root.style.height = snapshot.rootHeight
  root.style.overflow = snapshot.rootOverflow
}

/** Transparent document chrome for OBS browser sources (no #root letterboxing). */
export function useObsBrowserSourceLayout(size?: ObsBrowserSourceSize) {
  useEffect(() => {
    const root = document.getElementById('root')
    const snapshot = captureRootLayoutSnapshot(root)
    applyObsBrowserSourceLayout(root, size)
    return () => {
      restoreObsBrowserSourceLayout(root, snapshot)
    }
  }, [size?.width, size?.height])
}

export function obsBrowserSourceBoxSx(size: ObsBrowserSourceSize) {
  return {
    width: size.width,
    height: size.height,
    minWidth: size.width,
    minHeight: size.height,
    maxWidth: size.width,
    maxHeight: size.height,
    overflow: 'hidden',
    bgcolor: 'transparent',
    flexShrink: 0,
    boxSizing: 'border-box',
  }
}
