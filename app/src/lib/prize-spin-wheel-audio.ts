/** Prize spin overlay — soft casino wheel tick + mellow win fanfare (Web Audio, no files). */
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

  private playFanfareNote(
    ctx: AudioContext,
    start: number,
    freq: number,
    peakGain: number,
    durationSec: number,
  ): void {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, start)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1800, start)
    filter.frequency.exponentialRampToValueAtTime(700, start + durationSec * 0.9)
    filter.Q.setValueAtTime(0.4, start)

    osc.connect(filter)
    this.connectToOutput(ctx, start, filter, peakGain, 0.012, durationSec)
    osc.start(start)
    osc.stop(start + durationSec + 0.05)
  }

  /** Softer ascending fanfare + warm final chord. */
  playWin(): void {
    try {
      const ctx = this.getContext()
      const t = ctx.currentTime
      const run = [523.25, 659.25, 783.99, 987.77, 1046.5]
      const step = 0.078

      run.forEach((freq, idx) => {
        this.playFanfareNote(ctx, t + idx * step, freq, 0.085, 0.2)
      })

      const chordStart = t + run.length * step + 0.04
      const chord = [1046.5, 1318.51, 1567.98]
      for (const freq of chord) {
        this.playFanfareNote(ctx, chordStart, freq, 0.07, 0.55)
      }
    } catch {
      // ignore
    }
  }
}

export const prizeSpinWheelAudio = new PrizeSpinWheelAudio()
