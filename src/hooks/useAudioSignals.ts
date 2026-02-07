import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { playCountdownBeep, playGoBeep, playRestBeep, speakExerciseName, speakCountdown } from '@/lib/audio'

export function useAudioSignals() {
  const status = usePlayerStore((s) => s.status)
  const currentStepIndex = usePlayerStore((s) => s.currentStepIndex)
  const secondsRemaining = usePlayerStore((s) => s.secondsRemaining)
  const steps = usePlayerStore((s) => s.steps)

  const prevStepIndexRef = useRef(-1)

  // Announce exercise name + beep on step transition
  useEffect(() => {
    if (status !== 'playing') return
    if (currentStepIndex === prevStepIndexRef.current) return

    prevStepIndexRef.current = currentStepIndex
    const step = steps[currentStepIndex]
    if (!step) return

    if (step.type === 'exercise') {
      // Announce the exercise name, then beep
      speakExerciseName(step.label)
      setTimeout(() => playGoBeep(), 600)
    } else {
      playRestBeep()
    }
  }, [currentStepIndex, status, steps])

  // Voice countdown (3, 2, 1) + beep on last 3 seconds
  useEffect(() => {
    if (status !== 'playing') return
    const step = steps[currentStepIndex]
    if (!step || step.durationSeconds === null) return

    if (secondsRemaining >= 1 && secondsRemaining <= 3) {
      speakCountdown(secondsRemaining)
      playCountdownBeep(secondsRemaining)
    }
  }, [secondsRemaining, status, steps, currentStepIndex])
}
