import { NextResponse } from 'next/server'

import { invokeTool, type ToolInvocation } from '@/lib/mcp-tools'

export async function POST(request: Request) {
  let body: ToolInvocation | null = null

  try {
    body = (await request.json()) as ToolInvocation
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  if (!body?.tool) {
    return NextResponse.json(
      { error: 'Missing "tool" in request body.' },
      { status: 400 }
    )
  }

  const result = await invokeTool(body)

  return NextResponse.json(result, {
    status: result.isError ? 400 : 200,
  })
}
