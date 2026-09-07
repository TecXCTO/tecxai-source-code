/**
 * TECXAI Voice Direction Guidance Engine
 * Uses Web Speech API SpeechSynthesis for hands-free voice directions while solving the Rubik's Cube.
 */

export interface VoiceGuideSettings {
  enabled: boolean;
  rate: number; // 0.8 to 1.5
  pitch: number; // 0.8 to 1.2
  voiceIndex: number;
}

const DEFAULT_SETTINGS: VoiceGuideSettings = {
  enabled: true,
  rate: 1.0,
  pitch: 1.0,
  voiceIndex: 0,
};

let currentSettings: VoiceGuideSettings = { ...DEFAULT_SETTINGS };

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  return window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('en') || v.lang.startsWith('hi'));
}

export function stopVoiceGuidance() {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

export function getVoiceMoveNarration(move: string): string {
  const clean = move.trim();
  switch (clean) {
    case 'U':
      return 'Turn the top white face clockwise 90 degrees.';
    case "U'":
      return 'Turn the top white face counter-clockwise 90 degrees.';
    case 'U2':
      return 'Turn the top white face a half turn, 180 degrees.';
    case 'D':
      return 'Turn the bottom yellow face clockwise 90 degrees.';
    case "D'":
      return 'Turn the bottom yellow face counter-clockwise 90 degrees.';
    case 'D2':
      return 'Turn the bottom yellow face a half turn, 180 degrees.';
    case 'F':
      return 'Turn the front green face clockwise 90 degrees.';
    case "F'":
      return 'Turn the front green face counter-clockwise 90 degrees.';
    case 'F2':
      return 'Turn the front green face a half turn, 180 degrees.';
    case 'B':
      return 'Turn the back blue face clockwise 90 degrees.';
    case "B'":
      return 'Turn the back blue face counter-clockwise 90 degrees.';
    case 'B2':
      return 'Turn the back blue face a half turn, 180 degrees.';
    case 'L':
      return 'Turn the left orange face clockwise 90 degrees.';
    case "L'":
      return 'Turn the left orange face counter-clockwise 90 degrees.';
    case 'L2':
      return 'Turn the left orange face a half turn, 180 degrees.';
    case 'R':
      return 'Turn the right red face clockwise 90 degrees.';
    case "R'":
      return 'Turn the right red face counter-clockwise 90 degrees.';
    case 'R2':
      return 'Turn the right red face a half turn, 180 degrees.';
    default:
      return `Apply move ${clean}.`;
  }
}

export function speakMove(move: string, stepNumber?: number, totalSteps?: number, customText?: string) {
  if (!isSpeechSupported() || !currentSettings.enabled) return;

  try {
    stopVoiceGuidance();

    let textToSpeak = customText;
    if (!textToSpeak) {
      const narration = getVoiceMoveNarration(move);
      if (stepNumber !== undefined && totalSteps !== undefined) {
        textToSpeak = `Step ${stepNumber} of ${totalSteps}. Move ${move}. ${narration}`;
      } else {
        textToSpeak = `Move ${move}. ${narration}`;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = currentSettings.rate;
    utterance.pitch = currentSettings.pitch;

    const voices = getAvailableVoices();
    if (voices.length > 0) {
      utterance.voice = voices[currentSettings.voiceIndex] || voices[0];
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Voice guidance speech error:', err);
  }
}

export function speakCustomMessage(message: string) {
  if (!isSpeechSupported() || !currentSettings.enabled) return;
  try {
    stopVoiceGuidance();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = currentSettings.rate;
    utterance.pitch = currentSettings.pitch;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Custom speech error:', err);
  }
}

export function updateVoiceSettings(settings: Partial<VoiceGuideSettings>) {
  currentSettings = { ...currentSettings, ...settings };
}

export function getVoiceSettings(): VoiceGuideSettings {
  return { ...currentSettings };
}
