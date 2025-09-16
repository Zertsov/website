// import Head from 'next/head'

import { formatDate } from 'lib/formatDate'
import { getAllArticles } from 'lib/getAllArticles'
import type { Metadata } from 'next'
import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'

type Article = {
  slug: string
  title: string
  description: string
  date: string
  tags?: string[]
}

type ArticlesIndexProps = {
  articles: Article[]
}

function Article({ article }: { article: Article }) {
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

export const metadata: Metadata = {
  title: 'Articles - Mitch Vostrez',
  description: 'My thoughts and findings that may help you.',
}

export default async function ArticlesIndex() {
  const articles = (await getAllArticles()).map(
    ({ component, ...meta }) => meta
  )

  return (
    <>
      {/* <Head>
        <title>Articles - Mitch Vostrez</title>
        <meta
          name="description"
          content="My thoughts and findings that hopefully help you."
        />
      </Head> */}
      <SimpleLayout
        title="My thoughts and findings that may help you."
        intro="As I go throughout my career I find things that make me think 'this may help others', so I want to share them with the world (and also use as a reference for myself)."
      >
        <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
          <div className="flex max-w-3xl flex-col space-y-16">
            {articles.map((article) => (
              <Article key={article.slug} article={article} />
            ))}
          </div>
        </div>
      </SimpleLayout>
    </>
  )
}
