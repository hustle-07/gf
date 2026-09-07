// Web Audio API Synthesized Sound Engine with rich romantic carnival ambiance and fireworks effects

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private isInitialized: boolean = false;
  private musicInterval: any = null;
  private ambientInterval: any = null;

  private init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  public async resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Romantic Carnival Waltz Music Box Synthesizer ---
  public startCarnivalMusic() {
    this.resume();
    if (this.isMusicPlaying || !this.ctx || !this.musicGain) return;
    this.isMusicPlaying = true;

    // A nostalgic romantic carnival waltz chord progression (3/4 time)
    // Keys: C major / A minor / F major / G7 romantically voiced
    const melodyNotes = [
      523.25, 659.25, 783.99, 1046.50, // C5, E5, G5, C6
      587.33, 698.46, 880.00, 1046.50, // D5, F5, A5, C6
      659.25, 783.99, 987.77, 1174.66, // E5, G5, B5, D6
      523.25, 783.99, 1046.50, 1318.51, // C5, G5, C6, E6
      440.00, 523.25, 659.25, 880.00,  // A4, C5, E5, A5
      392.00, 493.88, 587.33, 783.99,  // G4, B4, D5, G5
      349.23, 440.00, 523.25, 698.46,  // F4, A4, C5, F5
      392.00, 493.88, 587.33, 698.46   // G4, B4, D5, F5
    ];

    const bassNotes = [
      130.81, 261.63, 261.63, // C3, C4, C4 (oom-pah-pah)
      146.83, 293.66, 293.66, // D3, D4, D4
      164.81, 329.63, 329.63, // E3, E4, E4
      130.81, 261.63, 261.63, // C3, C4, C4
      110.00, 220.00, 220.00, // A2, A3, A3
      98.00, 196.00, 196.00,  // G2, G3, G3
      87.31, 174.61, 174.61,  // F2, F3, F3
      98.00, 196.00, 196.00   // G2, G3, G3
    ];

    let step = 0;
    const tempo = 380; // ms per beat

    const playStep = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const now = this.ctx.currentTime;

      // Play Bass / Accordion accompaniment
      const bassIndex = step % bassNotes.length;
      const bassFreq = bassNotes[bassIndex];
      this.playTone(bassFreq, now, 0.35, 'triangle', 0.12, this.musicGain);

      // Play Celestial Music Box Melodic Arpeggios
      if (step % 2 === 0 || Math.random() > 0.3) {
        const melIndex = Math.floor(step / 3) % (melodyNotes.length / 4);
        const noteIndex = melIndex * 4 + (step % 4);
        const melFreq = melodyNotes[noteIndex % melodyNotes.length];
        this.playBell(melFreq, now, 1.2, 0.18, this.musicGain);
      }

      step++;
    };

    this.musicInterval = setInterval(playStep, tempo);
    this.startAmbientNight();
  }

  public stopCarnivalMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) clearInterval(this.musicInterval);
    if (this.ambientInterval) clearInterval(this.ambientInterval);
  }

  // --- Ambient Night Crickets & Fairground Atmosphere ---
  private startAmbientNight() {
    if (!this.ctx || !this.ambientGain) return;

    // Gentle wind / breeze white noise filtered
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.ambientGain);
      noise.start();
    } catch (e) {
      // Ignored
    }

    // Occasional cricket chirp
    this.ambientInterval = setInterval(() => {
      if (!this.isMusicPlaying || !this.ctx || !this.ambientGain) return;
      if (Math.random() > 0.4) {
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
          this.playTone(4500 + Math.random() * 200, now + i * 0.04, 0.025, 'sine', 0.015, this.ambientGain);
        }
      }
    }, 1800);
  }

  // --- Sound Effects: Firework Launch Whistle & Explosion ---
  public playFireworkLaunch() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';

    // Rising whistle frequency
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.7);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playFireworkExplosion() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Low boom oscillator
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1.2);

    oscGain.gain.setValueAtTime(0.8, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.25);

    // Crackle noise burst
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.8);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.2));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.linearRampToValueAtTime(200, now + 0.8);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.6, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.85);
    } catch (e) {
      // Ignored
    }

    // High sparkle shimmer
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!this.ctx || !this.sfxGain) return;
        const sparkleTime = this.ctx.currentTime;
        this.playBell(1800 + Math.random() * 1200, sparkleTime, 0.4, 0.08, this.sfxGain);
      }, 150 + i * 80);
    }
  }

  // --- Sound Effect: Ferris Wheel Chime / Lever Clink ---
  public playFerrisWheelStart() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      this.playBell(freq, now + idx * 0.12, 1.5, 0.2, this.sfxGain!);
    });
  }

  // --- Sound Effect: Message Reveal Sparkle Arpeggio ---
  public playMessageRevealChime() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const scale = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51, 1567.98];
    scale.forEach((freq, i) => {
      this.playBell(freq, now + i * 0.08, 1.8, 0.25, this.sfxGain!);
    });
  }

  // --- Sound Effect: Proposal Fanfare / Angelic Chord ---
  public playProposalChime() {
    this.resume();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const majorChord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    majorChord.forEach((freq) => {
      this.playBell(freq, now, 3.5, 0.3, this.sfxGain!);
    });
  }

  private playTone(freq: number, time: number, duration: number, type: OscillatorType, volume: number, target: GainNode) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(target);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playBell(freq: number, time: number, duration: number, volume: number, target: GainNode) {
    if (!this.ctx) return;
    // Fundamental + harmonics for bell/celesta sound
    const harmonics = [1, 2.01, 3.02, 4.2];
    const weights = [1, 0.4, 0.2, 0.08];

    harmonics.forEach((h, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * h, time);

      const harmonicVol = volume * weights[idx];
      gain.gain.setValueAtTime(harmonicVol, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration / (idx + 1));

      osc.connect(gain);
      gain.connect(target);

      osc.start(time);
      osc.stop(time + duration + 0.05);
    });
  }
}

export const soundEngine = new SoundEngine();
