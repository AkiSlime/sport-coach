import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Program, Phase, Exercise } from '@/types/workout'
import { generateId } from '@/lib/id'

interface ProgramStore {
  programs: Program[]
  addProgram: (name?: string) => string
  updateProgram: (id: string, updates: Partial<Pick<Program, 'name'>>) => void
  deleteProgram: (id: string) => void
  duplicateProgram: (id: string) => string | null
  addPhase: (programId: string, phase: Phase) => void
  updatePhase: (programId: string, phaseId: string, updates: Partial<Phase>) => void
  removePhase: (programId: string, phaseId: string) => void
  movePhase: (programId: string, fromIndex: number, toIndex: number) => void
  addExercise: (programId: string, phaseId: string, exercise: Exercise) => void
  updateExercise: (programId: string, phaseId: string, exerciseId: string, updates: Partial<Exercise>) => void
  removeExercise: (programId: string, phaseId: string, exerciseId: string) => void
  moveExercise: (programId: string, phaseId: string, fromIndex: number, toIndex: number) => void
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    immer((set) => ({
      programs: [],

      addProgram: (name = 'Mon programme') => {
        const id = generateId()
        const now = new Date().toISOString()
        set((state) => {
          state.programs.push({
            id,
            name,
            phases: [],
            createdAt: now,
            updatedAt: now,
          })
        })
        return id
      },

      updateProgram: (id, updates) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === id)
          if (program) {
            Object.assign(program, updates, { updatedAt: new Date().toISOString() })
          }
        })
      },

      deleteProgram: (id) => {
        set((state) => {
          state.programs = state.programs.filter((p) => p.id !== id)
        })
      },

      duplicateProgram: (id) => {
        let newId: string | null = null
        set((state) => {
          const program = state.programs.find((p) => p.id === id)
          if (program) {
            newId = generateId()
            const now = new Date().toISOString()
            const cloned = JSON.parse(JSON.stringify(program)) as Program
            cloned.id = newId
            cloned.name = `${program.name} (copie)`
            cloned.createdAt = now
            cloned.updatedAt = now
            // Regenerate all IDs
            for (const phase of cloned.phases) {
              phase.id = generateId()
              for (const ex of phase.exercises) {
                ex.id = generateId()
              }
            }
            state.programs.push(cloned)
          }
        })
        return newId
      },

      addPhase: (programId, phase) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          if (program) {
            program.phases.push(phase)
            program.updatedAt = new Date().toISOString()
          }
        })
      },

      updatePhase: (programId, phaseId, updates) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          const phase = program?.phases.find((ph) => ph.id === phaseId)
          if (phase) {
            Object.assign(phase, updates)
            program!.updatedAt = new Date().toISOString()
          }
        })
      },

      removePhase: (programId, phaseId) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          if (program) {
            program.phases = program.phases.filter((ph) => ph.id !== phaseId)
            program.updatedAt = new Date().toISOString()
          }
        })
      },

      movePhase: (programId, fromIndex, toIndex) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          if (program) {
            const [moved] = program.phases.splice(fromIndex, 1)
            program.phases.splice(toIndex, 0, moved)
            program.updatedAt = new Date().toISOString()
          }
        })
      },

      addExercise: (programId, phaseId, exercise) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          const phase = program?.phases.find((ph) => ph.id === phaseId)
          if (phase) {
            phase.exercises.push(exercise)
            program!.updatedAt = new Date().toISOString()
          }
        })
      },

      updateExercise: (programId, phaseId, exerciseId, updates) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          const phase = program?.phases.find((ph) => ph.id === phaseId)
          const exercise = phase?.exercises.find((ex) => ex.id === exerciseId)
          if (exercise) {
            Object.assign(exercise, updates)
            program!.updatedAt = new Date().toISOString()
          }
        })
      },

      removeExercise: (programId, phaseId, exerciseId) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          const phase = program?.phases.find((ph) => ph.id === phaseId)
          if (phase) {
            phase.exercises = phase.exercises.filter((ex) => ex.id !== exerciseId)
            program!.updatedAt = new Date().toISOString()
          }
        })
      },

      moveExercise: (programId, phaseId, fromIndex, toIndex) => {
        set((state) => {
          const program = state.programs.find((p) => p.id === programId)
          const phase = program?.phases.find((ph) => ph.id === phaseId)
          if (phase) {
            const [moved] = phase.exercises.splice(fromIndex, 1)
            phase.exercises.splice(toIndex, 0, moved)
            program!.updatedAt = new Date().toISOString()
          }
        })
      },
    })),
    {
      name: 'custom-coach-programs',
    },
  ),
)
