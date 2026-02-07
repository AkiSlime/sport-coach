import type { Program, WorkoutStep } from '@/types/workout'

export function flattenProgram(program: Program): WorkoutStep[] {
  const steps: WorkoutStep[] = []
  let counter = 0

  for (const phase of program.phases) {
    for (let cycle = 1; cycle <= phase.cycles; cycle++) {
      for (let exIdx = 0; exIdx < phase.exercises.length; exIdx++) {
        const exercise = phase.exercises[exIdx]

        // Exercise step
        steps.push({
          id: `step-${counter++}`,
          type: 'exercise',
          label: exercise.name,
          phaseId: phase.id,
          phaseName: phase.name,
          phaseType: phase.type,
          exerciseType: exercise.type,
          durationSeconds:
            exercise.type === 'timed' ? exercise.durationSeconds : null,
          reps: exercise.type === 'reps' ? exercise.reps : null,
          currentCycle: cycle,
          totalCycles: phase.cycles,
          exerciseIndex: exIdx,
          totalExercisesInPhase: phase.exercises.length,
        })

        // Rest after exercise
        const isLastExInLastCycle =
          exIdx === phase.exercises.length - 1 && cycle === phase.cycles
        if (exercise.restAfterSeconds > 0 && !isLastExInLastCycle) {
          steps.push({
            id: `step-${counter++}`,
            type: 'rest',
            label: 'Repos',
            phaseId: phase.id,
            phaseName: phase.name,
            phaseType: phase.type,
            exerciseType: 'timed',
            durationSeconds: exercise.restAfterSeconds,
            reps: null,
            currentCycle: cycle,
            totalCycles: phase.cycles,
            exerciseIndex: exIdx,
            totalExercisesInPhase: phase.exercises.length,
          })
        }
      }

      // Rest between cycles
      if (cycle < phase.cycles && phase.restBetweenCyclesSeconds > 0) {
        steps.push({
          id: `step-${counter++}`,
          type: 'cycle-rest',
          label: 'Repos entre les cycles',
          phaseId: phase.id,
          phaseName: phase.name,
          phaseType: phase.type,
          exerciseType: 'timed',
          durationSeconds: phase.restBetweenCyclesSeconds,
          reps: null,
          currentCycle: cycle,
          totalCycles: phase.cycles,
          exerciseIndex: -1,
          totalExercisesInPhase: phase.exercises.length,
        })
      }
    }
  }

  return steps
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/** Estimate total duration in seconds (reps exercises count as ~30s each) */
export function estimateDuration(program: Program): number {
  let total = 0
  for (const phase of program.phases) {
    for (let cycle = 1; cycle <= phase.cycles; cycle++) {
      for (let i = 0; i < phase.exercises.length; i++) {
        const ex = phase.exercises[i]
        total += ex.type === 'timed' ? ex.durationSeconds : 30 // ~30s per reps set
        const isLastExInLastCycle = i === phase.exercises.length - 1 && cycle === phase.cycles
        if (ex.restAfterSeconds > 0 && !isLastExInLastCycle) {
          total += ex.restAfterSeconds
        }
      }
      if (cycle < phase.cycles) {
        total += phase.restBetweenCyclesSeconds
      }
    }
  }
  return total
}
