/**
 * Content collections.
 *
 * `news` — devblog / launch updates. Drafts (`draft: true`) are filtered
 * out of production builds; they still render in dev so you can preview.
 */
import { defineCollection, z } from 'astro:content';

const news = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.coerce.date(),
      description: z.string().max(180),
      heroImage: image().optional(),
      draft: z.boolean().default(false),
      tags: z.array(z.string()).optional(),
    }),
});

export const collections = { news };
