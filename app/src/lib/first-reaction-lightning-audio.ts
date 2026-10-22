/** First Reaction — synthesized “whoosh” on widget appear (Web Audio). */
class FirstReactionLightningAudio {
  private ctx: AudioContext | null = null
  private outputDest: MediaStreamAudioDestinationNode | null = null
  private mediaElement: HTMLAudioElement | null = null
  private unlockInFlight: Promise<boolean> | null = null

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) {
        throw new Error('Web Audio API is not available')
      }
      this.ctx = new AudioCtx()
    }
    return this.ctx
  }

  private getOutput(ctx: AudioContext): AudioNode {
    if (!this.outputDest) {
      this.outputDest = ctx.createMediaStreamDestination()
      const el = document.createElement('audio')
      el.autoplay = true
      el.setAttribute('playsinline', 'true')
      el.muted = false
      el.volume = 1
      el.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none'
      el.srcObject = this.outputDest.stream
      document.body.appendChild(el)
      this.mediaElement = el
    }
    return this.outputDest
  }

  unlock(): Promise<boolean> {
    if (!this.unlockInFlight) {
      this.unlockInFlight = this.doUnlock().finally(() => {
        this.unlockInFlight = null
      })
    }
    return this.unlockInFlight
  }

  private async doUnlock(): Promise<boolean> {
    try {
      const ctx = this.getContext()
      const out = this.getOutput(ctx)

      if (this.mediaElement) {
        await this.mediaElement.play().catch(() => {})
      }

      if (ctx.state === 'suspended') {
        await ctx.resume()
      }

      if (ctx.state !== 'running') {
        return false
      }

      const primer = ctx.createBufferSource()
      primer.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
      primer.connect(out)
      primer.start()
      primer.stop(ctx.currentTime + 0.001)

      return true
    } catch {
      return false
    }
  }

  private async ensureRunning(): Promise<AudioContext | null> {
    await this.unlock()
    const ctx = this.ctx
    if (!ctx || ctx.state !== 'running') {
      return null
    }
    return ctx
  }

  /** Called when the overlay enters — airy rising “вууууууп”. */
  playLightning(): void {
    void this.playLightningAsync()
  }

  /** Short celebratory sting when a winner is revealed on overlay. */
  playWinner(): void {
    void this.playWinnerAsync()
  }

  private async playWinnerAsync(): Promise<void> {
    const ctx = await this.ensureRunning()
    if (!ctx) {
      return
    }

    const out = this.getOutput(ctx)
    const t0 = ctx.currentTime + 0.01
    this.playWinnerSting(ctx, out, t0)
  }

  private async playLightningAsync(): Promise<void> {
    const ctx = await this.ensureRunning()
    if (!ctx) {
      return
    }

    const out = this.getOutput(ctx)
    const t0 = ctx.currentTime + 0.01
    this.playAppearWhoosh(ctx, out, t0)
  }

  private fillPinkNoise(data: Float32Array): void {
    let b0 = 0
    let b1 = 0
    let b2 = 0
    let b3 = 0
    let b4 = 0
    let b5 = 0
    let b6 = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.969 * b2 + white * 0.153852
      b3 = 0.8665 * b3 + white * 0.3104856
      b4 = 0.55 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.016898
      data[i] =
        (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  }

  private playAppearWhoosh(ctx: AudioContext, out: AudioNode, start: number): void {
    const dur = 0.24
    const sweepEnd = start + dur * 0.75

    const sampleCount = Math.floor(ctx.sampleRate * dur)
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
    this.fillPinkNoise(buffer.getChannelData(0))

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.setValueAtTime(0.85, start)
    bp.Q.linearRampToValueAtTime(1.35, sweepEnd)
    bp.frequency.setValueAtTime(140, start)
    bp.frequency.exponentialRampToValueAtTime(5200, sweepEnd)

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(90, start)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(0.62, start + 0.022)
    gain.gain.linearRampToValueAtTime(0.48, sweepEnd - 0.028)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)

    noise.connect(hp)
    hp.connect(bp)
    bp.connect(gain)
    gain.connect(out)

    noise.start(start)
    noise.stop(start + dur + 0.05)

    this.playTonalSwoosh(ctx, out, start, dur)
    this.playWhooshLanding(ctx, out, sweepEnd)
  }

  /** Soft “вууу” body — sine glides up with the air layer. */
  private playTonalSwoosh(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    dur: number,
  ): void {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(165, start)
    osc.frequency.exponentialRampToValueAtTime(720, start + dur * 0.72)

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(900, start)
    lp.frequency.linearRampToValueAtTime(2400, start + dur * 0.5)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(0.14, start + 0.028)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.85)

    osc.connect(lp)
    lp.connect(gain)
    gain.connect(out)

    osc.start(start)
    osc.stop(start + dur)
  }

  /** Short “п” — gentle settle when the swoosh peaks. */
  private playWhooshLanding(ctx: AudioContext, out: AudioNode, at: number): void {
    const len = 0.03
    const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * len))
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.5)
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1800, at)
    lp.frequency.exponentialRampToValueAtTime(400, at + len)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.linearRampToValueAtTime(0.22, at + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + len)

    noise.connect(lp)
    lp.connect(gain)
    gain.connect(out)

    noise.start(at)
    noise.stop(at + len + 0.02)
  }

  private playWinnerSting(ctx: AudioContext, out: AudioNode, start: number): void {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    const noteGap = 0.055
    const noteDur = 0.14

    notes.forEach((freq, index) => {
      const at = start + index * noteGap
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, at)

      const shimmer = ctx.createOscillator()
      shimmer.type = 'sine'
      shimmer.frequency.setValueAtTime(freq * 2.01, at)

      const mix = ctx.createGain()
      mix.gain.setValueAtTime(0.0001, at)
      mix.gain.linearRampToValueAtTime(0.2 - index * 0.02, at + 0.012)
      mix.gain.exponentialRampToValueAtTime(0.0001, at + noteDur)

      const shimmerGain = ctx.createGain()
      shimmerGain.gain.setValueAtTime(0.0001, at)
      shimmerGain.gain.linearRampToValueAtTime(0.06, at + 0.01)
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, at + noteDur * 0.85)

      osc.connect(mix)
      shimmer.connect(shimmerGain)
      mix.connect(out)
      shimmerGain.connect(out)

      osc.start(at)
      shimmer.start(at)
      osc.stop(at + noteDur + 0.02)
      shimmer.stop(at + noteDur + 0.02)
    })

    const sparkleAt = start + notes.length * noteGap
    const sparkleLen = 0.12
    const sampleCount = Math.floor(ctx.sampleRate * sparkleLen)
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.8)
    }

    const sparkle = ctx.createBufferSource()
    sparkle.buffer = buffer

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(2200, sparkleAt)

    const sparkleGain = ctx.createGain()
    sparkleGain.gain.setValueAtTime(0.0001, sparkleAt)
    sparkleGain.gain.linearRampToValueAtTime(0.12, sparkleAt + 0.01)
    sparkleGain.gain.exponentialRampToValueAtTime(0.0001, sparkleAt + sparkleLen)

    sparkle.connect(hp)
    hp.connect(sparkleGain)
    sparkleGain.connect(out)

    sparkle.start(sparkleAt)
    sparkle.stop(sparkleAt + sparkleLen + 0.02)
  }
}

export const firstReactionLightningAudio = new FirstReactionLightningAudio()

export function attachFirstReactionLightningAudioUnlock(): () => void {
  void firstReactionLightningAudio.unlock()

  const retryUnlock = () => {
    void firstReactionLightningAudio.unlock()
  }

  const gestureOptions: AddEventListenerOptions = { capture: true, passive: true }
  window.addEventListener('pointerdown', retryUnlock, gestureOptions)
  window.addEventListener('keydown', retryUnlock, gestureOptions)

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      retryUnlock()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.removeEventListener('pointerdown', retryUnlock, gestureOptions)
    window.removeEventListener('keydown', retryUnlock, gestureOptions)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
