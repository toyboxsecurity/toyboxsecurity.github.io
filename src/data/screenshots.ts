/**
 * Screenshots referenced from the homepage gallery + the press page.
 * Each entry imports the image so Astro's pipeline handles AVIF/WebP/srcset.
 *
 * Order = display order. Owner can reorder during Issue 9 review.
 */
import s01 from '~/assets/screenshots/screenshot-01.png';
import s02 from '~/assets/screenshots/screenshot-02.png';
import s03 from '~/assets/screenshots/screenshot-03.png';
import s04 from '~/assets/screenshots/screenshot-04.png';
import s05 from '~/assets/screenshots/screenshot-05.png';
import s06 from '~/assets/screenshots/screenshot-06.png';
import s07 from '~/assets/screenshots/screenshot-07.png';
import s08 from '~/assets/screenshots/screenshot-08.png';
import s09 from '~/assets/screenshots/screenshot-09.png';
import s10 from '~/assets/screenshots/screenshot-10.png';
import s11 from '~/assets/screenshots/screenshot-11.png';
import type { ImageMetadata } from 'astro';

export interface Screenshot {
  src: ImageMetadata;
  alt: string;
}

export const SCREENSHOTS: Screenshot[] = [
  { src: s01, alt: 'Gameplay screenshot 1' },
  { src: s02, alt: 'Gameplay screenshot 2' },
  { src: s03, alt: 'Gameplay screenshot 3' },
  { src: s04, alt: 'Gameplay screenshot 4' },
  { src: s05, alt: 'Gameplay screenshot 5' },
  { src: s06, alt: 'Gameplay screenshot 6' },
  { src: s07, alt: 'Gameplay screenshot 7' },
  { src: s08, alt: 'Gameplay screenshot 8' },
  { src: s09, alt: 'Gameplay screenshot 9' },
  { src: s10, alt: 'Gameplay screenshot 10' },
  { src: s11, alt: 'Gameplay screenshot 11' },
];
