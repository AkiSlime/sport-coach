import { useNavigate } from 'react-router-dom'
import { useProgramStore } from '@/store/useProgramStore'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FR } from '@/constants/fr'
import { formatTime, estimateDuration } from '@/lib/workout-engine'
import { useState } from 'react'

const PHASE_DOTS: Record<string, string> = {
  warmup: 'bg-amber-400',
  main: 'bg-emerald-400',
  core: 'bg-blue-400',
  cooldown: 'bg-purple-400',
}

export function HomePage() {
  const navigate = useNavigate()
  const programs = useProgramStore((s) => s.programs)
  const addProgram = useProgramStore((s) => s.addProgram)
  const deleteProgram = useProgramStore((s) => s.deleteProgram)
  const duplicateProgram = useProgramStore((s) => s.duplicateProgram)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCreate = () => {
    const id = addProgram()
    navigate(`/program/${id}`)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950">
      {/* Header */}
      <header className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">{FR.appName}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {programs.length} programme{programs.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Settings button */}
            <button
              onClick={() => navigate('/settings')}
              className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center hover:bg-slate-700/60 active:scale-95 transition-all"
              aria-label="Paramètres"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {/* Small add button in header */}
            {programs.length > 0 && (
              <button
                onClick={handleCreate}
                className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center hover:bg-emerald-500 active:scale-95 transition-all shadow-lg shadow-emerald-900/30"
                aria-label="Créer un programme"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {programs.length === 0 ? (
          <div>
            <EmptyState title={FR.noPrograms} subtitle={FR.noProgramsHint} />
            <div className="px-4 mt-2">
              <Button className="w-full" size="lg" onClick={handleCreate}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {FR.createProgram}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              const totalExercises = program.phases.reduce(
                (acc, ph) => acc + ph.exercises.length,
                0,
              )
              const duration = totalExercises > 0 ? estimateDuration(program) : 0

              return (
                <div
                  key={program.id}
                  className="card-glow bg-slate-900/80 rounded-2xl p-4 border border-slate-800/50 transition-all"
                >
                  {/* Clickable zone */}
                  <div
                    className="cursor-pointer"
                    onClick={() => navigate(`/program/${program.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-100 line-clamp-1 text-base">
                          {program.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Phase color dots */}
                          <div className="flex gap-1">
                            {program.phases.map((ph) => (
                              <span
                                key={ph.id}
                                className={`w-2 h-2 rounded-full ${PHASE_DOTS[ph.type] ?? 'bg-slate-500'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">
                            {totalExercises} exo
                          </span>
                          {duration > 0 && (
                            <span className="text-xs text-slate-600 font-mono tabular-nums">
                              ~{formatTime(duration)}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Quick play button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/program/${program.id}/play`)
                        }}
                        disabled={totalExercises === 0}
                        className="w-12 h-12 rounded-full bg-emerald-600/15 flex items-center justify-center hover:bg-emerald-600/25 active:scale-95 transition-all disabled:opacity-30 flex-shrink-0"
                        aria-label={`Démarrer ${program.name}`}
                      >
                        <svg className="w-5 h-5 text-emerald-400 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Actions row */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-800/50">
                    <button
                      onClick={() => navigate(`/program/${program.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                      </svg>
                      {FR.edit}
                    </button>
                    <button
                      onClick={() => duplicateProgram(program.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5" />
                      </svg>
                      {FR.duplicate}
                    </button>
                    <button
                      onClick={() => setDeleteId(program.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all ml-auto"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {FR.delete}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        title={FR.delete}
        message="Ce programme sera supprimé définitivement."
        danger
        onConfirm={() => {
          if (deleteId) deleteProgram(deleteId)
          setDeleteId(null)
        }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}
