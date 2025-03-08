'use client'

import { useEffect } from 'react'
import { Container } from '@/components/Container'

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <Container className="flex flex-col items-center justify-center min-h-screen py-16">
      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Something went wrong!</h2>
      <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred. Please try again later.
      </p>
      <button
        onClick={() => reset()}
        className="inline-flex items-center px-4 py-2 mt-8 text-sm font-medium text-zinc-800 bg-zinc-100 rounded-md dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700 hover:bg-zinc-200"
      >
        Try again
      </button>
    </Container>
  )
} 