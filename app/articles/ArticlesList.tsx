'use client'

import { useId, useMemo, useState } from 'react'

import type { ArticleMeta } from 'lib/getAllArticles'
import { formatDate } from 'lib/formatDate'

import { Card } from '@/components/Card'

type ArticlesListProps = {
  articles: ArticleMeta[]
}

function Article({ article }: { article: ArticleMeta }) {
  const formattedDate = formatDate(article.date)

  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={`/articles/${article.slug}`}>
          {article.title}
        </Card.Title>
        <Card.Eyebrow
          as="time"
          dateTime={article.date}
          className="md:hidden"
          decorate
        >
          {formattedDate}
        </Card.Eyebrow>
        <Card.Description>{article.description}</Card.Description>
        <Card.Cta>Read article</Card.Cta>
      </Card>
      <Card.Eyebrow as="div" className="mt-1 hidden md:block">
        <time dateTime={article.date}>{formattedDate}</time>
        {article.tags ? <div>Tags: {article.tags.join(', ')}</div> : null}
      </Card.Eyebrow>
    </article>
  )
}

export function ArticlesList({ articles }: ArticlesListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const selectId = useId()

  const tags = useMemo(() => {
    const tagSet = new Set<string>()

    for (const article of articles) {
      if (!article.tags) continue
      for (const tag of article.tags) {
        tagSet.add(tag)
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (!selectedTag) return articles

    return articles.filter((article) => article.tags?.includes(selectedTag))
  }, [articles, selectedTag])

  return (
    <div className="flex max-w-3xl flex-col space-y-6">
      {tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          <label
            className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
            htmlFor={selectId}
          >
            Filter by tag
          </label>
          <select
            id={selectId}
            value={selectedTag ?? ''}
            onChange={(event) =>
              setSelectedTag(event.target.value === '' ? null : event.target.value)
            }
            className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {filteredArticles.length > 0 ? (
        <div className="flex flex-col space-y-16">
          {filteredArticles.map((article) => (
            <Article key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No articles found for that tag.
        </p>
      )}
    </div>
  )
}
