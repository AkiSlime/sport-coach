import { useParams, useNavigate } from 'react-router-dom'
import { useProgramStore } from '@/store/useProgramStore'
import { FR } from '@/constants/fr'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createDefaultExercise } from '@/constants/defaults'
import { generateId } from '@/lib/id'
import { formatTime, estimateDuration } from '@/lib/workout-engine'
import { useState } from 'react'
import type { Exercise, PhaseType } from '@/types/workout'

// Suggested exercises per phase type (name + default config)
const EXERCISE_SUGGESTIONS: Record<PhaseType, { name: string; timed: boolean; duration: number; reps: number; rest: number }[]> = {
  warmup: [
    { name: "Cercles d'épaules", timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Rotations de hanches', timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Montées de genoux', timed: true, duration: 60, reps: 0, rest: 0 },
    { name: 'Squats lents', timed: true, duration: 60, reps: 0, rest: 0 },
    { name: 'Pompes mur', timed: true, duration: 60, reps: 0, rest: 0 },
    { name: 'Respiration profonde', timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Talons-fesses', timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Flexions latérales', timed: true, duration: 30, reps: 0, rest: 0 },
  ],
  main: [
    { name: 'Squats', timed: false, duration: 0, reps: 12, rest: 30 },
    { name: 'Pompes', timed: false, duration: 0, reps: 10, rest: 30 },
    { name: 'Rowing maison', timed: false, duration: 0, reps: 12, rest: 30 },
    { name: 'Gainage planche', timed: true, duration: 30, reps: 0, rest: 30 },
    { name: 'Fentes avant', timed: false, duration: 0, reps: 10, rest: 30 },
    { name: 'Dips sur chaise', timed: false, duration: 0, reps: 10, rest: 30 },
    { name: 'Burpees', timed: false, duration: 0, reps: 8, rest: 30 },
    { name: 'Mountain climbers', timed: true, duration: 30, reps: 0, rest: 30 },
  ],
  core: [
    { name: 'Gainage planche', timed: true, duration: 30, reps: 0, rest: 10 },
    { name: 'Gainage latéral gauche', timed: true, duration: 20, reps: 0, rest: 10 },
    { name: 'Gainage latéral droit', timed: true, duration: 20, reps: 0, rest: 10 },
    { name: 'Superman', timed: false, duration: 0, reps: 10, rest: 0 },
    { name: 'Crunchs', timed: false, duration: 0, reps: 15, rest: 10 },
    { name: 'Pont fessier', timed: false, duration: 0, reps: 12, rest: 10 },
    { name: 'Dead bug', timed: true, duration: 30, reps: 0, rest: 10 },
  ],
  cooldown: [
    { name: 'Étirement poitrine', timed: true, duration: 60, reps: 0, rest: 0 },
    { name: 'Étirement dos', timed: true, duration: 60, reps: 0, rest: 0 },
    { name: 'Étirement quadriceps', timed: true, duration: 45, reps: 0, rest: 0 },
    { name: 'Étirement ischio-jambiers', timed: true, duration: 45, reps: 0, rest: 0 },
    { name: 'Étirement mollets', timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Étirement épaules', timed: true, duration: 30, reps: 0, rest: 0 },
    { name: 'Respiration profonde', timed: true, duration: 60, reps: 0, rest: 0 },
  ],
}

const PHASE_TYPE_LABELS: Record<PhaseType, string> = {
  warmup: FR.warmup,
  main: FR.main,
  core: FR.core,
  cooldown: FR.cooldown,
}

const PHASE_TYPE_COLORS: Record<PhaseType, string> = {
  warmup: 'border-amber-500/40',
  main: 'border-emerald-500/40',
  core: 'border-blue-500/40',
  cooldown: 'border-purple-500/40',
}

const PHASE_ICONS: Record<PhaseType, string> = {
  warmup: 'bg-amber-500/15 text-amber-400',
  main: 'bg-emerald-500/15 text-emerald-400',
  core: 'bg-blue-500/15 text-blue-400',
  cooldown: 'bg-purple-500/15 text-purple-400',
}

export function EditorPage() {
  const { programId } = useParams<{ programId: string }>()
  const navigate = useNavigate()
  const program = useProgramStore((s) =>
    s.programs.find((p) => p.id === programId),
  )
  const updateProgram = useProgramStore((s) => s.updateProgram)
  const updatePhase = useProgramStore((s) => s.updatePhase)
  const removePhase = useProgramStore((s) => s.removePhase)
  const addExercise = useProgramStore((s) => s.addExercise)
  const updateExercise = useProgramStore((s) => s.updateExercise)
  const removeExercise = useProgramStore((s) => s.removeExercise)
  const addPhase = useProgramStore((s) => s.addPhase)
  const moveExercise = useProgramStore((s) => s.moveExercise)

  const [editingExercise, setEditingExercise] = useState<{
    phaseId: string
    exercise: Exercise
  } | null>(null)
  const [collapsedPhases, setCollapsedPhases] = useState<Set<string>>(new Set())
  const [deletePhaseId, setDeletePhaseId] = useState<string | null>(null)
  const [deleteExercise, setDeleteExercise] = useState<{
    phaseId: string
    exerciseId: string
    exerciseName: string
  } | null>(null)
  const [showAddPhase, setShowAddPhase] = useState(false)
  const [addExerciseForPhase, setAddExerciseForPhase] = useState<{
    phaseId: string
    phaseType: PhaseType
  } | null>(null)

  if (!program || !programId) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-4 bg-slate-950">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
          <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-slate-400">Programme introuvable</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium transition-all border border-slate-700/50"
        >
          Retour
        </button>
      </div>
    )
  }

  const toggleCollapse = (phaseId: string) => {
    setCollapsedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) next.delete(phaseId)
      else next.add(phaseId)
      return next
    })
  }

  const handleAddPhase = (type: PhaseType) => {
    addPhase(programId, {
      id: generateId(),
      type,
      name: PHASE_TYPE_LABELS[type],
      exercises: [],
      cycles: type === 'main' ? 3 : 1,
      restBetweenCyclesSeconds: type === 'main' ? 60 : 0,
    })
    setShowAddPhase(false)
  }

  const handleSaveExercise = (updates: Partial<Exercise>) => {
    if (!editingExercise) return
    updateExercise(
      programId,
      editingExercise.phaseId,
      editingExercise.exercise.id,
      updates,
    )
    setEditingExercise(null)
  }

  const totalExercises = program.phases.reduce(
    (acc, ph) => acc + ph.exercises.length,
    0,
  )

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        <button
          onClick={() => navigate('/')}
          aria-label="Retour à l'accueil"
          className="p-2.5 -ml-2 hover:bg-slate-800/60 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <input
          type="text"
          value={program.name}
          onChange={(e) => updateProgram(programId, { name: e.target.value })}
          className="flex-1 bg-transparent text-lg font-bold outline-none text-slate-100 placeholder-slate-600"
          placeholder={FR.programName}
        />
      </header>

      {/* Phases */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {program.phases.map((phase) => {
          const isCollapsed = collapsedPhases.has(phase.id)
          return (
            <div
              key={phase.id}
              className={`bg-slate-900/60 rounded-2xl border-l-4 ${PHASE_TYPE_COLORS[phase.type]} overflow-hidden border border-slate-800/30 border-l-4`}
            >
              {/* Phase header */}
              <button
                className="flex items-center justify-between p-4 w-full text-left"
                onClick={() => toggleCollapse(phase.id)}
                aria-expanded={!isCollapsed}
                aria-label={`${phase.name} — ${phase.exercises.length} exercices`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Phase type icon badge */}
                  <div className={`w-9 h-9 rounded-lg ${PHASE_ICONS[phase.type]} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-sm font-bold">{phase.exercises.length}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-100 block text-sm">{phase.name}</span>
                    {phase.type === 'main' && (
                      <span className="text-xs text-emerald-400/70">
                        {phase.cycles} {FR.cycles.toLowerCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletePhaseId(phase.id)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeletePhaseId(phase.id)
                      }
                    }}
                    aria-label={`Supprimer la phase ${phase.name}`}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Collapsible content */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[2000px] opacity-100'
                }`}
              >
                <div className="px-4 pb-4 space-y-2">
                  {/* Cycles + rest for main block */}
                  {phase.type === 'main' && (
                    <div className="flex gap-3 mb-3 bg-slate-800/30 rounded-xl p-3">
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-3.5 h-3.5 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                        {FR.cycles}
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={phase.cycles}
                          onChange={(e) =>
                            updatePhase(programId, phase.id, {
                              cycles: Math.max(1, parseInt(e.target.value) || 1),
                            })
                          }
                          className="w-12 bg-slate-700/50 rounded-lg px-2 py-1 text-center text-slate-100 text-sm border border-slate-600/30"
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-400">
                        <svg className="w-3.5 h-3.5 text-amber-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Repos
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={phase.restBetweenCyclesSeconds}
                          onChange={(e) =>
                            updatePhase(programId, phase.id, {
                              restBetweenCyclesSeconds: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-14 bg-slate-700/50 rounded-lg px-2 py-1 text-center text-slate-100 text-sm border border-slate-600/30"
                        />
                        <span>{FR.seconds}</span>
                      </label>
                    </div>
                  )}

                  {/* Exercises */}
                  {phase.exercises.map((exercise, exIndex) => (
                    <div
                      key={exercise.id}
                      className="flex items-center gap-2 bg-slate-800/30 rounded-xl p-3 group border border-slate-700/20 hover:border-slate-700/40 transition-colors"
                    >
                      {/* Move buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          disabled={exIndex === 0}
                          onClick={() => moveExercise(programId, phase.id, exIndex, exIndex - 1)}
                          aria-label={`Monter ${exercise.name}`}
                          className="p-1.5 text-slate-600 hover:text-slate-300 disabled:opacity-20 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-700/40 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          disabled={exIndex === phase.exercises.length - 1}
                          onClick={() => moveExercise(programId, phase.id, exIndex, exIndex + 1)}
                          aria-label={`Descendre ${exercise.name}`}
                          className="p-1.5 text-slate-600 hover:text-slate-300 disabled:opacity-20 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg hover:bg-slate-700/40 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Exercise info — clickable */}
                      <div
                        className="flex-1 cursor-pointer flex items-center gap-2 min-h-[44px]"
                        onClick={() => setEditingExercise({ phaseId: phase.id, exercise })}
                        role="button"
                        tabIndex={0}
                        aria-label={`Éditer ${exercise.name}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setEditingExercise({ phaseId: phase.id, exercise })
                          }
                        }}
                      >
                        <div className="flex-1">
                          <span className="text-sm font-medium text-slate-200">
                            {exercise.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              {exercise.type === 'timed' ? (
                                <>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                  </svg>
                                  {formatTime(exercise.durationSeconds)}
                                </>
                              ) : (
                                <>
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  {exercise.reps} {FR.reps}
                                </>
                              )}
                            </span>
                            {exercise.restAfterSeconds > 0 && (
                              <span className="text-xs text-amber-500/50">
                                +{exercise.restAfterSeconds}{FR.seconds}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Edit chevron */}
                        <svg className="w-4 h-4 text-slate-700 group-hover:text-slate-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* Delete exercise */}
                      <button
                        onClick={() =>
                          setDeleteExercise({
                            phaseId: phase.id,
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                          })
                        }
                        aria-label={`Supprimer ${exercise.name}`}
                        className="p-2 text-slate-700 hover:text-red-400 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {/* Add exercise */}
                  <button
                    onClick={() => setAddExerciseForPhase({ phaseId: phase.id, phaseType: phase.type })}
                    className="w-full py-3 text-sm text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    {FR.addExercise}
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {/* Add phase */}
        <button
          onClick={() => setShowAddPhase(true)}
          className="w-full py-4 text-sm text-slate-500 hover:text-emerald-400 border-2 border-dashed border-slate-800 hover:border-emerald-500/30 rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-emerald-500/5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {FR.addPhase}
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-sm">
        {totalExercises > 0 && (
          <p className="text-xs text-slate-600 text-center mb-2 font-mono tabular-nums">
            {totalExercises} exercices &middot; ~{formatTime(estimateDuration(program))}
          </p>
        )}
        <Button
          className="w-full"
          size="lg"
          onClick={() => navigate(`/program/${programId}/play`)}
          disabled={program.phases.every((p) => p.exercises.length === 0)}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {FR.startWorkout}
        </Button>
      </div>

      {/* Exercise edit modal */}
      {editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise.exercise}
          onSave={handleSaveExercise}
          onClose={() => setEditingExercise(null)}
        />
      )}

      {/* Add phase modal */}
      <Modal open={showAddPhase} onClose={() => setShowAddPhase(false)} title={FR.addPhase}>
        <div className="space-y-2">
          {(Object.keys(PHASE_TYPE_LABELS) as PhaseType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleAddPhase(type)}
              className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-center gap-3 border border-slate-700/30 hover:border-slate-600/50 bg-slate-800/50 hover:bg-slate-800`}
            >
              <div className={`w-8 h-8 rounded-lg ${PHASE_ICONS[type]} flex items-center justify-center flex-shrink-0`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <span className="font-medium text-slate-200 text-sm">{PHASE_TYPE_LABELS[type]}</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Exercise picker modal */}
      <Modal
        open={addExerciseForPhase !== null}
        onClose={() => setAddExerciseForPhase(null)}
        title="Choisir un exercice"
      >
        {addExerciseForPhase && (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto -mx-1 px-1">
            {EXERCISE_SUGGESTIONS[addExerciseForPhase.phaseType]
              .filter((s) => {
                // Hide exercises already in this phase
                const phase = program.phases.find((p) => p.id === addExerciseForPhase.phaseId)
                return !phase?.exercises.some(
                  (ex) => ex.name.toLowerCase() === s.name.toLowerCase(),
                )
              })
              .map((suggestion) => (
              <button
                key={suggestion.name}
                onClick={() => {
                  addExercise(programId, addExerciseForPhase.phaseId, {
                    id: generateId(),
                    name: suggestion.name,
                    type: suggestion.timed ? 'timed' : 'reps',
                    durationSeconds: suggestion.duration,
                    reps: suggestion.reps,
                    restAfterSeconds: suggestion.rest,
                  })
                  setAddExerciseForPhase(null)
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between border border-slate-700/30 hover:border-emerald-500/30 bg-slate-800/50 hover:bg-emerald-500/5 group"
              >
                <span className="font-medium text-slate-200 text-sm">{suggestion.name}</span>
                <span className="text-xs text-slate-600 group-hover:text-slate-400">
                  {suggestion.timed
                    ? formatTime(suggestion.duration)
                    : `${suggestion.reps} ${FR.reps}`}
                </span>
              </button>
            ))}
            {/* Custom exercise option */}
            <div className="border-t border-slate-800/50 pt-2 mt-2">
              <button
                onClick={() => {
                  const isTimed = addExerciseForPhase.phaseType !== 'main'
                  addExercise(
                    programId,
                    addExerciseForPhase.phaseId,
                    createDefaultExercise('Nouvel exercice', isTimed),
                  )
                  setAddExerciseForPhase(null)
                }}
                className="w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-dashed border-slate-700/30 hover:border-emerald-500/30 bg-slate-800/30 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-400"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                </svg>
                <span className="text-sm font-medium">Exercice personnalisé</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete phase confirm */}
      <ConfirmDialog
        open={deletePhaseId !== null}
        title="Supprimer la phase ?"
        message="Tous les exercices de cette phase seront supprimés."
        danger
        onConfirm={() => {
          if (deletePhaseId) removePhase(programId, deletePhaseId)
          setDeletePhaseId(null)
        }}
        onCancel={() => setDeletePhaseId(null)}
      />

      {/* Delete exercise confirm */}
      <ConfirmDialog
        open={deleteExercise !== null}
        title="Supprimer l'exercice ?"
        message={`"${deleteExercise?.exerciseName ?? ''}" sera supprimé.`}
        danger
        confirmLabel={FR.delete}
        onConfirm={() => {
          if (deleteExercise) {
            removeExercise(programId, deleteExercise.phaseId, deleteExercise.exerciseId)
          }
          setDeleteExercise(null)
        }}
        onCancel={() => setDeleteExercise(null)}
      />
    </div>
  )
}

// ─── Exercise Edit Modal ────────────────────────────────────

function ExerciseEditModal({
  exercise,
  onSave,
  onClose,
}: {
  exercise: Exercise
  onSave: (updates: Partial<Exercise>) => void
  onClose: () => void
}) {
  const [name, setName] = useState(exercise.name)
  const [type, setType] = useState(exercise.type)
  const [duration, setDuration] = useState(exercise.durationSeconds)
  const [reps, setReps] = useState(exercise.reps)
  const [rest, setRest] = useState(exercise.restAfterSeconds)

  const handleSave = () => {
    onSave({ name, type, durationSeconds: duration, reps, restAfterSeconds: rest })
  }

  return (
    <Modal open onClose={onClose} title={FR.edit}>
      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
            {FR.exerciseName}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-3 text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all"
            autoFocus
          />
        </div>

        {/* Type toggle */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
            Type
          </label>
          <div className="flex bg-slate-800/40 rounded-xl p-1 border border-slate-700/30" role="tablist" aria-label="Type d'exercice">
            <button
              role="tab"
              aria-selected={type === 'timed'}
              onClick={() => setType('timed')}
              className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-medium ${
                type === 'timed'
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {FR.timed}
            </button>
            <button
              role="tab"
              aria-selected={type === 'reps'}
              onClick={() => setType('reps')}
              className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-medium ${
                type === 'reps'
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-900/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {FR.repsBased}
            </button>
          </div>
        </div>

        {/* Duration or Reps */}
        {type === 'timed' ? (
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              {FR.duration}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDuration(Math.max(5, duration - 5))}
                aria-label="Diminuer la durée"
                className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-800/60 border border-slate-700/30 rounded-xl px-3 py-2.5 text-center text-3xl font-mono font-bold text-slate-100 outline-none tabular-nums"
                />
                <p className="text-xs text-slate-600 mt-1">{formatTime(duration)}</p>
              </div>
              <button
                onClick={() => setDuration(duration + 5)}
                aria-label="Augmenter la durée"
                className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
              >
                +
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
              {FR.repetitions}
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReps(Math.max(1, reps - 1))}
                aria-label="Diminuer les répétitions"
                className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                value={reps}
                onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 bg-slate-800/60 border border-slate-700/30 rounded-xl px-3 py-2.5 text-center text-3xl font-mono font-bold text-slate-100 outline-none"
              />
              <button
                onClick={() => setReps(reps + 1)}
                aria-label="Augmenter les répétitions"
                className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* Rest after */}
        <div>
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1.5">
            {FR.restAfter}
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRest(Math.max(0, rest - 5))}
              aria-label="Diminuer le repos"
              className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
            >
              -
            </button>
            <div className="flex-1 text-center">
              <input
                type="number"
                min={0}
                step={5}
                value={rest}
                onChange={(e) => setRest(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-slate-800/60 border border-slate-700/30 rounded-xl px-3 py-2.5 text-center text-3xl font-mono font-bold text-slate-100 outline-none tabular-nums"
              />
              <p className="text-xs text-slate-600 mt-1">{rest}{FR.seconds}</p>
            </div>
            <button
              onClick={() => setRest(rest + 5)}
              aria-label="Augmenter le repos"
              className="w-12 h-12 bg-slate-800/60 border border-slate-700/30 rounded-xl text-xl font-bold hover:bg-slate-700/60 active:scale-95 transition-all text-slate-400"
            >
              +
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {FR.cancel}
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {FR.save}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
