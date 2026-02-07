import { useEffect, useRef } from 'react'

export function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!active) {
      wakeLockRef.current?.release()
      wakeLockRef.current = null
      return
    }

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake lock not available or denied
      }
    }

    requestWakeLock()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      wakeLockRef.current?.release()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [active])
}
