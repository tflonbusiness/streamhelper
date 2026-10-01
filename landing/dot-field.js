const TWO_PI = Math.PI * 2

const DEFAULTS = {
  dotRadius: 2,
  dotSpacing: 14,
  cursorRadius: 500,
  cursorForce: 0.1,
  bulgeOnly: true,
  bulgeStrength: 67,
  glowRadius: 160,
  sparkle: false,
  waveAmplitude: 0,
  gradientFrom: 'rgba(167, 139, 250, 0.38)',
  gradientTo: 'rgba(196, 181, 253, 0.3)',
  glowColor: '#0B0B0F',
}

function initDotField(container, options = {}) {
  const props = { ...DEFAULTS, ...options }
  const glowId = `dot-field-glow-${Math.random().toString(36).slice(2, 9)}`

  container.className = 'dot-field-container'
  container.innerHTML = `
    <canvas class="dot-field-canvas"></canvas>
    <svg class="dot-field-svg" aria-hidden="true">
      <defs>
        <radialGradient id="${glowId}">
          <stop offset="0%" stop-color="${props.glowColor}" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
      </defs>
      <circle class="dot-field-glow" cx="-9999" cy="-9999" r="${props.glowRadius}" fill="url(#${glowId})" />
    </svg>
  `

  const canvas = container.querySelector('.dot-field-canvas')
  const glowEl = container.querySelector('.dot-field-glow')
  const context = canvas.getContext('2d', { alpha: true })
  if (!context) return () => {}

  const ctx = context
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const dots = []
  const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 }
  const size = { w: 0, h: 0 }
  let glowOpacity = 0
  let engagement = 0
  let rafId = null
  let resizeTimer = null
  let frameCount = 0

  function buildDots(w, h) {
    const step = props.dotRadius + props.dotSpacing
    const cols = Math.floor(w / step)
    const rows = Math.floor(h / step)
    const padX = (w % step) / 2
    const padY = (h % step) / 2
    dots.length = 0

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const ax = padX + col * step + step / 2
        const ay = padY + row * step + step / 2
        dots.push({ ax, ay, sx: ax, sy: ay, vx: 0, vy: 0, x: ax, y: ay })
      }
    }
  }

  function drawFrame() {
    const { w, h } = size
    const len = dots.length
    const t = frameCount * 0.02

    const pointerInside =
      mouse.x >= 0 && mouse.x <= w && mouse.y >= 0 && mouse.y <= h
    const speedEngagement = Math.min(mouse.speed / 5, 1)
    const targetEngagement = pointerInside
      ? Math.max(speedEngagement, 0.45)
      : speedEngagement
    engagement += (targetEngagement - engagement) * 0.06
    if (engagement < 0.001) engagement = 0
    const eng = engagement

    glowOpacity += (eng - glowOpacity) * 0.08

    if (glowEl) {
      glowEl.setAttribute('cx', String(mouse.x))
      glowEl.setAttribute('cy', String(mouse.y))
      glowEl.style.opacity = String(glowOpacity * 0.55)
    }

    ctx.clearRect(0, 0, w, h)

    const grad = ctx.createLinearGradient(0, 0, w, h)
    grad.addColorStop(0, props.gradientFrom)
    grad.addColorStop(1, props.gradientTo)
    ctx.fillStyle = grad

    const cr = props.cursorRadius
    const crSq = cr * cr
    const rad = props.dotRadius / 2
    const isBulge = props.bulgeOnly

    ctx.beginPath()

    for (let i = 0; i < len; i++) {
      const d = dots[i]
      const dx = mouse.x - d.ax
      const dy = mouse.y - d.ay
      const distSq = dx * dx + dy * dy

      if (distSq < crSq && eng > 0.01) {
        const dist = Math.sqrt(distSq)
        if (isBulge) {
          const bulgeT = 1 - dist / cr
          const push = bulgeT * bulgeT * props.bulgeStrength * eng
          const angle = Math.atan2(dy, dx)
          d.sx += (d.ax - Math.cos(angle) * push - d.sx) * 0.15
          d.sy += (d.ay - Math.sin(angle) * push - d.sy) * 0.15
        } else {
          const angle = Math.atan2(dy, dx)
          const move = (500 / dist) * (mouse.speed * props.cursorForce)
          d.vx += Math.cos(angle) * -move
          d.vy += Math.sin(angle) * -move
        }
      } else if (isBulge) {
        d.sx += (d.ax - d.sx) * 0.1
        d.sy += (d.ay - d.sy) * 0.1
      }

      if (!isBulge) {
        d.vx *= 0.9
        d.vy *= 0.9
        d.x = d.ax + d.vx
        d.y = d.ay + d.vy
        d.sx += (d.x - d.sx) * 0.1
        d.sy += (d.y - d.sy) * 0.1
      }

      let drawX = d.sx
      let drawY = d.sy
      if (props.waveAmplitude > 0) {
        drawY += Math.sin(d.ax * 0.03 + t) * props.waveAmplitude
        drawX += Math.cos(d.ay * 0.03 + t * 0.7) * props.waveAmplitude * 0.5
      }

      if (props.sparkle) {
        const hash = ((i * 2654435761) ^ (frameCount >> 3)) >>> 0
        const dotRad = hash % 100 < 3 ? rad * 1.8 : rad
        ctx.moveTo(drawX + dotRad, drawY)
        ctx.arc(drawX, drawY, dotRad, 0, TWO_PI)
      } else {
        ctx.moveTo(drawX + rad, drawY)
        ctx.arc(drawX, drawY, rad, 0, TWO_PI)
      }
    }

    ctx.fill()
  }

  function doResize() {
    const rect = container.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    size.w = w
    size.h = h
    buildDots(w, h)
  }

  function resize() {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(doResize, 100)
  }

  function onPointerMove(clientX, clientY) {
    const rect = container.getBoundingClientRect()
    mouse.x = clientX - rect.left
    mouse.y = clientY - rect.top
  }

  function onMouseMove(e) {
    onPointerMove(e.clientX, e.clientY)
  }

  function onTouchMove(e) {
    const touch = e.touches[0]
    if (!touch) return
    onPointerMove(touch.clientX, touch.clientY)
  }

  function updateMouseSpeed() {
    const dx = mouse.prevX - mouse.x
    const dy = mouse.prevY - mouse.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    mouse.speed += (dist - mouse.speed) * 0.5
    if (mouse.speed < 0.001) mouse.speed = 0
    mouse.prevX = mouse.x
    mouse.prevY = mouse.y
  }

  function tick() {
    frameCount++
    drawFrame()
    rafId = requestAnimationFrame(tick)
  }

  doResize()

  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => doResize())
      : null
  if (resizeObserver) resizeObserver.observe(container)

  const speedInterval = setInterval(updateMouseSpeed, 20)

  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  rafId = requestAnimationFrame(tick)

  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    clearInterval(speedInterval)
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeObserver?.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('touchmove', onTouchMove)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('dot-field-bg')
  if (root) initDotField(root)
})
