import { NextConfig } from 'next';
import { Options } from '@mdx-js/loader';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';
import createMDX from '@next/mdx';

// Define the MDX options type
interface MDXOptions extends Options {
  providerImportSource?: string;
}

// Define the withMDX config type
interface WithMDXConfig {
  extension: RegExp;
  options: MDXOptions;
}

const withMDXConfig: WithMDXConfig = {
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypePrism],
    providerImportSource: '@mdx-js/react',
  },
};

const withMDX = createMDX(withMDXConfig);

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: true, // Enable the new MDX compiler
  },
};

export default withMDX(nextConfig);
