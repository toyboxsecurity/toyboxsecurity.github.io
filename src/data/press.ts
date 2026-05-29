/**
 * Press kit content for `/press` (built in Issue 9).
 *
 * Seed text extracted from the legacy `presskit.html` and `product/index.html`.
 * Owner reviews and finalizes during Issue 9 — release date, price, contact
 * email, and the studio history paragraph all need a fresh pass before going
 * out to press.
 */

import { CONTACT_EMAIL, SITE_URL, STEAM_STORE_URL, STUDIO_LOCATION, STUDIO_NAME } from '~/consts';

export interface Factsheet {
  developer: string;
  basedIn: string;
  publisher: string;
  releaseDate: string;
  platforms: string[];
  website: string;
  pressContact: string;
  regularPrice: { usd: string; eur: string };
}

export const FACTSHEET: Factsheet = {
  developer: STUDIO_NAME,
  basedIn: STUDIO_LOCATION,
  publisher: 'Self-Published',
  // TODO(Issue 9): replace 'TBA' with the real target date once locked.
  releaseDate: 'TBA',
  platforms: ['Steam (Windows PC)'],
  website: SITE_URL,
  pressContact: CONTACT_EMAIL,
  regularPrice: { usd: 'TBA', eur: 'TBA' },
};

export const DESCRIPTION = `ToyBox Security is an online 1–4 player comedy action game where kids defend a home using improvised traps and robbers try to steal everything that isn't nailed down. Set up the perfect ambush, or grab the loot and bolt for the door before the cops arrive.`;

export const HISTORY = `Development began in mid 2021 after solo developer thatcozydev set out to build the game he'd have wanted to play at eight years old — home alone, fending off burglars with traps made from toys and whatever he could find in the garage. After a couple of prototypes, the project grew into a 4-player online comedy where ingenious traps, quick wits, and ragdoll physics drive the laughs.`;

export const FEATURES_BULLETS: string[] = [
  '4-player online multiplayer — play as the kids or the robbers',
  '50+ traps and trap combinations for defeating intruders',
  'As a kid, craft and place traps strategically around the house',
  'As a robber, steal everything that isn’t nailed down',
  'Steam integration: voice chat, achievements, cloud saves',
  'Unlockables: characters, houses, and trap variants',
  'Interactive world: doorbells, light switches, breakers, ovens, sinks, ceiling fans',
  'Teamwork: extinguish a partner who catches fire, distract guards together',
  'Mini-games: lockpicking, safecracking, and more',
];

export const ABOUT_STUDIO = `${STUDIO_NAME} is a solo game developer building wholesome, meticulously-detailed games for players of every age.`;

export interface DownloadLink {
  label: string;
  href: string;
  bytesHint?: string;
}

export const PRESS_DOWNLOADS: DownloadLink[] = [
  { label: 'All screenshots (.zip)', href: '/press/toyboxsecurity-screenshots.zip' },
  { label: 'All logos (.zip)', href: '/press/toyboxsecurity-logos.zip' },
];

export const STEAM_PAGE = STEAM_STORE_URL;
