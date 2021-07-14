import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'

export default function Home() {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Mitch's ramblings (more info here)</p>
        <p>(this is a sample site - you'll be building a site like this or <a href="https://nextjs.org/learn">the Next.js tutorial</a>)</p>
      </section>
    </Layout>
  )
}
