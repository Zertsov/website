import { Inter } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from '@/components/ThemeProvider'

import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ThemeScript } from '@/components/ThemeScript'

import '@/styles/tailwind.css'
import 'focus-visible'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata = {
  title: {
    template: '%s - Mitch Vostrez',
    default: 'Mitch Vostrez - Software engineer',
  },
  description: "I'm Mitch, a software engineer based in Austin. A worldwide traveler and Chiefs fan, just making cool and fun software at Vercel.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="flex h-full flex-col bg-zinc-50 dark:bg-black">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="fixed inset-0 flex justify-center sm:px-8">
            <div className="flex w-full max-w-7xl lg:px-8">
              <div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
            </div>
          </div>
          <div className="relative">
            <Header />
            <main>
              {children}
              <SpeedInsights />
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 