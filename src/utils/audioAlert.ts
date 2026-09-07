/**
 * TECXAI Audio Alert Engine
 * Web Audio API synthesizer for high-decibel loud alerts on Android & Mobile browsers.
 */

let audioCtx: AudioContext | null = null;
let activeOscillators: (OscillatorNode | AudioScheduledSourceNode)[] = [];
let alarmIntervalId: number | null = null;
let isPlaying = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isAlarmActive(): boolean {
  return isPlaying;
}

export function stopLoudAlarm() {
  if (alarmIntervalId !== null) {
    window.clearInterval(alarmIntervalId);
    alarmIntervalId = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped
    }
  });
  activeOscillators = [];
  isPlaying = false;

  // Stop vibration if active
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  } catch (err) {
    console.warn('Audio chime error:', err);
  }
}

export function playLoudAlarm(
  type: 'siren' | 'pulsing' | 'high_pitch' | 'radar' = 'siren',
  volume: number = 0.9,
  enableVibration: boolean = true
) {
  stopLoudAlarm();
  isPlaying = true;

  try {
    const ctx = getAudioContext();

    // Trigger Android hardware vibration
    if (enableVibration && 'vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 800]);
    }

    // Dynamics compressor for maximum clear loudness without distortion
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, ctx.currentTime);
    compressor.knee.setValueAtTime(20, ctx.currentTime);
    compressor.ratio.setValueAtTime(10, ctx.currentTime);
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);
    compressor.release.setValueAtTime(0.15, ctx.currentTime);
    compressor.connect(ctx.destination);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.max(0.1, Math.min(volume, 1.0)), ctx.currentTime);
    masterGain.connect(compressor);

    if (type === 'siren') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      lfo.type = 'sine';

      osc1.frequency.setValueAtTime(750, ctx.currentTime);
      osc2.frequency.setValueAtTime(754, ctx.currentTime); // Slight detune for fullness

      lfo.frequency.setValueAtTime(1.8, ctx.currentTime); // 1.8 Hz sweep
      lfoGain.gain.setValueAtTime(320, ctx.currentTime); // sweep ±320Hz

      lfo.connect(osc1.frequency);
      lfo.connect(osc2.frequency);

      osc1.connect(masterGain);
      osc2.connect(masterGain);

      lfo.start();
      osc1.start();
      osc2.start();

      activeOscillators.push(lfo, osc1, osc2);
    } else if (type === 'pulsing') {
      const triggerPulse = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const pulseGain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.setValueAtTime(1250, now + 0.1);

        pulseGain.gain.setValueAtTime(volume * 0.8, now);
        pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(pulseGain);
        pulseGain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.25);
      };

      triggerPulse();
      alarmIntervalId = window.setInterval(triggerPulse, 320);
    } else if (type === 'high_pitch') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);

      // Warble modulation
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      mod.frequency.setValueAtTime(8, ctx.currentTime);
      modGain.gain.setValueAtTime(180, ctx.currentTime);
      mod.connect(osc.frequency);

      gain.gain.setValueAtTime(volume * 0.75, ctx.currentTime);

      mod.start();
      osc.start();

      osc.connect(gain);
      gain.connect(masterGain);

      activeOscillators.push(mod, osc);
    } else {
      // Radar ping
      const ping = () => {
        if (!isPlaying) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1100, now);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.18);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.42);
      };

      ping();
      alarmIntervalId = window.setInterval(ping, 600);
    }

    // Auto safety shutoff after 45 seconds to prevent runaway noise
    window.setTimeout(() => {
      if (isPlaying) {
        stopLoudAlarm();
      }
    }, 45000);
  } catch (err) {
    console.error('Failed to trigger audio alarm:', err);
    isPlaying = false;
  }
}
