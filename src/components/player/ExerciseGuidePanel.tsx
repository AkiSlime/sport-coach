import { useState, useEffect, useCallback, useRef } from 'react'
import { getExerciseGuide, getDefaultGuide } from '@/constants/exercise-guides'
import { speak, stopSpeaking } from '@/lib/audio'

interface ExerciseGuidePanelProps {
  exerciseName: string
  open: boolean
  onToggle: () => void
}

export function ExerciseGuidePanel({ exerciseName, open, onToggle }: ExerciseGuidePanelProps) {
  const guide = getExerciseGuide(exerciseName) ?? getDefaultGuide(exerciseName)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isReadingGuideRef = useRef(false)

  // Only cancel the "read aloud" speech when exercise changes — don't touch normal player announcements
  useEffect(() => {
    if (isReadingGuideRef.current) {
      stopSpeaking()
      isReadingGuideRef.current = false
    }
    setIsSpeaking(false)
  }, [exerciseName])

  // Cancel guide speech on unmount
  useEffect(() => {
    return () => {
      if (isReadingGuideRef.current) {
        stopSpeaking()
      }
      isReadingGuideRef.current = false
    }
  }, [])

  // Monitor speechSynthesis end
  useEffect(() => {
    if (!isSpeaking) return

    const checkSpeaking = setInterval(() => {
      if ('speechSynthesis' in window && !speechSynthesis.speaking) {
        setIsSpeaking(false)
        isReadingGuideRef.current = false
      }
    }, 300)

    return () => clearInterval(checkSpeaking)
  }, [isSpeaking])

  const handleReadAloud = useCallback(() => {
    if (!('speechSynthesis' in window)) return

    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      isReadingGuideRef.current = false
      return
    }

    // Build the full text to read
    const parts: string[] = []
    parts.push(exerciseName)
    parts.push(guide.description)
    parts.push('Étapes du mouvement.')
    guide.steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`)
    })
    parts.push('Conseils.')
    guide.tips.forEach((tip) => {
      parts.push(tip)
    })

    const fullText = parts.join('. ')
    isReadingGuideRef.current = true
    speak(fullText, 0.95)
    setIsSpeaking(true)
  }, [isSpeaking, exerciseName, guide])

  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01" />
        </svg>
        Comment faire ?
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-slate-900 rounded-xl p-4 mt-1 space-y-4">
          {/* Illustration + description */}
          <div className="flex gap-4 items-start">
            <img
              src={guide.image}
              alt={exerciseName}
              className="w-20 h-20 rounded-xl flex-shrink-0"
            />
            <p className="text-sm text-slate-300 leading-relaxed">
              {guide.description}
            </p>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              Mouvement
            </h4>
            <ol className="space-y-1.5">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-emerald-500 font-mono text-xs mt-0.5 flex-shrink-0">
                    {i + 1}.
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          <div>
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
              Conseils
            </h4>
            <ul className="space-y-1.5">
              {guide.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-amber-500 flex-shrink-0">&#x2022;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Read aloud button */}
          <button
            onClick={handleReadAloud}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97] ${
              isSpeaking
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
            aria-label={isSpeaking ? 'Arrêter la lecture' : 'Lire les instructions à haute voix'}
          >
            {isSpeaking ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V18.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Arrêter la lecture
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
                Lire à haute voix
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
