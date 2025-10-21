import { NextResponse } from 'next/server'

import { listTools } from '@/lib/mcp-tools'

export async function GET() {
  return NextResponse.json({
    tools: listTools(),
  })
}
