/**
 * Social proof for the hero — press quotes, Steam Next Fest blurbs,
 * influencer quotes, etc.
 *
 * Empty for now. The Hero renders a rotating quote above the wishlist
 * button when this array has entries; nothing renders when it's empty.
 *
 * Format example to add later:
 *   {
 *     text: "The best couch party game I've played all year.",
 *     attribution: 'IGN',
 *   }
 */

export interface PressQuote {
  /** Short — under 90 characters reads best in the hero slot. */
  text: string;
  /** Publication or person. Use a handle for tweets, e.g. '@reviewer'. */
  attribution: string;
  /** Optional URL the attribution links to (article, tweet, etc.). */
  url?: string;
}

export const PRESS_QUOTES: PressQuote[] = [
  // Add entries here when press lands. Hero auto-shows the first entry.
];
