import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
        <span className="text-4xl font-bold text-slate-500">404</span>
      </div>
      <h1 className="text-xl font-bold mb-2">Page introuvable</h1>
      <p className="text-sm text-slate-400 mb-8">
        Cette page n'existe pas ou a été déplacée.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors active:scale-95"
      >
        Retour à l'accueil
      </button>
    </div>
  )
}
