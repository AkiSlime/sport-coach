import { create } from 'zustand'
import type { WorkoutStep, PlayerStatus } from '@/types/workout'

interface PlayerStore {
  status: PlayerStatus
  steps: WorkoutStep[]
  currentStepIndex: number
  secondsRemaining: number
  totalElapsedSeconds: number
  // Actions
  startWorkout: (steps: WorkoutStep[]) => void
  tick: () => void
  pause: () => void
  resume: () => void
  skipStep: () => void
  markRepsDone: () => void
  restartStep: () => void
  stopWorkout: () => void
  // Computed-like getters
  currentStep: () => WorkoutStep | null
  progress: () => number
}

export const usePlayerStore = create<PlayerStore>()((set, get) => ({
  status: 'idle',
  steps: [],
  currentStepIndex: 0,
  secondsRemaining: 0,
  totalElapsedSeconds: 0,

  startWorkout: (steps) => {
    if (steps.length === 0) return
    const first = steps[0]
    set({
      status: 'playing',
      steps,
      currentStepIndex: 0,
      secondsRemaining: first.durationSeconds ?? 0,
      totalElapsedSeconds: 0,
    })
  },

  tick: () => {
    const state = get()
    if (state.status !== 'playing') return

    const currentStep = state.steps[state.currentStepIndex]
    if (!currentStep) return

    const newElapsed = state.totalElapsedSeconds + 1

    // For timed steps
    if (currentStep.durationSeconds !== null) {
      const newRemaining = state.secondsRemaining - 1

      if (newRemaining <= 0) {
        // Advance to next step
        const nextIndex = state.currentStepIndex + 1
        if (nextIndex >= state.steps.length) {
          set({ status: 'finished', totalElapsedSeconds: newElapsed, secondsRemaining: 0 })
          return
        }
        const nextStep = state.steps[nextIndex]
        set({
          currentStepIndex: nextIndex,
          secondsRemaining: nextStep.durationSeconds ?? 0,
          totalElapsedSeconds: newElapsed,
        })
        return
      }

      set({
        secondsRemaining: newRemaining,
        totalElapsedSeconds: newElapsed,
      })
      return
    }

    // For reps-based: just increment elapsed
    set({ totalElapsedSeconds: newElapsed })
  },

  pause: () => {
    if (get().status === 'playing') {
      set({ status: 'paused' })
    }
  },

  resume: () => {
    if (get().status === 'paused') {
      set({ status: 'playing' })
    }
  },

  skipStep: () => {
    const state = get()
    const nextIndex = state.currentStepIndex + 1
    if (nextIndex >= state.steps.length) {
      set({ status: 'finished', secondsRemaining: 0 })
      return
    }
    const nextStep = state.steps[nextIndex]
    set({
      currentStepIndex: nextIndex,
      secondsRemaining: nextStep.durationSeconds ?? 0,
    })
  },

  markRepsDone: () => {
    // Same as skipStep — advance past the reps exercise
    const state = get()
    const nextIndex = state.currentStepIndex + 1
    if (nextIndex >= state.steps.length) {
      set({ status: 'finished', secondsRemaining: 0 })
      return
    }
    const nextStep = state.steps[nextIndex]
    set({
      currentStepIndex: nextIndex,
      secondsRemaining: nextStep.durationSeconds ?? 0,
    })
  },

  restartStep: () => {
    const state = get()
    const currentStep = state.steps[state.currentStepIndex]
    if (!currentStep) return
    set({
      secondsRemaining: currentStep.durationSeconds ?? 0,
    })
  },

  stopWorkout: () => {
    set({
      status: 'idle',
      steps: [],
      currentStepIndex: 0,
      secondsRemaining: 0,
      totalElapsedSeconds: 0,
    })
  },

  currentStep: () => {
    const state = get()
    return state.steps[state.currentStepIndex] ?? null
  },

  progress: () => {
    const state = get()
    if (state.steps.length === 0) return 0
    return (state.currentStepIndex / state.steps.length) * 100
  },
}))
