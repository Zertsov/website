import { notFound } from 'next/navigation'
import { ArticleLayout } from '@/components/ArticleLayout'
import { getAllArticles } from '@/lib/getAllArticles'

export async function generateStaticParams() {
  const articles = await getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }) {
  const articles = await getAllArticles()
  const article = articles.find((article) => article.slug === params.slug)

  if (!article) {
    return {}
  }

  return {
    title: article.title,
    description: article.description,
  }
}

export default async function Article({ params }) {
  const articles = await getAllArticles()
  const article = articles.find((article) => article.slug === params.slug)

  if (!article) {
    notFound()
  }

  return (
    <ArticleLayout article={article}>
      <article.component />
    </ArticleLayout>
  )
} 