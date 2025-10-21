import { NextResponse } from 'next/server'

type RemoteGuide = {
  id: string
  title: string
  synopsis: string
  tags: string[]
}

const guides: RemoteGuide[] = [
  {
    id: 'getting-started',
    title: 'Getting started with remote MCP servers',
    synopsis:
      'Understand the handshake, connection requirements, and practical deployment options.',
    tags: ['overview', 'setup'],
  },
  {
    id: 'tooling',
    title: 'Designing your first tool',
    synopsis:
      'Draft input schemas and craft responses that feel natural when surfaced to clients.',
    tags: ['tools', 'api'],
  },
  {
    id: 'observability',
    title: 'Adding lightweight observability',
    synopsis:
      'Log invocations and capture structured metrics without overwhelming a demo project.',
    tags: ['monitoring'],
  },
]

export async function GET() {
  return NextResponse.json({
    message: 'Reference data for remote MCP walkthroughs.',
    guides,
    latestUpdate: guides[0]?.id ?? null,
  })
}

export async function POST(request: Request) {
  let body: { topic?: string } = {}

  try {
    body = (await request.json()) as { topic?: string }
  } catch {
    // Intentionally ignore JSON parsing errors so we can return a tailored response.
    return NextResponse.json(
      { error: 'Expected JSON body when creating a checklist.' },
      { status: 400 }
    )
  }

  if (!body.topic || body.topic.trim().length === 0) {
    return NextResponse.json(
      { error: 'Provide a "topic" to build a checklist for.' },
      { status: 400 }
    )
  }

  const checklist = [
    `Clarify the goal for "${body.topic}".`,
    'Describe the minimum API surface a remote MCP client needs.',
    'List a tool invocation example and expected response payload.',
    'Note any follow-up tasks for observability or scaling discussions.',
  ]

  return NextResponse.json({
    topic: body.topic,
    checklist,
  })
}
