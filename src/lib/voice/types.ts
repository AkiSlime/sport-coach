import type { WorkoutStep, Program } from '@/types/workout'

export type VoiceCoachStatus = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface WorkoutContext {
  program: Program
  currentStep: WorkoutStep | null
  currentStepIndex: number
  totalSteps: number
  totalElapsedSeconds: number
  isPlaying: boolean
}
