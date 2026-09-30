/** Chat roll — roll win fanfare + winner chat-confirm chime (Web Audio, no files). */
class ChatRollAudio {
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

  private playBell(
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

  /**
   * Classic giveaway / wheel “winner” stinger: fast major arpeggio + bright hold
   * (familiar from stream overlays and arcade pickers — not church bells).
   */
  playRollWin(): void {
    void this.playRollWinAsync()
  }

  private playWinStingerNote(
    ctx: AudioContext,
    out: AudioNode,
    start: number,
    freq: number,
    peak: number,
    holdSec: number,
  ): void {
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3200, start)
    filter.Q.setValueAtTime(0.7, start)

    const gain = ctx.createGain()
    const attack = 0.006
    const decay = holdSec
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(peak, start + attack)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + attack + decay)

    const stopAt = start + attack + decay + 0.05

    for (const [detune, type, mix] of [
      [0, 'square' as OscillatorType, 0.55],
      [-7, 'triangle' as OscillatorType, 0.45],
    ]) {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.setValueAtTime(freq, start)
      osc.detune.setValueAtTime(detune, start)

      const voiceGain = ctx.createGain()
      voiceGain.gain.setValueAtTime(mix, start)

      osc.connect(voiceGain)
      voiceGain.connect(filter)
      osc.start(start)
      osc.stop(stopAt)
    }

    filter.connect(gain)
    gain.connect(out)
  }

  private playWinSparkle(ctx: AudioContext, out: AudioNode, start: number): void {
    const len = 0.06
    const sampleCount = Math.floor(ctx.sampleRate * len)
    const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < sampleCount; i++) {
      const env = Math.pow(1 - i / sampleCount, 1.8)
      data[i] = (Math.random() * 2 - 1) * env
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.setValueAtTime(5200, start)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.linearRampToValueAtTime(0.045, start + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + len)

    noise.connect(hp)
    hp.connect(gain)
    gain.connect(out)
    noise.start(start)
    noise.stop(start + len + 0.02)
  }

  private async playRollWinAsync(): Promise<void> {
    try {
      const ctx = await this.ensureRunning()
      if (!ctx) {
        return
      }
      const out = this.getOutput(ctx)
      const t = ctx.currentTime

      const steps = [
        { at: 0, freq: 392, peak: 0.1, hold: 0.1 },
        { at: 0.085, freq: 493.88, peak: 0.11, hold: 0.1 },
        { at: 0.17, freq: 587.33, peak: 0.12, hold: 0.11 },
        { at: 0.26, freq: 783.99, peak: 0.15, hold: 0.42 },
      ]

      for (const step of steps) {
        this.playWinStingerNote(ctx, out, t + step.at, step.freq, step.peak, step.hold)
      }

      this.playWinSparkle(ctx, out, t + 0.34)
      this.playWinSparkle(ctx, out, t + 0.38)
    } catch {
      // autoplay policy — ignore
    }
  }

  /** Soft affirming chime when the winner confirms in chat. */
  playWinnerConfirmed(): void {
    void this.playWinnerConfirmedAsync()
  }

  private async playWinnerConfirmedAsync(): Promise<void> {
    try {
      const ctx = await this.ensureRunning()
      if (!ctx) {
        return
      }
      const out = this.getOutput(ctx)
      const t = ctx.currentTime
      this.playBell(ctx, out, t, 880, 0.085, 0.28)
      this.playBell(ctx, out, t + 0.1, 1174.66, 0.07, 0.4)
    } catch {
      // ignore
    }
  }
}

export const chatRollAudio = new ChatRollAudio()

export function attachChatRollAudioUnlock(): () => void {
  void chatRollAudio.unlock()

  const retryUnlock = () => {
    void chatRollAudio.unlock()
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
