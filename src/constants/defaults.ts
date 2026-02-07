import type { Phase } from '@/types/workout'
import { generateId } from '@/lib/id'

export function createDefaultExercise(name = 'Exercice', timed = true) {
  return {
    id: generateId(),
    name,
    type: timed ? 'timed' as const : 'reps' as const,
    durationSeconds: timed ? 30 : 0,
    reps: timed ? 0 : 10,
    restAfterSeconds: 15,
  }
}

export function createDefaultPhases(): Phase[] {
  return [
    {
      id: generateId(),
      type: 'warmup',
      name: '\u00c9chauffement',
      cycles: 1,
      restBetweenCyclesSeconds: 0,
      exercises: [
        { id: generateId(), name: "Cercles d'\u00e9paules", type: 'timed', durationSeconds: 30, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: 'Rotations de hanches', type: 'timed', durationSeconds: 30, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: 'Mont\u00e9es de genoux', type: 'timed', durationSeconds: 60, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: 'Squats lents', type: 'timed', durationSeconds: 60, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: 'Pompes mur', type: 'timed', durationSeconds: 60, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: 'Respiration profonde', type: 'timed', durationSeconds: 30, reps: 0, restAfterSeconds: 0 },
      ],
    },
    {
      id: generateId(),
      type: 'main',
      name: 'Bloc Principal',
      cycles: 3,
      restBetweenCyclesSeconds: 90,
      exercises: [
        { id: generateId(), name: 'Squats', type: 'reps', durationSeconds: 0, reps: 12, restAfterSeconds: 30 },
        { id: generateId(), name: 'Pompes', type: 'reps', durationSeconds: 0, reps: 10, restAfterSeconds: 30 },
        { id: generateId(), name: 'Rowing maison', type: 'reps', durationSeconds: 0, reps: 12, restAfterSeconds: 30 },
        { id: generateId(), name: 'Gainage planche', type: 'timed', durationSeconds: 30, reps: 0, restAfterSeconds: 30 },
      ],
    },
    {
      id: generateId(),
      type: 'core',
      name: 'Gainage / Posture',
      cycles: 1,
      restBetweenCyclesSeconds: 0,
      exercises: [
        { id: generateId(), name: 'Gainage lat\u00e9ral gauche', type: 'timed', durationSeconds: 20, reps: 0, restAfterSeconds: 10 },
        { id: generateId(), name: 'Gainage lat\u00e9ral droit', type: 'timed', durationSeconds: 20, reps: 0, restAfterSeconds: 10 },
        { id: generateId(), name: 'Superman', type: 'reps', durationSeconds: 0, reps: 10, restAfterSeconds: 0 },
      ],
    },
    {
      id: generateId(),
      type: 'cooldown',
      name: '\u00c9tirements / Retour au calme',
      cycles: 1,
      restBetweenCyclesSeconds: 0,
      exercises: [
        { id: generateId(), name: '\u00c9tirement poitrine', type: 'timed', durationSeconds: 60, reps: 0, restAfterSeconds: 0 },
        { id: generateId(), name: '\u00c9tirement dos', type: 'timed', durationSeconds: 60, reps: 0, restAfterSeconds: 0 },
      ],
    },
  ]
}
