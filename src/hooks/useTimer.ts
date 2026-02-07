import { useEffect, useRef } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'

export function useTimer() {
  const status = usePlayerStore((s) => s.status)
  const tick = usePlayerStore((s) => s.tick)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastTickRef = useRef<number>(0)

  useEffect(() => {
    if (status !== 'playing') {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    lastTickRef.current = Date.now()

    // setInterval continues in background (throttled to ~1s which is fine)
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const elapsed = now - lastTickRef.current
      const secondsElapsed = Math.floor(elapsed / 1000)

      if (secondsElapsed >= 1) {
        // Process ticks — cap at 300 to avoid thread block on huge catch-up
        const tickCount = Math.min(secondsElapsed, 300)
        for (let i = 0; i < tickCount; i++) {
          tick()
        }
        lastTickRef.current += secondsElapsed * 1000
      }
    }, 250) // Check 4x/sec for smooth display, actual tick is 1s based on timestamp

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, tick])

  // Catch up on missed ticks when returning from background
  useEffect(() => {
    const handleVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        usePlayerStore.getState().status === 'playing'
      ) {
        const now = Date.now()
        const elapsed = now - lastTickRef.current
        const secondsElapsed = Math.floor(elapsed / 1000)
        const tickCount = Math.min(secondsElapsed, 300)
        for (let i = 0; i < tickCount; i++) {
          tick()
        }
        lastTickRef.current = now
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [tick])
}
