declare module '*.mdx' {
  import { MDXProps } from 'mdx/types';
  
  export const meta: {
    title: string;
    description: string;
    date: string;
    author?: string;
  };
  
  export default function MDXContent(props: MDXProps): JSX.Element;
} 