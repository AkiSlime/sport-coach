import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsStore {
  groqApiKey: string
  voiceCoachEnabled: boolean
  setGroqApiKey: (key: string) => void
  setVoiceCoachEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      groqApiKey: '',
      voiceCoachEnabled: true,

      setGroqApiKey: (key) => set({ groqApiKey: key }),
      setVoiceCoachEnabled: (enabled) => set({ voiceCoachEnabled: enabled }),
    }),
    {
      name: 'custom-coach-settings',
    },
  ),
)
