'use client'

import { usePathname } from 'next/navigation'
import React, { useEffect, useRef } from 'react'

function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const previousPathname = usePrevious(pathname)

  // Clone children and pass previousPathname as a prop
  // This maintains compatibility with components that expect this prop
  return (
    <>
      {typeof children === 'object' && children !== null && 'type' in children
        ? // If children is a React element, clone it with the previousPathname prop
          React.cloneElement(children as React.ReactElement, {
            previousPathname,
          })
        : // Otherwise, just render children as-is
          children}
    </>
  )
}
