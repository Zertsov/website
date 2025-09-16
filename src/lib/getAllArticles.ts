import glob from 'fast-glob'
import * as path from 'node:path'

type Article = {
  slug: string
  component: any // TODO(voz): get type for MDX content
  author: string
  date: string
  title: string
  tags?: string[]
  description: string
}

async function importArticle(articleFilename: string): Promise<Article> {
  const { meta, default: component } = await import(
    `../pages/articles/${articleFilename}`
  )
  return {
    slug: articleFilename.replace(/(\/index)?\.mdx$/, ''),
    ...meta,
    component,
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const articleFilenames = await glob(['**/*.mdx', '**/*/index.mdx'], {
    cwd: path.join(process.cwd(), 'src/pages/articles'),
  })

  const articles = await Promise.all(articleFilenames.map(importArticle))

  return articles.sort(
    (a, z) => new Date(z.date).getTime() - new Date(a.date).getTime()
  )
}
