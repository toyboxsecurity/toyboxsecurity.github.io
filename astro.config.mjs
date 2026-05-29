// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.toyboxsecurity.com',
  base: '/',
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [
    sitemap({
      // 404 should never be indexed; /styleguide is an internal page.
      filter: (page) => !page.includes('/404') && !page.includes('/styleguide'),
    }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
