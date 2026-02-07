import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'
import { useProgramStore } from '@/store/useProgramStore'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useTimer } from '@/hooks/useTimer'
import { useWakeLock } from '@/hooks/useWakeLock'
import { useAudioSignals } from '@/hooks/useAudioSignals'
import { useVoiceCoach } from '@/hooks/useVoiceCoach'
import { flattenProgram, formatTime, estimateDuration } from '@/lib/workout-engine'
import { unlockAudio } from '@/lib/audio'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ExerciseGuidePanel } from '@/components/player/ExerciseGuidePanel'
import { VoiceCoachButton } from '@/components/player/VoiceCoachButton'
import { VoiceCoachOverlay } from '@/components/player/VoiceCoachOverlay'
import { FR } from '@/constants/fr'
import { useState } from 'react'
import { clsx } from 'clsx'

export function PlayerPage() {
  const { programId } = useParams<{ programId: string }>()
  const navigate = useNavigate()
  const program = useProgramStore((s) =>
    s.programs.find((p) => p.id === programId),
  )

  const status = usePlayerStore((s) => s.status)
  const steps = usePlayerStore((s) => s.steps)
  const currentStepIndex = usePlayerStore((s) => s.currentStepIndex)
  const secondsRemaining = usePlayerStore((s) => s.secondsRemaining)
  const totalElapsedSeconds = usePlayerStore((s) => s.totalElapsedSeconds)
  const startWorkout = usePlayerStore((s) => s.startWorkout)
  const pause = usePlayerStore((s) => s.pause)
  const resume = usePlayerStore((s) => s.resume)
  const skipStep = usePlayerStore((s) => s.skipStep)
  const markRepsDone = usePlayerStore((s) => s.markRepsDone)
  const restartStep = usePlayerStore((s) => s.restartStep)
  const stopWorkout = usePlayerStore((s) => s.stopWorkout)

  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Activate timer, wake lock, audio signals, and voice coach
  useTimer()
  useWakeLock(status === 'playing')
  useAudioSignals()
  const voiceCoach = useVoiceCoach(program)

  const launchWorkout = useCallback(() => {
    if (!program) return
    unlockAudio()
    const flatSteps = flattenProgram(program)

    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      if (count > 0) {
        setCountdown(count)
      } else {
        setCountdown(null)
        clearInterval(interval)
        startWorkout(flatSteps)
      }
    }, 1000)
  }, [program, startWorkout])

  // Start on mount
  useEffect(() => {
    launchWorkout()
    return () => {
      stopWorkout()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId])

  const currentStep = steps[currentStepIndex]
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0

  if (!program) {
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

  // ─── Countdown overlay (3-2-1) ─────────────────────────────
  if (countdown !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] bg-slate-950">
        <p className="text-sm text-slate-600 uppercase tracking-[0.2em] mb-8 font-medium">
          {program.name}
        </p>
        <div className="relative w-44 h-44">
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full animate-glow-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              key={countdown}
              className="text-8xl font-mono font-bold text-emerald-400 animate-count-pop"
            >
              {countdown}
            </span>
          </div>
        </div>
        <p className="text-lg text-slate-400 mt-10 font-medium">{FR.ready}</p>
        <p className="text-xs text-slate-700 mt-2 font-mono tabular-nums">
          ~{formatTime(estimateDuration(program))}
        </p>
      </div>
    )
  }

  // ─── Finished screen ───────────────────────────────────────
  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] px-6 text-center bg-slate-950">
        {/* Success badge with glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-emerald-500/10 animate-glow-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center border border-emerald-500/20">
            <svg className="w-14 h-14 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-100 mb-1">{FR.finished}</h1>
        <p className="text-4xl font-mono font-bold text-emerald-400 mb-8 tabular-nums">
          {formatTime(totalElapsedSeconds)}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-10">
          <div className="bg-slate-900/60 rounded-2xl p-4 text-center border border-slate-800/30">
            <p className="text-3xl font-bold text-emerald-400 font-mono">{steps.filter(s => s.type === 'exercise').length}</p>
            <p className="text-xs text-slate-500 mt-1">Exercices</p>
          </div>
          <div className="bg-slate-900/60 rounded-2xl p-4 text-center border border-slate-800/30">
            <p className="text-3xl font-bold text-amber-400 font-mono">{program.phases.length}</p>
            <p className="text-xs text-slate-500 mt-1">Phases</p>
          </div>
        </div>

        <Button size="lg" onClick={() => navigate('/')} className="w-full max-w-xs">
          {FR.back}
        </Button>
      </div>
    )
  }

  if (!currentStep) return null

  const isRest = currentStep.type === 'rest' || currentStep.type === 'cycle-rest'
  const isReps = currentStep.exerciseType === 'reps' && currentStep.type === 'exercise'
  const isTimed = currentStep.durationSeconds !== null && !isReps

  // Timer ring
  const totalDuration = currentStep.durationSeconds ?? 1
  const fraction = isTimed ? secondsRemaining / totalDuration : 0
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference * (1 - fraction)

  // Find next exercise
  const nextExercise = (() => {
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      if (steps[i].type === 'exercise') return steps[i]
    }
    return null
  })()

  const ringColor = isRest ? '#f59e0b' : '#10b981'
  const ringGlow = isRest ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950">
      {/* Progress bar */}
      <div className="h-1 bg-slate-800/50" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du workout">
        <div
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Phase / Cycle indicator */}
      <div className="px-4 py-2.5 text-center">
        <span className="text-[10px] text-slate-600 uppercase tracking-[0.15em] font-medium">
          {currentStep.phaseName}
          {currentStep.totalCycles > 1 && (
            <> &middot; {FR.cycle} {currentStep.currentCycle}/{currentStep.totalCycles}</>
          )}
        </span>
      </div>

      {/* Main display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 overflow-y-auto">
        {/* Exercise name */}
        <h2
          className={clsx(
            'text-xl font-bold mb-6 text-center transition-colors duration-300',
            isRest ? 'text-amber-400' : 'text-slate-100',
          )}
        >
          {currentStep.label}
        </h2>

        {/* Timer circle */}
        {isTimed ? (
          <div className="relative w-56 h-56 mb-4">
            {/* Glow behind the circle */}
            <div
              className="absolute inset-[-8px] rounded-full blur-xl transition-colors duration-300"
              style={{ background: ringGlow }}
            />
            <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 200 200">
              <circle
                cx="100" cy="100" r="90"
                fill="none" stroke="#1e293b" strokeWidth="4"
              />
              <circle
                cx="100" cy="100" r="90"
                fill="none"
                stroke={ringColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
                style={{ filter: `drop-shadow(0 0 6px ${ringColor}40)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={clsx(
                  'text-6xl font-mono font-bold tabular-nums transition-colors',
                  secondsRemaining <= 3 && secondsRemaining > 0 ? 'text-red-400' : 'text-slate-100',
                )}
              >
                {formatTime(secondsRemaining)}
              </span>
            </div>
          </div>
        ) : isReps ? (
          <div className="mb-4 text-center">
            <div className="relative w-56 h-56">
              <div
                className="absolute inset-[-8px] rounded-full blur-xl"
                style={{ background: 'rgba(16, 185, 129, 0.1)' }}
              />
              <div className="w-full h-full rounded-full border-2 border-emerald-500/20 flex flex-col items-center justify-center relative">
                <span className="text-6xl font-mono font-bold text-slate-100">
                  {currentStep.reps}
                </span>
                <span className="text-sm text-slate-500 mt-1">{FR.repsBased}</span>
              </div>
            </div>
            <Button
              size="lg"
              className="mt-5 px-12"
              onClick={markRepsDone}
              aria-label="Marquer comme terminé"
            >
              {FR.done}
            </Button>
          </div>
        ) : null}

        {/* How-to guide (only for exercises, not rest) */}
        {currentStep.type === 'exercise' && (
          <ExerciseGuidePanel
            exerciseName={currentStep.label}
            open={showGuide}
            onToggle={() => setShowGuide((v) => !v)}
          />
        )}

        {/* Next exercise preview */}
        {nextExercise && (
          <div className="mt-3 px-4 py-2.5 bg-slate-900/40 rounded-xl text-center border border-slate-800/30">
            <span className="text-[10px] text-slate-600 uppercase tracking-wider">Prochain</span>
            <p className="text-sm text-slate-300 font-medium mt-0.5">
              {nextExercise.label}
              {nextExercise.durationSeconds !== null && (
                <span className="text-slate-600 font-mono text-xs ml-1.5">{formatTime(nextExercise.durationSeconds)}</span>
              )}
              {nextExercise.reps !== null && (
                <span className="text-slate-600 text-xs ml-1.5">{nextExercise.reps} {FR.reps}</span>
              )}
            </p>
          </div>
        )}

        {/* Elapsed time */}
        <p className="text-xs text-slate-700 mt-3 tabular-nums font-mono">
          {formatTime(totalElapsedSeconds)}
        </p>
      </div>

      {/* Voice Coach Overlay */}
      <VoiceCoachOverlay
        status={voiceCoach.status}
        transcript={voiceCoach.transcript}
        lastResponse={voiceCoach.lastResponse}
        error={voiceCoach.error}
      />

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-6 py-5">
        {/* Stop */}
        <button
          onClick={() => setShowStopConfirm(true)}
          aria-label={FR.stop}
          className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center hover:bg-slate-700/60 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>

        {/* Restart */}
        <button
          onClick={restartStep}
          aria-label="Recommencer"
          className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center hover:bg-slate-700/60 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.05 9.1A7.5 7.5 0 0119.5 12M16.95 14.9A7.5 7.5 0 014.5 12" />
          </svg>
        </button>

        {/* Play/Pause — Main FAB */}
        <button
          onClick={() => (status === 'playing' ? pause() : resume())}
          aria-label={status === 'playing' ? FR.pause : FR.resume}
          className="w-20 h-20 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-emerald-900/40"
        >
          {status === 'playing' ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Skip */}
        <button
          onClick={skipStep}
          aria-label={FR.skip}
          className="w-12 h-12 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center hover:bg-slate-700/60 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 4l10 8-10 8V4zm12 0h2v16h-2V4z" />
          </svg>
        </button>

        {/* Voice Coach */}
        {voiceCoach.isAvailable && (
          <VoiceCoachButton
            status={voiceCoach.status}
            isAvailable={voiceCoach.isAvailable}
            onPress={voiceCoach.startListening}
            onRelease={voiceCoach.stopListening}
          />
        )}
      </div>

      <ConfirmDialog
        open={showStopConfirm}
        title={FR.confirmStop}
        message={FR.confirmStopMessage}
        danger
        confirmLabel={FR.stop}
        onConfirm={() => {
          stopWorkout()
          navigate('/')
        }}
        onCancel={() => setShowStopConfirm(false)}
      />
    </div>
  )
}
