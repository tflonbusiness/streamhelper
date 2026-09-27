/** Prize spin overlay — soft casino wheel tick + two-note win bell (Web Audio, no files). */
class PrizeSpinWheelAudio {
  private ctx: AudioContext | null = null

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
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  private connectToOutput(
    ctx: AudioContext,
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
    gain.connect(ctx.destination)
  }

  /** Muted peg tick: light transient + gentle pitch drop. */
  playTick(): void {
    try {
      const ctx = this.getContext()
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
      this.connectToOutput(ctx, t, clickFilter, 0.055, 0.003, clickDur + 0.012)

      const peg = ctx.createOscillator()
      peg.type = 'sine'
      peg.frequency.setValueAtTime(720, t)
      peg.frequency.exponentialRampToValueAtTime(280, t + 0.038)

      const pegGain = ctx.createGain()
      pegGain.gain.setValueAtTime(0.0001, t)
      pegGain.gain.linearRampToValueAtTime(0.09, t + 0.004)
      pegGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.038)
      peg.connect(pegGain)
      pegGain.connect(ctx.destination)

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
    gain.connect(ctx.destination)
    partialGain.connect(ctx.destination)

    const stopAt = start + ringSec + 0.04
    osc.start(start)
    partial.start(start)
    osc.stop(stopAt)
    partial.stop(stopAt)
  }

  playWin(): void {
    try {
      const ctx = this.getContext()
      const t = ctx.currentTime
      this.playStudioBell(ctx, t, 523.25, 0.1, 0.35)
      this.playStudioBell(ctx, t + 0.14, 783.99, 0.095, 0.55)
    } catch {
      // ignore
    }
  }
}

export const prizeSpinWheelAudio = new PrizeSpinWheelAudio()
