import type { VoiceCoachStatus } from '@/lib/voice/types'
import { clsx } from 'clsx'

interface VoiceCoachOverlayProps {
  status: VoiceCoachStatus
  transcript: string
  lastResponse: string
  error: string | null
}

export function VoiceCoachOverlay({
  status,
  transcript,
  lastResponse,
  error,
}: VoiceCoachOverlayProps) {
  const isVisible = status !== 'idle' || error

  if (!isVisible) return null

  return (
    <div className="px-4 pb-2">
      <div
        className={clsx(
          'rounded-xl p-3 text-sm transition-all border',
          error
            ? 'bg-red-500/10 border-red-500/20'
            : status === 'listening'
              ? 'bg-red-500/5 border-red-500/15'
              : status === 'thinking'
                ? 'bg-amber-500/5 border-amber-500/15'
                : 'bg-emerald-500/5 border-emerald-500/15',
        )}
      >
        {error && (
          <p className="text-red-400 text-xs">{error}</p>
        )}

        {status === 'listening' && (
          <div>
            <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">\u00c9coute...</p>
            <p className="text-slate-300 text-sm min-h-[1.25rem]">
              {transcript || <span className="text-slate-600">Parlez...</span>}
            </p>
          </div>
        )}

        {status === 'thinking' && (
          <div>
            <p className="text-[10px] text-amber-400/60 uppercase tracking-wider mb-1">Coach r\u00e9fl\u00e9chit...</p>
            {transcript && (
              <p className="text-slate-500 text-xs mb-1">Vous : {transcript}</p>
            )}
          </div>
        )}

        {status === 'speaking' && lastResponse && (
          <div>
            <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider mb-1">Coach</p>
            {transcript && (
              <p className="text-slate-500 text-xs mb-1">Vous : {transcript}</p>
            )}
            <p className="text-slate-200 text-sm">{lastResponse}</p>
          </div>
        )}
      </div>
    </div>
  )
}
