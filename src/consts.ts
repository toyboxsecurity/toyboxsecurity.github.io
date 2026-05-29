/**
 * Single source of truth for IDs, URLs, and identifiers referenced across the site.
 * Anything that might change (Steam app ID, GA tag, social handles, form endpoints)
 * lives here so we never grep across components to update a string.
 */

export const SITE_URL = 'https://www.toyboxsecurity.com';

export const SITE_TITLE = 'ToyBox Security';
export const SITE_DESCRIPTION =
  'A multiplayer trap-em-up where kids defend the house and burglars try to steal everything that isn’t nailed down.';

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

// Newsletter (Brevo / SendInBlue serve endpoint)
// NOTE: All hidden form fields from the legacy iframe still need to be copied verbatim
// when we wire the NewsletterSignup component in Issue 8.
export const SENDINBLUE_ACTION_URL =
  'https://6e743ba6.sibforms.com/serve/MUIEAFIMxk19z4MfjGwNa6OqHQeJbaCWhvfp6jlM6n_c0SlUaxJm9fj32TRKjexCSLcrxXBaJcsMK1xYVwVN6v--0P9qi8xgXxB7sJ-LFV1xh9E37IZkoJjDSi7lH9Cdy0IBOJnemtR2okvxnmEI379CJyFHkpjzaOha5e3HmRJ832mhJDm45oPbGZhm9gMXFTOGEqiUYFISbCli';

// Social
export const SOCIAL_LINKS = [
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
