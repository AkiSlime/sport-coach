import { useNavigate } from 'react-router-dom'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export function SettingsPage() {
  const navigate = useNavigate()
  const groqApiKey = useSettingsStore((s) => s.groqApiKey)
  const setGroqApiKey = useSettingsStore((s) => s.setGroqApiKey)
  const voiceCoachEnabled = useSettingsStore((s) => s.voiceCoachEnabled)
  const setVoiceCoachEnabled = useSettingsStore((s) => s.setVoiceCoachEnabled)

  const [showKey, setShowKey] = useState(false)
  const [keyInput, setKeyInput] = useState(groqApiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setGroqApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-950">
      {/* Header */}
      <header className="px-5 pt-5 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/30 flex items-center justify-center hover:bg-slate-700/60 active:scale-95 transition-all"
          aria-label="Retour"
        >
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-slate-100">Param\u00e8tres</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-8">
        {/* Voice Coach Section */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Coach Vocal IA
          </h2>

          {/* Toggle */}
          <div className="flex items-center justify-between bg-slate-900/60 rounded-xl p-4 border border-slate-800/30 mb-4">
            <div>
              <p className="text-sm font-medium text-slate-200">Activer le coach vocal</p>
              <p className="text-xs text-slate-500 mt-0.5">Bouton micro pendant l'entra\u00eenement</p>
            </div>
            <button
              role="switch"
              aria-checked={voiceCoachEnabled}
              onClick={() => setVoiceCoachEnabled(!voiceCoachEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${
                voiceCoachEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                  voiceCoachEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* API Key */}
          <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/30 space-y-3">
            <div>
              <label htmlFor="groq-key" className="text-sm font-medium text-slate-200">
                Cl\u00e9 API Groq
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Gratuite sur{' '}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 underline underline-offset-2"
                >
                  console.groq.com
                </a>
              </p>
            </div>

            <div className="relative">
              <input
                id="groq-key"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value)
                  setSaved(false)
                }}
                placeholder="gsk_..."
                className="w-full bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 pr-20 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            <Button
              size="sm"
              onClick={handleSave}
              className="w-full"
            >
              {saved ? 'Enregistr\u00e9 !' : 'Enregistrer la cl\u00e9'}
            </Button>
          </div>

          {/* Info */}
          <div className="mt-4 bg-slate-900/40 rounded-xl p-4 border border-slate-800/20">
            <p className="text-xs text-slate-500 leading-relaxed">
              Le coach vocal utilise Groq (mod\u00e8le Llama) pour g\u00e9n\u00e9rer des r\u00e9ponses en temps r\u00e9el.
              Le tier gratuit offre 14 400 requ\u00eates/jour, largement suffisant pour un usage personnel.
              La reconnaissance vocale utilise l'API native du navigateur (Chrome/Edge).
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
