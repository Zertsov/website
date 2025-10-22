import { NextResponse } from 'next/server'
import { getAllArticles } from '@/lib/getAllArticles'

export async function GET() {
  try {
    const articles = await getAllArticles()

    // Return article metadata without the component
    const articleList = articles.map(({ component, ...meta }) => meta)

    return NextResponse.json({
      articles: articleList,
      count: articleList.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to retrieve articles.',
      },
      { status: 500 }
    )
  }
}
