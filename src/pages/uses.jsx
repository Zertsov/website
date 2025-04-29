import Head from 'next/head'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function ToolsSection({ children, ...props }) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({ title, href, children }) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

export default function Uses() {
  return (
    <>
      <Head>
        <title>Uses - Mitch Vostrez</title>
        <meta
          name="description"
          content="Software I use, gadgets I love, and other things I recommend."
        />
      </Head>
      <SimpleLayout
        title="Stuff I use"
        intro=""
      >
        <div className="space-y-20">
          <ToolsSection title="Development tools">
            <Tool title="VS Code">
              The extension tooling cannot be beat in VS Code, and due to working
              on multiple languages (and tools) daily, it makes my life immeasurably easier.

              Plus, having vim bindings in my nice editor makes me feel smart.
            </Tool>
            <Tool title="Cursor">
              Hard to ignore AI tooling nowadays, and using Cursor keeps me up to date on how AI helpers
              are evolving day after day.
            </Tool>
            <Tool title="iTerm2">
              I don&apos;t remember the reason I started using this but it&apos;s been my main
              terminal emulator since college.
            </Tool>
            <Tool title="Arc Browser">
              I tend to have issues with very distracting tools, so the ability to minimize noise in my browser
              is a huge feature I didn&apos;t know I wanted until I started using Arc.
            </Tool>
          </ToolsSection>
        </div>
      </SimpleLayout>
    </>
  )
}
