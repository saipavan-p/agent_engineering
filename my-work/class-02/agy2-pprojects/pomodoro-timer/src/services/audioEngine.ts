// Web Audio API procedural sound synthesis for ambient noise and calming chimes
// Completely zero external audio dependencies (works 100% offline)

import { AmbientSoundType, ChimeSoundType } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private ambientNodes: Map<AmbientSoundType, {
    sourceNodes: (AudioNode | number)[];
    gainNode: GainNode;
  }> = new Map();
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(volume: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  // --- NOISE BUFFER GENERATORS ---
  private createWhiteNoiseBuffer(seconds = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private createPinkNoiseBuffer(seconds = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  private createBrownNoiseBuffer(seconds = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Gain compensation
    }
    return buffer;
  }

  // --- AMBIENT SOUND GENERATORS ---
  public startAmbient(type: AmbientSoundType, volume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ambientNodes.has(type)) {
      this.setAmbientVolume(type, volume);
      return;
    }

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    const sourceNodes: (AudioNode | number)[] = [];

    switch (type) {
      case 'rain': {
        // Rain is filtered pink noise + randomized droplet bursts
        const noiseBuffer = this.createPinkNoiseBuffer(6);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(1000, this.ctx.currentTime);

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

        noiseSource.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(gainNode);
        noiseSource.start();
        sourceNodes.push(noiseSource, highpass, lowpass);

        // Randomized raindrop burst loop
        const dropletInterval = window.setInterval(() => {
          if (!this.ctx || !this.ambientNodes.has('rain')) return;
          try {
            const osc = this.ctx.createOscillator();
            const dropGain = this.ctx.createGain();
            const freq = 1200 + Math.random() * 1600;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.4, this.ctx.currentTime + 0.08);

            dropGain.gain.setValueAtTime(0.04 * Math.random(), this.ctx.currentTime);
            dropGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

            osc.connect(dropGain);
            dropGain.connect(gainNode);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
          } catch {
            // Context closed or unready
          }
        }, 120);

        sourceNodes.push(dropletInterval);
        break;
      }

      case 'ocean': {
        // Ocean is Brown noise modulated with an ultra-slow LFO (waves rolling in & out)
        const brownBuffer = this.createBrownNoiseBuffer(6);
        const source = this.ctx.createBufferSource();
        source.buffer = brownBuffer;
        source.loop = true;

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(450, this.ctx.currentTime);

        // LFO for wave swelling
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave cycle
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

        const waveModGain = this.ctx.createGain();
        waveModGain.gain.setValueAtTime(0.5, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(waveModGain.gain);

        source.connect(lowpass);
        lowpass.connect(waveModGain);
        waveModGain.connect(gainNode);

        source.start();
        lfo.start();
        sourceNodes.push(source, lfo, lowpass, lfoGain, waveModGain);
        break;
      }

      case 'forest': {
        // Forest wind: pink noise passing through swept bandpass filter with slight resonance
        const pinkBuffer = this.createPinkNoiseBuffer(6);
        const source = this.ctx.createBufferSource();
        source.buffer = pinkBuffer;
        source.loop = true;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(400, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(1.8, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(bandpass.frequency);

        source.connect(bandpass);
        bandpass.connect(gainNode);

        source.start();
        lfo.start();
        sourceNodes.push(source, lfo, bandpass, lfoGain);

        // Occasional gentle distant woodbird whistle
        const birdInterval = window.setInterval(() => {
          if (!this.ctx || !this.ambientNodes.has('forest') || Math.random() > 0.4) return;
          try {
            const osc = this.ctx.createOscillator();
            const birdGain = this.ctx.createGain();
            const baseFreq = 2800 + Math.random() * 800;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(baseFreq + 600, this.ctx.currentTime + 0.12);
            osc.frequency.linearRampToValueAtTime(baseFreq + 200, this.ctx.currentTime + 0.25);

            birdGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
            birdGain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + 0.05);
            birdGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);

            osc.connect(birdGain);
            birdGain.connect(gainNode);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.26);
          } catch {
            // safely ignore
          }
        }, 3500);

        sourceNodes.push(birdInterval);
        break;
      }

      case 'fire': {
        // Fire: deep low-pass rumble + randomized crackle pulses
        const brownBuffer = this.createBrownNoiseBuffer(4);
        const source = this.ctx.createBufferSource();
        source.buffer = brownBuffer;
        source.loop = true;

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(220, this.ctx.currentTime);

        source.connect(lowpass);
        lowpass.connect(gainNode);
        source.start();
        sourceNodes.push(source, lowpass);

        // Crackle bursts
        const crackleInterval = window.setInterval(() => {
          if (!this.ctx || !this.ambientNodes.has('fire')) return;
          try {
            const crackleCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < crackleCount; i++) {
              const noise = this.ctx.createBufferSource();
              noise.buffer = this.createWhiteNoiseBuffer(0.05);
              const filter = this.ctx.createBiquadFilter();
              filter.type = 'highpass';
              filter.frequency.value = 1500 + Math.random() * 2000;

              const cGain = this.ctx.createGain();
              const startT = this.ctx.currentTime + (i * 0.04);
              cGain.gain.setValueAtTime(0.06 * Math.random(), startT);
              cGain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.03);

              noise.connect(filter);
              filter.connect(cGain);
              cGain.connect(gainNode);

              noise.start(startT);
              noise.stop(startT + 0.04);
            }
          } catch {
            // safely ignore
          }
        }, 160);

        sourceNodes.push(crackleInterval);
        break;
      }

      case 'cafe': {
        // Warm cafe murmur: multiple shaped pink noise bands + subtle resonance
        const pinkBuffer = this.createPinkNoiseBuffer(5);
        const source = this.ctx.createBufferSource();
        source.buffer = pinkBuffer;
        source.loop = true;

        const filter1 = this.ctx.createBiquadFilter();
        filter1.type = 'bandpass';
        filter1.frequency.value = 500;
        filter1.Q.value = 1.0;

        const filter2 = this.ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.value = 850;

        source.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(gainNode);
        source.start();
        sourceNodes.push(source, filter1, filter2);
        break;
      }

      case 'binaural': {
        // 10 Hz Alpha wave binaural entrainment (Left: 200Hz, Right: 210Hz)
        const leftOsc = this.ctx.createOscillator();
        const rightOsc = this.ctx.createOscillator();
        leftOsc.type = 'sine';
        rightOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(200, this.ctx.currentTime);
        rightOsc.frequency.setValueAtTime(210, this.ctx.currentTime); // 10Hz Alpha difference

        const merger = this.ctx.createChannelMerger(2);
        const leftGain = this.ctx.createGain();
        const rightGain = this.ctx.createGain();
        leftGain.gain.value = 0.35;
        rightGain.gain.value = 0.35;

        leftOsc.connect(leftGain);
        rightOsc.connect(rightGain);

        leftGain.connect(merger, 0, 0); // connect to left channel
        rightGain.connect(merger, 0, 1); // connect to right channel

        merger.connect(gainNode);

        leftOsc.start();
        rightOsc.start();
        sourceNodes.push(leftOsc, rightOsc, leftGain, rightGain, merger);
        break;
      }
    }

    this.ambientNodes.set(type, { sourceNodes, gainNode });
  }

  public stopAmbient(type: AmbientSoundType) {
    const entry = this.ambientNodes.get(type);
    if (!entry) return;

    entry.sourceNodes.forEach((node) => {
      if (typeof node === 'number') {
        clearInterval(node);
      } else if (node instanceof AudioScheduledSourceNode) {
        try {
          node.stop();
          node.disconnect();
        } catch {
          // already stopped
        }
      } else {
        try {
          node.disconnect();
        } catch {
          // ignore
        }
      }
    });

    this.ambientNodes.delete(type);
  }

  public setAmbientVolume(type: AmbientSoundType, volume: number) {
    const entry = this.ambientNodes.get(type);
    if (entry && this.ctx) {
      entry.gainNode.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime, 0.05);
    }
  }

  public stopAllAmbient() {
    const keys = Array.from(this.ambientNodes.keys());
    keys.forEach((key) => this.stopAmbient(key));
  }

  // --- CALMING COMPLETION CHIMES ---
  public playChime(type: ChimeSoundType = 'tibetan', volume = 0.8) {
    if (type === 'none') return;
    this.initContext();
    if (!this.ctx) return;

    const chimeGain = this.ctx.createGain();
    chimeGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    chimeGain.connect(this.ctx.destination);

    const now = this.ctx.currentTime;

    switch (type) {
      case 'tibetan': {
        // Tibetan singing bowl: harmonic overtones (220Hz fundamental, 659Hz, 1100Hz) with long rich resonance
        const freqs = [216, 432, 654, 1088];
        const amps = [0.4, 0.25, 0.15, 0.08];

        freqs.forEach((freq, index) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // subtle frequency vibrato
          const vib = this.ctx.createOscillator();
          const vibGain = this.ctx.createGain();
          vib.frequency.setValueAtTime(3.5, now);
          vibGain.gain.setValueAtTime(1.5, now);
          vib.connect(osc.frequency);
          vib.start(now);
          vib.stop(now + 4.5);

          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(amps[index], now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

          osc.connect(gain);
          gain.connect(chimeGain);

          osc.start(now);
          osc.stop(now + 4.6);
        });
        break;
      }

      case 'crystal': {
        // Crystal bell: crisp high pure chime (880Hz, 1760Hz, 2640Hz)
        const freqs = [880, 1320, 1760, 2640];
        const amps = [0.35, 0.2, 0.15, 0.08];

        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(amps[idx], now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

          osc.connect(gain);
          gain.connect(chimeGain);

          osc.start(now);
          osc.stop(now + 2.9);
        });
        break;
      }

      case 'bell': {
        // Standard pleasant acoustic bell
        const freqs = [523.25, 1046.5, 1567.98]; // C5, C6, G6
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.25 / (idx + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

          osc.connect(gain);
          gain.connect(chimeGain);

          osc.start(now);
          osc.stop(now + 2.1);
        });
        break;
      }

      case 'woodblock': {
        // Soft meditative temple woodblock
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(chimeGain);

        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  }

  // Soft tactile tick for timer countdown (optional)
  public playTick() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.02);
    } catch {
      // ignore
    }
  }
}

export const audioEngine = new AudioEngine();
