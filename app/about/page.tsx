import clsx from 'clsx'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import type { ComponentProps } from 'react'

import { Container } from '@/components/Container'
import { GitHubIcon, LinkedInIcon, TwitterIcon } from '@/components/SocialIcons'
import portraitImage from '@/images/photos/bucket.jpg'

type SocialLinkProps = {
  className?: string
  href: string
  children: React.ReactNode
  icon: React.ComponentType<ComponentProps<'svg'>>
}

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: SocialLinkProps) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="flex text-sm font-medium transition group text-zinc-800 hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="flex-none w-6 h-6 transition fill-zinc-500 group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

function MailIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <title>Mail icon</title>
      <path
        fillRule="evenodd"
        d="M6 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6Zm.245 2.187a.75.75 0 0 0-.99 1.126l6.25 5.5a.75.75 0 0 0 .99 0l6.25-5.5a.75.75 0 0 0-.99-1.126L12 12.251 6.245 7.187Z"
      />
    </svg>
  )
}

function Introduction() {
  const work = 'Clerk'
  const project = 'AI enablement tools'

  return (
    <div className="lg:order-first lg:row-span-2">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
        Hey, I&apos;m Mitch
      </h1>
      <div className="mt-6 text-base space-y-7 text-zinc-600 dark:text-zinc-400">
        <p>
          I&apos;ve been getting in trouble with computers since I was a kid,
          from breaking my dad&apos;s old Gateway tower at the office trying to
          play my Power Rangers CD when I was 5, to causing scheduled shutdowns
          of computers throughout my high school network to give my friends
          extra time to study for exams.
        </p>
        <p>
          I&apos;ve spent my career primarily writing Go services and tooling
          related to infrastructure, security, and reliability. I worked at a
          couple of large businesses, not only learning how to build services
          and tools, but how to build them in a way that{' '}
          <span className="italic">scales</span> to the needs of businesses of
          their size. I&apos;m now using those same skills to help {work} build
          out {project}.
        </p>
        <p>
          I mostly use this as a way for me to test things I do at {work}, so if
          you see broken stuff, assume it&apos;s on purpose.
        </p>
      </div>
    </div>
  )
}

function SocialLinks() {
  return (
    <div className="lg:pl-20">
      <ul>
        <SocialLink href="https://twitter.com/VozMajal" icon={TwitterIcon}>
          Follow on Twitter
        </SocialLink>
        <SocialLink
          href="https://github.com/Zertsov"
          icon={GitHubIcon}
          className="mt-4"
        >
          Follow on GitHub
        </SocialLink>
        <SocialLink
          href="https://www.linkedin.com/in/mitch-vostrez/"
          icon={LinkedInIcon}
          className="mt-4"
        >
          Follow on LinkedIn
        </SocialLink>
        <SocialLink
          href="mailto:mitch@voz.dev"
          icon={MailIcon}
          className="pt-8 mt-8 border-t border-zinc-100 dark:border-zinc-700/40"
        >
          mitch@voz.dev
        </SocialLink>
      </ul>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'About - Mitch Vostrez',
  description: "I'm Mitch Vostrez, a software engineer at Clerk.",
}

export default function About() {
  return (
    <>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="object-cover aspect-square rotate-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              />
            </div>
          </div>
          <Introduction />
          <SocialLinks />
        </div>
      </Container>
    </>
  )
}
