import { Routes, Route } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { EditorPage } from '@/pages/EditorPage'
import { PlayerPage } from '@/pages/PlayerPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export default function App() {
  return (
    <div className="min-h-[100dvh] bg-slate-950 text-slate-100 safe-top safe-bottom">
      <Routes>
        <Route index element={<HomePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="program/:programId" element={<EditorPage />} />
        <Route path="program/:programId/play" element={<PlayerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
