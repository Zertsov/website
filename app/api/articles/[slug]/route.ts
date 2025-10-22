import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { NextResponse } from 'next/server'

async function getArticleMarkdown(slug: string): Promise<string> {
  // Construct the path to the article MDX file
  const articlePath = join(process.cwd(), 'app/articles', `${slug}/page.mdx`)

  try {
    const content = await readFile(articlePath, 'utf-8')

    // Extract markdown content (skip imports and metadata)
    // Find where the actual markdown starts (after the last export statement)
    const lines = content.split('\n')
    let markdownStartIndex = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      // Skip empty lines, imports, and exports
      if (
        line.startsWith('import ') ||
        line.startsWith('export ') ||
        line === '' ||
        line === '}'
      ) {
        markdownStartIndex = i + 1
      } else {
        // Found the start of markdown content
        break
      }
    }

    return lines.slice(markdownStartIndex).join('\n').trim()
  } catch (error) {
    throw new Error(
      `Failed to read article "${slug}": ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const slug = (await params).slug

    if (!slug || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'Article slug is required.' },
        { status: 400 }
      )
    }

    const markdown = await getArticleMarkdown(slug)

    return NextResponse.json({
      slug,
      markdown,
      format: 'markdown',
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve article.',
      },
      { status: 404 }
    )
  }
}
