import glob from 'fast-glob'
import * as path from 'path'

async function importArticle(articleFilename) {
  // Check if we're using the App Router or Pages Router
  const isAppRouter = articleFilename.includes('/app/')
  
  let slug = path.basename(path.dirname(articleFilename))
  
  if (isAppRouter) {
    // For App Router, the structure is /app/articles/[slug]/page.mdx
    slug = path.basename(path.dirname(path.dirname(articleFilename)))
  }
  
  const { meta, default: component } = await import(`../pages/articles/${slug}/index.mdx`)
  return {
    slug,
    ...meta,
    component,
  }
}

export async function getAllArticles() {
  // Look in both directories during migration
  const articleFilenames = await glob(['**/pages/articles/*/index.mdx', '**/app/articles/*/page.mdx'])
  
  const articles = await Promise.all(articleFilenames.map(importArticle))
  
  return articles.sort((a, z) => new Date(z.date) - new Date(a.date))
}
