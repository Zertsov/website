import { Container } from '@/components/Container'

export default function Loading() {
  return (
    <Container className="flex flex-col items-center justify-center min-h-screen py-16">
      <div className="w-12 h-12 border-4 border-zinc-200 rounded-full border-t-zinc-800 animate-spin dark:border-zinc-700 dark:border-t-zinc-300"></div>
      <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400">Loading...</p>
    </Container>
  )
} 