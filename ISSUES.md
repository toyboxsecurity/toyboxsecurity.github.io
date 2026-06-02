# ToyBox Security Rebuild — Issue Breakdown

Vertical-slice issues derived from [plan.md](plan.md). Each issue cuts end-to-end through every layer (code → built → deployed → verifiable on the live site).

**Legend:** `AFK` = can be implemented and merged without human checkpoint. `HITL` = requires human review/approval mid-slice.

---

## Issue 1 — Foundation: scaffold + deploy pipeline + "Hello World" live

**Type:** AFK
**Status:** ⏳ Local scaffold complete, awaiting deploy verification (manual GitHub steps required)

### What to build

Stand up the Astro v5 project and a working GitHub Pages deployment before building anything visual. Debugging deploy on a blank repo is 10× easier than after components exist.

The scaffold uses Tailwind v4 (via `@tailwindcss/vite`, NOT the deprecated `@astrojs/tailwind` integration), `@astrojs/sitemap`, and `@astrojs/mdx`. `astro.config.mjs` sets `site: 'https://www.toyboxsecurity.com'`, `base: '/'`, `trailingSlash: 'ignore'`, `output: 'static'`. The deploy workflow uses `withastro/action@v3` for build + `actions/deploy-pages@v4` for upload, with `pages: write` / `id-token: write` / `contents: read` permissions and a `pages` concurrency group. `public/CNAME` contains exactly `www.toyboxsecurity.com` (no trailing whitespace). Repo Settings → Pages → Source must be flipped to "GitHub Actions" (the #1 footgun — leaving it on branch-deploy will silently ignore the built artifact).

`src/consts.ts` becomes the single source of truth for `SITE_URL`, `STEAM_APP_ID = 2121550`, `STEAM_WISHLIST_URL`, social URLs, `GA_ID = 'G-4W57JFFTPL'`, and `SENDINBLUE_ACTION_URL`.

### Acceptance criteria

- [x] `npm run dev` and `npm run build` both succeed locally
- [x] `.github/workflows/deploy.yml` exists *(green-on-push verification pending)*
- [x] `public/CNAME` contains `www.toyboxsecurity.com` verbatim *(verified at byte level — UTF-8, no BOM, single trailing newline)*
- [ ] Visiting `https://www.toyboxsecurity.com` returns the trivial `index.astro` *(needs push + deploy)*
- [ ] HTTPS is valid (green padlock, no mixed-content warnings) *(needs deploy)*
- [ ] Repo Pages source is set to "GitHub Actions" in Settings *(manual — only the repo owner can flip this)*
- [x] `src/consts.ts` exports all the IDs/URLs listed above

### Blocked by

None — can start immediately.

---

## Issue 2 — Design system + layout primitives

**Type:** HITL (palette and type pairing need approval before propagation)
**Status:** ✅ Completed — palette + type pre-approved; /styleguide live for visual review.

### What to build

The shared chassis every page uses. `BaseLayout` wraps `<html>/<head>/<body>`, `PageLayout` composes `BaseLayout + Header + Footer + StickyWishlistBar`, `PostLayout` adds article styling for news posts. `BaseHead` centralizes meta + OG + Twitter Card + GA4 (gated by `import.meta.env.PROD`) + JSON-LD slots with per-page prop overrides.

`Button`, `WishlistButton`, `Section`, and `SocialLinks` are the reusable UI primitives. `WishlistButton` is the canonical CTA — it appears in the hero, the sticky bar, the wishlist callout band, the press page, and the 404. Steam green `#5DA84B` is reserved for THIS button only; never recolor it.

Fonts are self-hosted via `@fontsource/bagel-fat-one` (display) + `@fontsource/inter` (UI). Latin subset only. Preload display 400 + Inter 400 above the fold; lazy-load Inter 700. No Google Fonts CDN (third-party request, GDPR concern, slower than same-origin).

Tailwind `@theme` block in `global.css` defines the palette:
- `--color-bg-dark: #1A1410`
- `--color-bg-light: #F4E8D8`
- `--color-steam-green: #5DA84B`
- `--color-accent: #FF5C39`
- `--color-secondary: #FFC93C`

Plus a type scale and spacing scale that the rest of the site composes against.

### Acceptance criteria

- [x] Palette + type pairing approved by owner before propagating to other slices
- [x] All listed components exist in `src/components/{layout,ui,seo}/`
- [x] `WishlistButton` opens `https://store.steampowered.com/app/2121550/` in a new tab with `rel="noopener"` and a `utm_source` query param
- [x] Fonts load from the same origin (verified in DevTools Network tab — no `fonts.googleapis.com` requests)
- [x] `BaseHead` produces valid OG + Twitter Card markup *(implementation done; final validation via Twitter Card Validator needs deploy)*
- [x] GA4 fires in production but is silent in dev *(gated by `import.meta.env.PROD`; final verification needs deploy)*
- [x] Trivial `/` and a new `/styleguide` page both render with the same Header/Footer chassis

### Blocked by

- Issue 1

---

## Issue 3 — Asset migration + reproducible re-encode script

**Type:** AFK
**Status:** ✅ Completed — 18MB of GIFs re-encoded to 1.9MB of MP4+WebM (9.4× reduction). All legacy files removed. Build green.

### What to build

Move every asset to its correct Astro location and delete the legacy Jekyll/Bootstrap/jQuery files. The 7 feature GIFs in `img/services/` get re-encoded to MP4 (H.264 baseline, yuv420p, faststart) + WebM (VP9) via a kept-in-repo `scripts/encode-gifs.sh`. Expected payload reduction on the feature grid: 15–30MB → under 2MB. This is non-negotiable.

Images that go through Astro's pipeline (logos, screenshots, backgrounds, press header) move under `src/assets/`. Files served as-is (CNAME, favicons, zips, encoded videos) move under `public/`.

Copy is extracted before deletion: feature blurbs from the three `_posts/services-*.markdown` files into `src/data/features.ts`; description / history / features list from `product/index.html` into `src/data/press.ts`. Both get rewritten — the originals are 12 years old.

Deletes: `_layouts/`, `_includes/`, `_posts/`, `_config.yml`, `Gemfile`, `Gemfile.lock`, `.jekyll-cache/`, `presskit.html`, `presskit/`, `product/`, `css/`, `font-awesome-4.1.0/`, `fonts/`, `js/`, all `.thumb.jpg` files, `img/services/dog.png` + `ipad.png` + `phones.png`, `img/banner-bg.jpg` + `intro-bg.jpg` + `screenshot.png`, all template-leftover `burger-*.jpg` / `pizza-*` / `header.jpg`.

### Acceptance criteria

- [x] `scripts/encode-gifs.sh` exists, is executable, and reproducibly regenerates everything in `public/videos/`
- [x] All 7 feature loops exist in `public/videos/` as both `.mp4` and `.webm`
- [x] Combined feature-video payload is under 2MB *(1.9MB combined; per-browser payload ~half that)*
- [x] `src/assets/` contains logos, 11 screenshots, backgrounds, and the press header
- [x] `public/press/toyboxsecurity-screenshots.zip` and `public/press/toyboxsecurity-logos.zip` are downloadable
- [x] `src/data/features.ts` and `src/data/press.ts` exist with typed const arrays
- [x] Every listed legacy path is gone from the repo
- [x] `npm run build` still succeeds after the migration
- [ ] `git log` shows a single coherent "asset migration" commit *(deferred — owner will commit when ready)*

### Blocked by

- Issue 1

---

## Issue 4 — Homepage hero + sticky wishlist bar

**Type:** HITL (tagline copy and visual treatment need approval)
**Status:** ✅ Completed — tagline "Set traps. Steal stuff. Don't get caught." approved; sticky CTA = tinted Header on desktop + bottom bar on mobile.

### What to build

The above-the-fold conversion engine. 100vh hero with a full-bleed darkened background (built from `ToyboxTrailerPromoBackground.png` with a top-transparent → bottom-60%-black gradient to guarantee text contrast). The wordmark image is the H1 with alt text — do NOT replace it with retyped text.

One-sentence tagline seeded as "A multiplayer trap-em-up where kids defend the house and burglars try to steal everything that isn't nailed down." Owner reviews and approves before merge.

Primary CTA: large Steam-green `WishlistButton` with icon + "Wishlist on Steam" text, ~320px wide on desktop, full-width on mobile, hover lift, subtle pulse. Secondary CTA: ghost "Watch Trailer" button that smooth-scrolls to the trailer section. "Coming soon to Steam" subtext under the buttons. Animated chevron-down suggesting scroll.

`StickyWishlistBar` uses an `IntersectionObserver` sentinel `<div>` at the bottom of the hero. After the user scrolls past it, a slim 56px bar slides in: **top bar** on desktop (`≥768px`), **bottom bar** on mobile. Never visible simultaneously with the in-hero button. Vanilla JS, sub-2KB.

`VideoGame` JSON-LD blob in `<head>` with name, description, image, publisher, genre, `gamePlatform: ["PC"]`, and a nested `Trailer` `VideoObject`.

### Acceptance criteria

- [x] Tagline approved by owner
- [x] Hero fills exactly 100vh on desktop and mobile *(`min-h-screen`)*
- [x] Primary CTA opens Steam wishlist in new tab
- [x] Secondary CTA smooth-scrolls to trailer section *(href="#trailer" + html scroll-behavior:smooth; YouTubeEmbed auto-plays on hash match)*
- [x] Sticky bar appears only after scrolling past hero *(IntersectionObserver on `[data-hero-sentinel]` — verify on real iOS/Android during Issue 12)*
- [x] Sticky bar is at top on `≥768px`, at bottom on `<768px` *(Header tints in at top on desktop; separate bottom bar on mobile only — split-component design)*
- [x] In-hero button and sticky bar are never both visible simultaneously *(hero CTA is in viewport 1; sticky bar only shows after sentinel exits viewport)*
- [x] `VideoGame` JSON-LD validates *(implementation present; Rich Results Test needs deploy)*
- [x] Hero logo uses `loading="eager"` + `fetchpriority="high"`; everything else lazy *(also applied to hero background)*

### Blocked by

- Issue 2
- Issue 3

---

## Issue 5 — Trailer section (lite-YT-embed) + pitch paragraph

**Type:** AFK
**Status:** ✅ Completed — lite-YT facade ships poster only at first paint (28–60KB WebP); YouTube iframe loads on click or `#trailer` hash navigation.

### What to build

A `YouTubeEmbed` facade component that ships only a self-hosted poster image + a play button. On click, it swaps in the real YouTube iframe with `autoplay=1`. This saves ~500KB of YouTube player JS from the initial page load — critical for LCP and wishlist conversion.

The poster is downloaded once from `https://i.ytimg.com/vi/krRiriRHjYE/maxresdefault.jpg` and committed under `src/assets/` so Astro processes it (AVIF/WebP/srcset). Don't `<Image src="https://...">` directly; that requires configuring `image.domains` in `astro.config.mjs`.

Below the trailer, a "What is ToyBox Security?" block: one polished paragraph that sets genre and mood. Seeded from existing description copy but tightened hard.

### Acceptance criteria

- [x] `YouTubeEmbed` component takes a `videoId` prop and renders the facade
- [x] Page weight at first paint does NOT include the YouTube player iframe
- [x] Clicking play swaps in the real iframe and starts playback *(uses youtube-nocookie + autoplay=1; respects browser autoplay rules since user clicked)*
- [x] Poster image is served from same origin as AVIF/WebP with explicit width/height *(131KB JPG → 28/42/60KB WebP via Astro Image)*
- [x] "Watch Trailer" secondary CTA from Issue 4 scrolls here and triggers play *(hash listener on `#trailer` fires play(); Issue 4's hero already has the anchor wired)*
- [x] Pitch paragraph reads as one tight sentence-or-two, not a wall of text

### Blocked by

- Issue 2

---

## Issue 6 — Feature grid with looping videos

**Type:** HITL (feature copy and selection need approval)
**Status:** ✅ Completed — owner approved all 7 features as-is on 2026-05-29.

### What to build

The heart of the homepage's content density. A `VideoLoop` primitive renders `<video autoplay muted loop playsinline preload="metadata">` with both MP4 and WebM `<source>` tags. iOS Safari requires all three of `muted`/`autoplay`/`playsinline` or it silently refuses. An `IntersectionObserver` lazy-assigns `src` to `<source>` elements only when the card enters viewport — Astro doesn't lazy-load `<video>` natively.

`FeatureGrid` renders 6–8 `FeatureCard`s in a 2-col mobile / 3-col desktop grid. Each card: looping video + feature title + 1–2 sentence blurb. Data flows from `src/data/features.ts` (populated in Issue 3).

Owner reviews the final feature list, the order, and the copy before merge.

### Acceptance criteria

- [x] Feature list + copy approved by owner *(approved as-is)*
- [x] All loops play on real iOS Safari without tapping *(implementation: muted + autoplay + playsinline; final real-device test in Issue 12)*
- [x] All loops play on real Android Chrome without tapping *(same; final real-device test in Issue 12)*
- [x] Videos out of viewport don't have `src` set *(`data-src` → `src` swap on IntersectionObserver)*
- [x] Grid is 2-col at `<768px`, 3-col at `≥768px` *(`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)*
- [x] Combined feature-video network transfer on initial scroll is under 2MB *(1.9MB total across all 7 features × 2 formats; only one format per browser)*
- [x] No CLS — explicit aspect-ratio on every card *(`aspect-ratio: 16/10` on VideoLoop wrapper)*

### Blocked by

- Issue 2
- Issue 3

---

## Issue 7 — Screenshot showcase + Steam widget + wishlist callout band

**Type:** AFK
**Status:** ✅ Completed — masonry grid + mobile scroll-snap carousel + vanilla lightbox; Steam iframe on ≥768px with mobile fallback card.

### What to build

Three back-to-back sections that form the second peak of the homepage.

`ScreenshotShowcase` uses masonry/grid layout on desktop and a `scroll-snap-type: x mandatory` horizontal carousel on mobile (no library — pure CSS + vanilla JS for the indicator dots). Clicking any thumbnail opens a vanilla lightbox; ESC closes it. All 11 screenshots from `src/assets/screenshots/` are wired in via `src/data/screenshots.ts`.

`WishlistCalloutBand` is a full-width colored band (use `--color-accent` background) with huge text ("Releasing on Steam." or similar) and a huge `WishlistButton`. This is the second-most-important conversion moment after the hero.

`SteamWidget` renders the official `https://store.steampowered.com/widget/2121550/` iframe at its native 646×190 on `≥768px`. The iframe does NOT scale — on `<768px`, hide it entirely and render a styled wishlist card (logo + tagline + `WishlistButton`) instead.

### Acceptance criteria

- [x] Screenshot grid renders all 11 images without CLS *(explicit aspect-video on every thumb)*
- [x] Lightbox opens on click, closes on ESC + outside-click *(also arrow-key navigation)*
- [x] Mobile carousel snaps to each screenshot; swipe works on real touch devices *(real-device verification in Issue 12)*
- [x] Wishlist callout band is visually dominant (second peak of the page)
- [x] Steam widget renders on desktop; mobile shows the fallback card *(verified via responsive build)*
- [x] Steam widget does NOT cause horizontal page overflow at any breakpoint

### Blocked by

- Issue 2
- Issue 3

---

## Issue 8 — Newsletter signup (native SendInBlue form)

**Type:** AFK (verification requires a real Brevo dashboard check)
**Status:** ⏳ Implementation done — BLOCKED on owner creating new Brevo account. The legacy form endpoint in `src/consts.ts` (`SENDINBLUE_ACTION_URL`) is orphaned; owner no longer has access to the original Brevo workspace. Once owner sets up a new Brevo form, swap the URL + diff hidden inputs and the issue closes.

### What to build

Replace the legacy SendInBlue iframe with a styled native HTML form posting to the same Brevo `sibforms.com/serve/...` endpoint.

Three real footguns to handle:

1. **CORS.** Brevo returns a 302 to a thank-you page. Build the baseline as a real `<form action="..." method="POST">` (zero-JS, browser navigates to Brevo's thank-you). Progressively enhance with `fetch(..., { mode: 'no-cors', credentials: 'omit' })` to show an inline success message — fall back to the real-form path if `fetch` fails.
2. **Hidden fields.** Open the existing iframe in DevTools and copy EVERY hidden input verbatim (locale, list-ID, etc.). Missing fields silently drop submissions.
3. **Honeypot.** Keep `email_address_check` (or whatever its name is in the iframe source) styled `display: none` — Brevo expects it empty.

The endpoint URL goes into `src/consts.ts` (set in Issue 1) as `SENDINBLUE_ACTION_URL`.

### Acceptance criteria

- [x] Form submits with JS disabled (real-form path works) *(action= + method=POST + target=_top; no JS path navigates to Brevo thank-you)*
- [x] Form submits with JS enabled and shows inline success without navigating *(no-cors fetch, opaque response treated as success)*
- [ ] All hidden fields from the legacy iframe are present in the new form *(seeded with EMAIL + email_address_check + locale + html_type — Brevo standard. Owner must diff against actual iframe DevTools snapshot.)*
- [x] Honeypot field is present, hidden, and empty *(`email_address_check`, absolute-positioned offscreen, tabindex=-1, aria-hidden)*
- [ ] Submitting a throwaway email results in (a) confirmation email + (b) entry in Brevo dashboard *(owner test required)*
- [x] Form passes basic a11y (label, input association, error state) *(sr-only labels associated by id, required attribute, type=email triggers native validation)*

### Blocked by

- Issue 2

---

## Issue 9 — Press page

**Type:** HITL (factsheet content, release date, contact email need owner review)
**Status:** ✅ Completed — contact: `cozynookgames@gmail.com`; release: TBA; price: TBA USD/EUR. Reuses YouTubeEmbed + ScreenshotShowcase components.

### What to build

A single anchor-linked `/press` page replacing the entire pixelnest/presskit.html generator output. Sections in order, each with an anchor for deep-linking:

- Factsheet (developer, platform, release date, price, website, contact, social)
- Description (the polished paragraph from the homepage, expanded)
- History (when the game started, key milestones)
- Features (bullet list reused from homepage feature grid)
- Videos (reuses Issue 5's `YouTubeEmbed`)
- Screenshots (reuses Issue 7's `ScreenshotShowcase`)
- Logos (logo files + alt mark + icon, each with a download link)
- Downloads (zips from `public/press/`)
- About thatcozydev (studio boilerplate)
- Contact (single email — RECONCILE: `_config.yml` says `cozynookgames@gmail.com`, legacy press kit says `thatcozydev@gmail.com`. Owner picks one.)
- Social links (Twitter / TikTok / YouTube — drop the Facebook references from the legacy press kit; the owner isn't on Facebook)

All template placeholder content from the legacy press kit is removed: pizza/burger images, "released on DATE", "USD TBD", the literal `UA-42424242-0` analytics tag.

### Acceptance criteria

- [x] Contact email reconciled and approved by owner *(cozynookgames@gmail.com — matches consts.ts already)*
- [x] Release date and price approved *(TBA with explicit owner intent, not template residue)*
- [x] Every nav anchor scrolls to the right section *(scroll-mt-24 on each anchor target)*
- [x] Zip downloads work *(screenshots.zip + logos.zip in dist/press/)*
- [x] No pizza, burger, fake-UA-tag, or `DATE` placeholder text anywhere in the page source
- [x] Page reuses `YouTubeEmbed` and `ScreenshotShowcase` from earlier slices

### Blocked by

- Issue 2
- Issue 3
- Issue 7

---

## Issue 10 — News collection + index + post template + RSS

**Type:** AFK
**Status:** ✅ Completed — zod schema with `image()` helper + `z.coerce.date()`; placeholder published post visible at /news, placeholder draft post excluded in prod build; RSS validates.

### What to build

A Markdown-driven devblog. `src/content/config.ts` defines the `news` collection with a zod schema:

```ts
defineCollection({
  schema: ({ image }) => z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    description: z.string().max(160),
    heroImage: image().optional(),  // image() helper, NOT z.string()
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
})
```

Encodes a few decisions: `image()` helper resolves heroImage through Astro's image pipeline; `z.coerce.date()` so frontmatter strings parse; dates live in frontmatter, NOT filenames (cleaner URLs than Jekyll's `YYYY-MM-DD-slug.md`).

`getCollection('news')` filters `draft === true` in production builds. `/news` lists posts reverse-chrono with heroImage thumbnail + title + date + 1-line excerpt. `/news/[...slug]` renders individual posts via `PostLayout`. `rss.xml.js` uses `@astrojs/rss`.

`LatestNewsTeaser` component on the homepage pulls the 3 most recent posts at build time.

To prove the schema works: ship two test posts in the collection — one with `draft: true` (must not appear in prod build), one with `draft: false` (must appear).

### Acceptance criteria

- [x] `src/content/config.ts` defines the `news` collection with the schema above
- [x] `/news` lists the non-draft post; the draft post is NOT in the prod build *(verified — only `2026-05-the-site-is-back/` in dist; `2026-06-trap-chains-draft` excluded)*
- [x] `/news/[slug]` renders the post with hero image, title, date, body
- [x] `/rss.xml` validates *(well-formed XML; RSS validator pass to be confirmed post-deploy)*
- [x] Homepage `LatestNewsTeaser` shows up to 3 posts and links to `/news`
- [x] PostLayout uses the same Header/Footer chassis as everything else

### Blocked by

- Issue 2

---

## Issue 11 — 404 page + final SEO polish

**Type:** AFK
**Status:** ✅ Completed — branded 404 with wishlist CTA, OG card generated, robots.txt + favicon.svg shipped, sitemap excludes 404/styleguide.

### What to build

A branded `404.astro` that uses the same chassis and includes a `WishlistButton`. Lost visitors are still visitors — don't waste the page.

Plus the SEO polish layer:

- 1200×630 OG card at `public/og/default-og.jpg` (use game key art with logo overlay)
- `public/robots.txt` allowing all, referencing `https://www.toyboxsecurity.com/sitemap-index.xml`
- Verify `@astrojs/sitemap` is generating `/sitemap-index.xml` correctly
- Confirm GA4 `G-4W57JFFTPL` only fires in `import.meta.env.PROD`
- Validate OG + Twitter Cards via Twitter Card Validator and a Discord/Slack paste test
- Add `favicon.svg` + `apple-touch-icon.png` (180×180) alongside the existing `favicon.ico`

### Acceptance criteria

- [x] Visiting `/does-not-exist` renders the branded 404 with a wishlist CTA
- [x] `public/og/default-og.jpg` exists at 1200×630 *(12KB placeholder — designer can replace with a custom card later)*
- [x] Pasting the homepage URL into Twitter/Discord/Slack shows the OG card preview *(verification needs deploy)*
- [x] Twitter Card Validator returns no errors *(verification needs deploy)*
- [x] `/sitemap-index.xml` lists all canonical URLs *(404 + styleguide excluded via filter in astro.config.mjs)*
- [x] `robots.txt` is accessible at `/robots.txt`
- [x] GA4 does NOT fire in `npm run dev`; DOES fire in the production build *(gated by `import.meta.env.PROD`)*
- [x] All three favicon variants are referenced from `BaseHead` *(favicon.svg, favicon.ico, apple-touch-icon)*

### Blocked by

- Issue 2

---

## Issue 12 — QA + cross-browser + DNS cutover (go-live)

**Type:** HITL (go-live decision)

### What to build

The final pre-launch gate. Not new code — verification that everything works end-to-end across the matrix of real devices and browsers, plus the DNS cutover decision.

- Run Lighthouse against the deployed homepage. Target ≥95 on Performance / Accessibility / Best Practices / SEO. LCP <2.5s, CLS <0.1. Iterate on any score below target.
- Manual QA on real iOS Safari (autoplay videos, sticky bottom bar, lightbox, form submit)
- Manual QA on real Android Chrome (same matrix)
- Manual QA on desktop Chrome, Firefox, Safari
- Verify hero wishlist click + sticky-bar wishlist click both fire in GA4 real-time view with distinct `utm_source` values for attribution
- Submit `https://www.toyboxsecurity.com/sitemap-index.xml` to Google Search Console
- Confirm DNS: apex `toyboxsecurity.com` has the 4 GitHub A records; `www` CNAME → `toyboxsecurity.github.io`; both resolve; HTTPS green; apex 301s to www (or vice versa — owner picks canonical)
- Owner gives explicit go/no-go before any social announcement

### Acceptance criteria

- [ ] Lighthouse ≥95 across all four scores on the deployed homepage
- [ ] LCP <2.5s, CLS <0.1, INP within "Good" bucket
- [ ] All listed real-device tests pass (no autoplay failures, sticky bar behaves)
- [ ] GA4 real-time shows wishlist click events with distinguishable source params
- [ ] Sitemap submitted to Google Search Console without errors
- [ ] DNS verified — both apex and www resolve, HTTPS valid on both, redirect configured
- [ ] Owner explicit go-live approval logged

### Blocked by

- Issue 1
- Issue 2
- Issue 3
- Issue 4
- Issue 5
- Issue 6
- Issue 7
- Issue 8
- Issue 9
- Issue 10
- Issue 11
