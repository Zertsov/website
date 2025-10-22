// import Head from 'next/head'

import { type ArticleMeta, getAllArticles } from 'lib/getAllArticles'
import type { Metadata } from 'next'
import { SimpleLayout } from '@/components/SimpleLayout'
import { ArticlesList } from './ArticlesList'

export const metadata: Metadata = {
  title: 'Articles - Mitch Vostrez',
  description: 'My thoughts and findings that may help you.',
}

export default async function ArticlesIndex() {
  const articles: ArticleMeta[] = (await getAllArticles()).map(
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
          <ArticlesList articles={articles} />
        </div>
      </SimpleLayout>
    </>
  )
}
