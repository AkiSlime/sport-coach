export interface STTCallbacks {
  onResult: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
  onEnd: () => void
}

const SpeechRecognitionClass =
  (typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition)) ||
  null

export function isSTTSupported(): boolean {
  return SpeechRecognitionClass !== null
}

let activeRecognition: any = null

export function startListening(callbacks: STTCallbacks): void {
  if (!SpeechRecognitionClass) {
    callbacks.onError('Reconnaissance vocale non supportée par ce navigateur.')
    return
  }

  // Stop any existing session
  stopListening()

  const recognition = new SpeechRecognitionClass()
  activeRecognition = recognition

  recognition.lang = 'fr-FR'
  recognition.continuous = false
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  recognition.onresult = (event: any) => {
    let finalTranscript = ''
    let interimTranscript = ''

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript
      } else {
        interimTranscript += result[0].transcript
      }
    }

    if (finalTranscript) {
      callbacks.onResult(finalTranscript, true)
    } else if (interimTranscript) {
      callbacks.onResult(interimTranscript, false)
    }
  }

  recognition.onerror = (event: any) => {
    const errorMap: Record<string, string> = {
      'no-speech': 'Aucune parole détectée.',
      'audio-capture': 'Microphone non disponible.',
      'not-allowed': 'Accès au microphone refusé.',
      network: 'Erreur réseau pour la reconnaissance vocale.',
    }
    callbacks.onError(errorMap[event.error] ?? `Erreur: ${event.error}`)
  }

  recognition.onend = () => {
    if (activeRecognition === recognition) {
      activeRecognition = null
    }
    callbacks.onEnd()
  }

  try {
    recognition.start()
  } catch {
    callbacks.onError('Impossible de démarrer la reconnaissance vocale.')
  }
}

export function stopListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop()
    } catch {
      // already stopped
    }
    activeRecognition = null
  }
}
