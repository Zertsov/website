import Link from 'next/link'

import { Container } from '@/components/Container'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-screen py-16">
      <p className="text-base font-semibold text-zinc-400 dark:text-zinc-500">
        404
      </p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <Link
        href="/"
        className="inline-flex items-center px-4 py-2 mt-8 text-sm font-medium text-zinc-800 bg-zinc-100 rounded-md dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-700 hover:bg-zinc-200"
      >
        Go back home
      </Link>
    </Container>
  )
} 