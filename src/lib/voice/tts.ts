/**
 * Coach TTS — speaks streaming LLM output sentence by sentence.
 * Uses a queue so sentences don't overlap.
 * Can be interrupted by higher-priority audio (countdown, exercise announcements).
 */

let frenchVoice: SpeechSynthesisVoice | null = null
let voicesLoaded = false
let speakQueue: string[] = []
let isSpeaking = false
let interrupted = false

function loadVoice() {
  if (voicesLoaded) return
  const voices = speechSynthesis.getVoices()
  if (voices.length === 0) return
  voicesLoaded = true
  frenchVoice =
    voices.find((v) => v.lang.startsWith('fr') && v.localService) ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    null
}

function processQueue() {
  if (interrupted || isSpeaking || speakQueue.length === 0) return

  const text = speakQueue.shift()!
  isSpeaking = true

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 1.05
  utterance.volume = 1
  if (frenchVoice) utterance.voice = frenchVoice
  utterance.onend = () => {
    isSpeaking = false
    processQueue()
  }

  utterance.onerror = () => {
    isSpeaking = false
    processQueue()
  }

  speechSynthesis.speak(utterance)
}

/** Buffer for accumulating tokens into sentences */
let sentenceBuffer = ''

/** Feed a token from the streaming LLM response */
export function feedToken(token: string): void {
  if (!('speechSynthesis' in window)) return
  loadVoice()

  sentenceBuffer += token

  // Check for sentence boundaries
  const sentenceEnd = /[.!?]\s*$/
  if (sentenceEnd.test(sentenceBuffer)) {
    const sentence = sentenceBuffer.trim()
    sentenceBuffer = ''
    if (sentence) {
      speakQueue.push(sentence)
      processQueue()
    }
  }
}

/** Flush any remaining buffered text (call when LLM stream is done) */
export function flushBuffer(): void {
  const remaining = sentenceBuffer.trim()
  sentenceBuffer = ''
  if (remaining) {
    speakQueue.push(remaining)
    processQueue()
  }
}

/** Interrupt coach speech (called by higher-priority audio) */
export function interruptCoach(): void {
  interrupted = true
  speakQueue = []
  sentenceBuffer = ''
  if (isSpeaking) {
    speechSynthesis.cancel()
    isSpeaking = false

  }
}

/** Resume coach speech capability after interruption */
export function resumeCoach(): void {
  interrupted = false
}

/** Check if coach is currently speaking or has queued speech */
export function isCoachSpeaking(): boolean {
  return isSpeaking || speakQueue.length > 0
}

/** Stop everything and reset */
export function resetCoachTTS(): void {
  interrupted = false
  speakQueue = []
  sentenceBuffer = ''
  if (isSpeaking) {
    speechSynthesis.cancel()
    isSpeaking = false

  }
}
