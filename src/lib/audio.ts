import { interruptCoach, resumeCoach } from '@/lib/voice/tts'

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playBeep(
  frequency = 880,
  durationMs = 100,
  volume = 0.3,
): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durationMs / 1000,
    )

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + durationMs / 1000)
  } catch {
    // Audio not available
  }
}

export function playCountdownBeep(secondsLeft: number): void {
  const freqMap: Record<number, number> = { 3: 660, 2: 880, 1: 1100 }
  const freq = freqMap[secondsLeft]
  if (freq) playBeep(freq, 150)
}

export function playGoBeep(): void {
  playBeep(1320, 400, 0.5)
}

export function playRestBeep(): void {
  playBeep(440, 100, 0.3)
  setTimeout(() => playBeep(440, 100, 0.3), 200)
}

// ─── Speech Synthesis ───────────────────────────────────────

let frenchVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false

function loadFrenchVoice() {
  if (voicesLoaded) return
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return
  voicesLoaded = true
  frenchVoice =
    voices.find((v) => v.lang.startsWith('fr') && v.localService) ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    null
}

/**
 * Speak text using the Web Speech API.
 * Uses a small delay after cancel() to work around browser bugs
 * where rapid cancel+speak sequences lock the synthesizer.
 */
let speakTimeout: ReturnType<typeof setTimeout> | null = null

export function speak(text: string, rate = 1.1): void {
  try {
    if (!('speechSynthesis' in window)) return
    loadFrenchVoice()

    // Interrupt coach speech for higher-priority announcements
    interruptCoach()

    // Clear any pending delayed speak
    if (speakTimeout) {
      clearTimeout(speakTimeout)
      speakTimeout = null
    }

    speechSynthesis.cancel()

    // Small delay after cancel() — Chrome/Safari can lock if speak() is
    // called synchronously right after cancel().
    speakTimeout = setTimeout(() => {
      speakTimeout = null
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'fr-FR'
      utterance.rate = rate
      utterance.volume = 1
      if (frenchVoice) utterance.voice = frenchVoice
      utterance.onend = () => resumeCoach()
      utterance.onerror = () => resumeCoach()
      speechSynthesis.speak(utterance)
    }, 50)
  } catch {
    // Speech not available
  }
}

/** Cancel any ongoing or pending speech */
export function stopSpeaking(): void {
  if (speakTimeout) {
    clearTimeout(speakTimeout)
    speakTimeout = null
  }
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
}

export function speakCountdown(secondsLeft: number): void {
  speak(String(secondsLeft), 1.3)
}

export function speakExerciseName(name: string): void {
  speak(name, 1.0)
}

export function unlockAudio(): void {
  getAudioContext()
  // Pre-load voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices()
    speechSynthesis.onvoiceschanged = () => {
      loadFrenchVoice()
    }
  }
}
