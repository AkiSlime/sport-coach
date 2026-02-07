interface EmptyStateProps {
  title: string
  subtitle?: string
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      {/* Animated icon circle with gradient border */}
      <div className="relative w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-transparent" />
        <div className="absolute inset-[3px] rounded-full bg-slate-900 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-500/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-2 max-w-[240px] leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}
