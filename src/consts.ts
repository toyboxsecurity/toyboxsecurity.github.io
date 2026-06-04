/**
 * Single source of truth for IDs, URLs, and identifiers referenced across the site.
 * Anything that might change (Steam app ID, GA tag, social handles, form endpoints)
 * lives here so we never grep across components to update a string.
 */

export const SITE_URL = 'https://www.toyboxsecurity.com';

export const SITE_TITLE = 'ToyBox Security';
export const SITE_DESCRIPTION =
  'A multiplayer trap-em-up where kids defend the house with traps and burglars try to loot it AND catch the kid.';

// Steam
export const STEAM_APP_ID = 2121550;
export const STEAM_STORE_URL = `https://store.steampowered.com/app/${STEAM_APP_ID}/`;
export const STEAM_WIDGET_URL = `https://store.steampowered.com/widget/${STEAM_APP_ID}/`;
/** Canonical wishlist link used by every WishlistButton. UTM params let GA4 distinguish sources. */
export const STEAM_WISHLIST_URL = (utmMedium: string) =>
  `${STEAM_STORE_URL}?utm_source=site&utm_medium=${encodeURIComponent(utmMedium)}`;

// YouTube
export const TRAILER_VIDEO_ID = 'krRiriRHjYE';
export const TRAILER_YOUTUBE_URL = `https://www.youtube.com/watch?v=${TRAILER_VIDEO_ID}`;
export const TRAILER_POSTER_URL = `https://i.ytimg.com/vi/${TRAILER_VIDEO_ID}/maxresdefault.jpg`;

// Analytics
export const GA_MEASUREMENT_ID = 'G-4W57JFFTPL';

// Newsletter (Brevo / SendInBlue serve endpoint).
// The form posts EMAIL + email_address_check (honeypot, must be empty) +
// locale. Captcha and html_type are NOT required by this particular form
// configuration — Brevo's no-captcha forms accept the plain POST.
export const SENDINBLUE_ACTION_URL =
  'https://e96c617a.sibforms.com/serve/MUIFAMTMoNvvsVBrLTeg4qV7Vlqi93a6L67h5SFTOH_ShN985fgwf06UmRGd9kQ7zKWZuUdE628Cbk3qV8s9QgvpIXuzPVbtOPfd8-k3UM2krMvEUKR7-niPzD2NG_enFGnUuNN5HBL8reiWbJiNeAQRVY7unBniTcM9YlbyCrS9j6o6DyQoYYn3YIyH2FRbmR23PiGJIwRf8SMvZQ==';

// Social
export const SOCIAL_LINKS = [
  {
    title: 'Discord',
    handle: 'Join our community',
    url: 'https://discord.gg/Px5GgZFv6S',
  },
  {
    title: 'Twitter',
    handle: '@ToyBoxSecurity',
    url: 'https://twitter.com/ToyBoxSecurity',
  },
  {
    title: 'TikTok',
    handle: '@thatcozydev',
    url: 'https://www.tiktok.com/@thatcozydev',
  },
  {
    title: 'YouTube',
    handle: 'thatcozydev',
    url: 'https://www.youtube.com/channel/UCxs3ngB17WvLyKTy8ZcopDw',
  },
] as const;

// Studio / contact
// TODO(Issue 9): reconcile cozynookgames@gmail.com (current _config.yml) vs thatcozydev@gmail.com (legacy press kit).
export const CONTACT_EMAIL = 'cozynookgames@gmail.com';
export const STUDIO_NAME = 'thatcozydev';
export const STUDIO_LOCATION = 'Michigan, USA';

export const COPYRIGHT = `© ${new Date().getFullYear()} ${STUDIO_NAME}. All rights reserved.`;
