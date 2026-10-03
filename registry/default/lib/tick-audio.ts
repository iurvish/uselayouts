export class TickPlayer {
  private ctx: AudioContext | null = null;

  prepare() {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext unavailable
    }
  }

  play(intensity = 0.5) {
    if (typeof window === "undefined") return;
    try {
      this.prepare();
      if (!this.ctx || this.ctx.state !== "running") return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const baseFreq = 800 + intensity * 400;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.015);

      const volume = Math.min(0.2, 0.03 + intensity * 0.12);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.016);
    } catch {
      // Audio error ignored
    }
  }
}

let tickPlayerInstance: TickPlayer | null = null;
export function getTickPlayer(): TickPlayer {
  if (!tickPlayerInstance) {
    tickPlayerInstance = new TickPlayer();
  }
  return tickPlayerInstance;
}
