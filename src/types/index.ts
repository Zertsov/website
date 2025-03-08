import { MDXComponents } from 'mdx/types'

export interface Article {
  slug: string
  title: string
  date: string
  description: string
  author?: string
  component: (props: any) => JSX.Element
}

export interface ArticleMeta {
  title: string
  description: string
  date: string
  author?: string
} 