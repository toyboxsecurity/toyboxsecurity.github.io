/**
 * Feature cards for the homepage grid (rendered in Issue 6).
 *
 * Seed copy extracted from the legacy `_posts/services-*.markdown` files
 * (12 years old, dated tone). The original three posts cover Traps,
 * Robbers, and Shoes; the rest are new blurbs seeded from gameplay GIFs
 * that existed in the repo but never had post copy.
 *
 * Owner reviews and rewrites this list during Issue 6 (HITL).
 */

export interface Feature {
  /** Stable key, used as the slug for the corresponding video file in public/videos/. */
  id: string;
  /** Display title. May include a soft break with <br>. */
  title: string;
  /** 1–2 sentence body. Plain text. */
  body: string;
  /** Source GIF basename — corresponds to video files at public/videos/{slug}.{mp4,webm}. */
  videoSlug: string;
}

export const FEATURES: Feature[] = [
  {
    id: 'traps',
    title: 'T Is For Traps',
    body: 'As a kid, pick your trap loadout and place each one strategically around the house to outwit and defeat the robbers. Unlock new trap types the more you play.',
    videoSlug: 'blowtorch',
  },
  {
    id: 'robbers',
    title: 'Play as the Robbers',
    body: "Pick a loadout of heist tools — crowbars, lockpicks, flashlights, whatever else fits in a duffel bag. Case the house, steal the loot, catch the kid, or get out before the sirens hit — whichever wins first.",
    videoSlug: 'robberGameplay',
  },
  {
    id: 'shoes',
    title: 'The Importance of Shoes',
    body: 'Lose your shoes to glue, tar, or worse and suddenly every floor is enemy territory. Removing the robbers’ shoes is a kid’s sneakiest defense.',
    videoSlug: 'shoes',
  },
  {
    id: 'multiplayer',
    title: 'Multiplayer Made for Friend Groups',
    body: '1–4 players online. Grab your friends, pick sides, and let the chaos unfold — coordinate trap layouts with your fellow kids, or split the loot with your fellow burglars. Steam voice chat built in.',
    videoSlug: 'multiplayer',
  },
  {
    id: 'slingshot',
    title: 'Slingshots & Improvised Weapons',
    body: 'Marbles, ball bearings, and whatever you can pick up off the kitchen counter. Pick your shots — robbers don’t forgive a missed headshot.',
    videoSlug: 'slingShot',
  },
  {
    id: 'slip-on-cars',
    title: 'Get Out the Hot Wheels',
    body: 'Scatter toy cars across the linoleum and watch a 6-foot burglar eat tile. Some traps are just physics waiting to happen.',
    videoSlug: 'slipOnCars',
  },
  {
    id: 'vase',
    title: 'Smash, Crash, and Distract',
    body: 'Every shelf, vase, and bookcase is interactable. Knock things over to bait robbers into stepping somewhere they shouldn’t.',
    videoSlug: 'vase',
  },
];
