/** Prize spin overlay — soft wheel tick + two-note win bell (Web Audio, no files). */
class PrizeSpinWheelAudio {
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

  /** Routes Web Audio into a hidden <audio> element — OBS browser sources capture this reliably. */
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

  /**
   * Unlocks playback for OBS / autoplay policies. Safe to call repeatedly.
   * In OBS: Interact with the browser source once if sound is still muted.
   */
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

  private connectToOutput(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    source: AudioNode,
    peakGain: number,
    attackSec: number,
    decaySec: number,
  ): void {
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(peakGain, start + attackSec)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decaySec)
    source.connect(gain)
    gain.connect(out)
  }

  /** Muted peg tick: light transient + gentle pitch drop. */
  playTick(): void {
    void this.playTickAsync()
  }

  private async playTickAsync(): Promise<void> {
    try {
      const ctx = await this.ensureRunning()
      if (!ctx) {
        return
      }
      const out = this.getOutput(ctx)
      const t = ctx.currentTime
      const clickDur = 0.014

      const sampleCount = Math.floor(ctx.sampleRate * clickDur)
      const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < sampleCount; i++) {
        const env = Math.pow(1 - i / sampleCount, 2)
        data[i] = (Math.random() * 2 - 1) * env
      }

      const noise = ctx.createBufferSource()
      noise.buffer = buffer

      const clickFilter = ctx.createBiquadFilter()
      clickFilter.type = 'bandpass'
      clickFilter.frequency.setValueAtTime(2400, t)
      clickFilter.Q.setValueAtTime(0.6, t)

      noise.connect(clickFilter)
      this.connectToOutput(ctx, out, t, clickFilter, 0.055, 0.003, clickDur + 0.012)

      const peg = ctx.createOscillator()
      peg.type = 'sine'
      peg.frequency.setValueAtTime(720, t)
      peg.frequency.exponentialRampToValueAtTime(280, t + 0.038)

      const pegGain = ctx.createGain()
      pegGain.gain.setValueAtTime(0.0001, t)
      pegGain.gain.linearRampToValueAtTime(0.09, t + 0.004)
      pegGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038)
      peg.connect(pegGain)
      pegGain.connect(out)

      noise.start(t)
      noise.stop(t + clickDur + 0.01)
      peg.start(t)
      peg.stop(t + 0.045)
    } catch {
      // OBS / autoplay may block until user gesture — ignore
    }
  }

  private envelope(
    gain: GainNode,
    start: number,
    peak: number,
    attackSec: number,
    decaySec: number,
  ): void {
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(peak, start + attackSec)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + decaySec)
  }

  private playStudioBell(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    freq: number,
    peak: number,
    ringSec: number,
  ): void {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    const partial = ctx.createOscillator()
    partial.type = 'sine'
    partial.frequency.setValueAtTime(freq * 2.01, start)

    const gain = ctx.createGain()
    this.envelope(gain, start, peak, 0.006, ringSec)

    const partialGain = ctx.createGain()
    partialGain.gain.setValueAtTime(peak * 0.16, start)
    partialGain.gain.exponentialRampToValueAtTime(0.0001, start + ringSec * 0.75)

    osc.connect(gain)
    partial.connect(partialGain)
    gain.connect(out)
    partialGain.connect(out)

    const stopAt = start + ringSec + 0.04
    osc.start(start)
    partial.start(start)
    osc.stop(stopAt)
    partial.stop(stopAt)
  }

  playWin(): void {
    void this.playWinAsync()
  }

  private async playWinAsync(): Promise<void> {
    try {
      const ctx = await this.ensureRunning()
      if (!ctx) {
        return
      }
      const out = this.getOutput(ctx)
      const t = ctx.currentTime
      this.playStudioBell(ctx, out, t, 523.25, 0.1, 0.35)
      this.playStudioBell(ctx, out, t + 0.14, 783.99, 0.095, 0.55)
    } catch {
      // ignore
    }
  }
}

export const prizeSpinWheelAudio = new PrizeSpinWheelAudio()

export function attachPrizeSpinWheelAudioUnlock(): () => void {
  void prizeSpinWheelAudio.unlock()

  const retryUnlock = () => {
    void prizeSpinWheelAudio.unlock()
  }

  const gestureOptions: AddEventListenerOptions = { capture: true, passive: true }
  window.addEventListener('pointerdown', retryUnlock, gestureOptions)
  window.addEventListener('keydown', retryUnlock, gestureOptions)
  window.addEventListener('touchstart', retryUnlock, gestureOptions)

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      retryUnlock()
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.removeEventListener('pointerdown', retryUnlock, gestureOptions)
    window.removeEventListener('keydown', retryUnlock, gestureOptions)
    window.removeEventListener('touchstart', retryUnlock, gestureOptions)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}
