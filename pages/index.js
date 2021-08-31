import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import { getSortedPostsData } from '../lib/posts'
import utilStyles from '../styles/utils.module.css'

export default function Home({ postsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>

      {/* Intro section */}
      <section className={utilStyles.headingMd}>
        <p>Mitch's ramblings (more info here)</p>
        <p>(this is a sample site - you'll be building a site like this or <a href="https://nextjs.org/learn">the Next.js tutorial</a>)</p>
      </section>

      {/* Posts section */}
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        <ul className={utilStyles.list}>
          {postsData.map(({ id, date, title }) => (
            <li className={utilStyles.listItem} key={id}>
              {title}
              <br />
              {id}
              <br />
              {date}
            </li>
          ))}
        </ul>
      </section>

    </Layout>
  )
}

export async function getStaticProps() {
  const postsData = getSortedPostsData()
  return {
    props: {
      postsData
    }
  }
}