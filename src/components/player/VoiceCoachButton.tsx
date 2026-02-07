import { clsx } from 'clsx'
import type { VoiceCoachStatus } from '@/lib/voice/types'

interface VoiceCoachButtonProps {
  status: VoiceCoachStatus
  isAvailable: boolean
  onPress: () => void
  onRelease: () => void
}

export function VoiceCoachButton({
  status,
  isAvailable,
  onPress,
  onRelease,
}: VoiceCoachButtonProps) {
  const isActive = status === 'listening'
  const isThinking = status === 'thinking'
  const isSpeaking = status === 'speaking'

  return (
    <button
      onPointerDown={isAvailable && status === 'idle' ? onPress : undefined}
      onPointerUp={isActive ? onRelease : undefined}
      onPointerCancel={isActive ? onRelease : undefined}
      onClick={() => {
        if (isActive) {
          onRelease()
        } else if (status === 'idle' && isAvailable) {
          onPress()
        } else if (isSpeaking || isThinking) {
          onRelease()
        }
      }}
      disabled={!isAvailable}
      aria-label={
        isActive
          ? 'Arr\u00eater l\u2019\u00e9coute'
          : isThinking
            ? 'Le coach r\u00e9fl\u00e9chit...'
            : isSpeaking
              ? 'Le coach parle...'
              : 'Parler au coach'
      }
      className={clsx(
        'relative w-12 h-12 rounded-full flex items-center justify-center active:scale-95 transition-all',
        !isAvailable && 'opacity-30 cursor-not-allowed',
        isActive && 'bg-red-500/80 border-2 border-red-400 shadow-lg shadow-red-900/40',
        isThinking && 'bg-amber-500/20 border border-amber-500/40',
        isSpeaking && 'bg-emerald-500/20 border border-emerald-500/40',
        status === 'idle' && isAvailable && 'bg-slate-800/60 border border-slate-700/30 hover:bg-slate-700/60',
      )}
    >
      {/* Pulsing ring when listening */}
      {isActive && (
        <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
      )}

      {/* Thinking animation */}
      {isThinking && (
        <span className="absolute inset-0 rounded-full border-2 border-amber-400/50 animate-spin" style={{ borderTopColor: 'transparent' }} />
      )}

      {/* Mic icon */}
      {(status === 'idle' || isActive) && (
        <svg
          className={clsx('w-5 h-5 relative', isActive ? 'text-white' : 'text-slate-400')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      )}

      {/* Thinking dots */}
      {isThinking && (
        <div className="flex gap-1 relative">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {/* Speaking wave icon */}
      {isSpeaking && (
        <svg className="w-5 h-5 text-emerald-400 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      )}
    </button>
  )
}
