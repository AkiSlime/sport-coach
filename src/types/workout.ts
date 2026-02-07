export type ExerciseType = 'timed' | 'reps'
export type PhaseType = 'warmup' | 'main' | 'core' | 'cooldown'
export type StepType = 'exercise' | 'rest' | 'cycle-rest'
export type PlayerStatus = 'idle' | 'countdown' | 'playing' | 'paused' | 'finished'

export interface Exercise {
  id: string
  name: string
  type: ExerciseType
  durationSeconds: number // used when type === 'timed'
  reps: number // used when type === 'reps'
  restAfterSeconds: number
}

export interface Phase {
  id: string
  type: PhaseType
  name: string
  exercises: Exercise[]
  cycles: number
  restBetweenCyclesSeconds: number
}

export interface Program {
  id: string
  name: string
  phases: Phase[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutStep {
  id: string
  type: StepType
  label: string
  phaseId: string
  phaseName: string
  phaseType: PhaseType
  exerciseType: ExerciseType
  durationSeconds: number | null // null for reps-based
  reps: number | null
  currentCycle: number
  totalCycles: number
  exerciseIndex: number
  totalExercisesInPhase: number
}
