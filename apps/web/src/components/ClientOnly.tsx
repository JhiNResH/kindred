'use client'

import { useState, useEffect, ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * ClientOnly wrapper to prevent SSR hydration issues
 * Use this to wrap components that use browser APIs (localStorage, window, etc.)
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Hook to check if component is mounted (client-side)
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
