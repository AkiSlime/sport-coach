import { useCallback, useRef, useEffect } from 'react'
import { useVoiceCoachStore } from '@/store/useVoiceCoachStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { startListening, stopListening, isSTTSupported } from '@/lib/voice/stt'
import { streamChatCompletion } from '@/lib/voice/llm'
import { buildSystemPrompt } from '@/lib/voice/system-prompt'
import { feedToken, flushBuffer, resetCoachTTS } from '@/lib/voice/tts'
import type { WorkoutContext } from '@/lib/voice/types'
import type { Program } from '@/types/workout'

export function useVoiceCoach(program: Program | undefined) {
  const status = useVoiceCoachStore((s) => s.status)
  const transcript = useVoiceCoachStore((s) => s.transcript)
  const lastResponse = useVoiceCoachStore((s) => s.lastResponse)
  const error = useVoiceCoachStore((s) => s.error)
  const setStatus = useVoiceCoachStore((s) => s.setStatus)
  const setTranscript = useVoiceCoachStore((s) => s.setTranscript)
  const addMessage = useVoiceCoachStore((s) => s.addMessage)
  const setLastResponse = useVoiceCoachStore((s) => s.setLastResponse)
  const setError = useVoiceCoachStore((s) => s.setError)
  const clearConversation = useVoiceCoachStore((s) => s.clearConversation)

  const groqApiKey = useSettingsStore((s) => s.groqApiKey)
  const voiceCoachEnabled = useSettingsStore((s) => s.voiceCoachEnabled)

  const playerStatus = usePlayerStore((s) => s.status)
  const steps = usePlayerStore((s) => s.steps)
  const currentStepIndex = usePlayerStore((s) => s.currentStepIndex)
  const totalElapsedSeconds = usePlayerStore((s) => s.totalElapsedSeconds)

  const abortRef = useRef<AbortController | null>(null)

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening()
      abortRef.current?.abort()
      resetCoachTTS()
      clearConversation()
    }
  }, [clearConversation])

  const getWorkoutContext = useCallback((): WorkoutContext | null => {
    if (!program) return null
    const currentStep = steps[currentStepIndex] ?? null
    return {
      program,
      currentStep,
      currentStepIndex,
      totalSteps: steps.length,
      totalElapsedSeconds,
      isPlaying: playerStatus === 'playing',
    }
  }, [program, steps, currentStepIndex, totalElapsedSeconds, playerStatus])

  const sendToLLM = useCallback(
    async (userText: string) => {
      if (!groqApiKey) {
        setError('Clé API Groq manquante. Configurez-la dans les paramètres.')
        setStatus('idle')
        return
      }

      setStatus('thinking')
      addMessage({ role: 'user', content: userText })

      const ctx = getWorkoutContext()
      if (!ctx) {
        setError('Programme non disponible.')
        setStatus('idle')
        return
      }
      const systemPrompt = buildSystemPrompt(ctx)

      // Get current messages + new user message
      const allMessages = [
        ...useVoiceCoachStore.getState().messages,
      ]

      abortRef.current = new AbortController()
      let fullResponse = ''

      await streamChatCompletion(
        groqApiKey,
        systemPrompt,
        allMessages,
        {
          onToken: (token) => {
            fullResponse += token
            setLastResponse(fullResponse)
            setStatus('speaking')
            feedToken(token)
          },
          onDone: (text) => {
            flushBuffer()
            addMessage({ role: 'assistant', content: text })
            // Status will go back to idle after TTS finishes
            // For now, set a timeout as fallback
            setTimeout(() => {
              if (useVoiceCoachStore.getState().status === 'speaking') {
                setStatus('idle')
              }
            }, 10000)
          },
          onError: (err) => {
            setError(err.message)
            setStatus('idle')
          },
        },
        abortRef.current.signal,
      )

      // If no tokens were received (empty response), go back to idle
      if (!fullResponse) {
        setStatus('idle')
      }
    },
    [groqApiKey, getWorkoutContext, addMessage, setLastResponse, setStatus, setError],
  )

  const handleStartListening = useCallback(() => {
    if (!voiceCoachEnabled || !groqApiKey) {
      if (!groqApiKey) {
        setError('Clé API Groq manquante. Configurez-la dans les paramètres.')
      }
      return
    }

    setError(null)
    setTranscript('')
    setLastResponse('')
    setStatus('listening')
    resetCoachTTS()

    startListening({
      onResult: (text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          setStatus('thinking')
          sendToLLM(text)
        }
      },
      onError: (errMsg) => {
        setError(errMsg)
        setStatus('idle')
      },
      onEnd: () => {
        // If still listening (no final result received), handle gracefully
        const currentStatus = useVoiceCoachStore.getState().status
        if (currentStatus === 'listening') {
          const currentTranscript = useVoiceCoachStore.getState().transcript
          if (currentTranscript.trim()) {
            // We have some text, send it
            sendToLLM(currentTranscript.trim())
          } else {
            setStatus('idle')
          }
        }
      },
    })
  }, [voiceCoachEnabled, groqApiKey, setError, setTranscript, setLastResponse, setStatus, sendToLLM])

  const handleStopListening = useCallback(() => {
    stopListening()
    abortRef.current?.abort()
    resetCoachTTS()
    setStatus('idle')
    setTranscript('')
  }, [setStatus, setTranscript])

  const isAvailable = voiceCoachEnabled && !!groqApiKey && isSTTSupported()

  return {
    status,
    transcript,
    lastResponse,
    error,
    isAvailable,
    hasApiKey: !!groqApiKey,
    isSTTSupported: isSTTSupported(),
    startListening: handleStartListening,
    stopListening: handleStopListening,
  }
}
