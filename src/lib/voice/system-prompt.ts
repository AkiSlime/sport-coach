import type { WorkoutContext } from './types'
import type { Program } from '@/types/workout'
import { formatTime, estimateDuration } from '@/lib/workout-engine'

const PHASE_TYPE_LABELS: Record<string, string> = {
  warmup: 'Échauffement',
  main: 'Bloc Principal',
  core: 'Gainage / Posture',
  cooldown: 'Étirements / Retour au calme',
}

function formatProgram(program: Program, currentExerciseName: string | null): string {
  const lines: string[] = []
  const duration = estimateDuration(program)
  lines.push(`Programme : ${program.name} (durée estimée : ~${formatTime(duration)})`)
  lines.push(``)
  lines.push(`Structure complète du programme :`)

  let exerciseNum = 0

  for (let pi = 0; pi < program.phases.length; pi++) {
    const phase = program.phases[pi]
    const phaseLabel = PHASE_TYPE_LABELS[phase.type] ?? phase.name
    let phaseHeader = `\nPhase ${pi + 1} — ${phaseLabel}`
    if (phase.cycles > 1) {
      phaseHeader += ` (${phase.cycles} cycles`
      if (phase.restBetweenCyclesSeconds > 0) {
        phaseHeader += `, repos entre cycles : ${phase.restBetweenCyclesSeconds}s`
      }
      phaseHeader += `)`
    }
    lines.push(phaseHeader)

    for (const exercise of phase.exercises) {
      exerciseNum++
      const isCurrent = currentExerciseName !== null && exercise.name === currentExerciseName
      const marker = isCurrent ? '  → ' : '  '
      let desc = `${marker}${exerciseNum}. ${exercise.name} — `

      if (exercise.type === 'timed') {
        desc += `${exercise.durationSeconds}s`
      } else {
        desc += `${exercise.reps} reps`
      }

      if (exercise.restAfterSeconds > 0) {
        desc += `, repos ${exercise.restAfterSeconds}s`
      }

      if (isCurrent) {
        desc += '  ← EN COURS'
      }

      lines.push(desc)
    }
  }

  return lines.join('\n')
}

export function buildSystemPrompt(ctx: WorkoutContext): string {
  const lines = [
    `Tu es un coach sportif personnel bienveillant et motivant. L'utilisateur est en plein entraînement et te parle via commande vocale.`,
    ``,
    formatProgram(ctx.program, ctx.currentStep?.label ?? null),
    ``,
  ]

  if (ctx.currentStep) {
    const step = ctx.currentStep
    lines.push(`Exercice en cours : ${step.label} (${step.phaseName})`)
    if (step.totalCycles > 1) {
      lines.push(`Cycle : ${step.currentCycle}/${step.totalCycles}`)
    }
    if (step.durationSeconds !== null) {
      lines.push(`Type : durée (${step.durationSeconds}s)`)
    }
    if (step.reps !== null) {
      lines.push(`Type : ${step.reps} répétitions`)
    }
    lines.push(`Progression : étape ${ctx.currentStepIndex + 1}/${ctx.totalSteps}`)
  }

  lines.push(`Temps total écoulé : ${formatTime(ctx.totalElapsedSeconds)}`)
  lines.push(`État : ${ctx.isPlaying ? 'en cours' : 'en pause'}`)
  lines.push(``)
  lines.push(`Consignes :`)
  lines.push(`- Réponds en français, sois bref et motivant (2-3 phrases max)`)
  lines.push(`- Tu peux donner des conseils sur la forme, la respiration, la motivation`)
  lines.push(`- Adapte tes encouragements à l'exercice en cours`)
  lines.push(`- Tu connais tout le programme, tu peux répondre aux questions sur les exercices à venir, le temps restant, etc.`)
  lines.push(`- Si l'utilisateur demande de modifier le workout, explique que tu ne peux pas le modifier directement mais donne des conseils`)
  lines.push(`- Utilise un ton dynamique et positif, comme un vrai coach en salle`)

  return lines.join('\n')
}
