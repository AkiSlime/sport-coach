import { create } from 'zustand'
import type { VoiceCoachStatus, ChatMessage } from '@/lib/voice/types'

interface VoiceCoachStore {
  status: VoiceCoachStatus
  messages: ChatMessage[]
  transcript: string
  lastResponse: string
  error: string | null

  setStatus: (status: VoiceCoachStatus) => void
  setTranscript: (text: string) => void
  addMessage: (msg: ChatMessage) => void
  setLastResponse: (text: string) => void
  setError: (error: string | null) => void
  clearConversation: () => void
}

const MAX_MESSAGES = 20

export const useVoiceCoachStore = create<VoiceCoachStore>()((set) => ({
  status: 'idle',
  messages: [],
  transcript: '',
  lastResponse: '',
  error: null,

  setStatus: (status) => set({ status }),

  setTranscript: (text) => set({ transcript: text }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg].slice(-MAX_MESSAGES),
    })),

  setLastResponse: (text) => set({ lastResponse: text }),

  setError: (error) => set({ error }),

  clearConversation: () =>
    set({ messages: [], transcript: '', lastResponse: '', error: null }),
}))
