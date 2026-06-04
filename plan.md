# ToyBox Security — Astro Rebuild Plan

## Context

`toyboxsecurity.com` is the marketing site for a Steam game (app ID `2121550`) that has not yet released. The current site is a 2014-era Jekyll + Bootstrap 3 + jQuery 1.11 + Font Awesome 4 template with a half-finished pixelnest/presskit.html-generated press kit. The homepage stacks three iframes (YouTube trailer, Steam widget, SendInBlue signup) in the hero with no clear visual hierarchy. The press kit contains template placeholders (pizza/burger images, "released on DATE", a literal `UA-42424242-0` analytics tag). Owner has no game-website experience and asked to throw it all away and rebuild it modern.

The site exists for **one reason**: drive Steam wishlist conversions. Every design choice must serve that funnel. We are doing a from-scratch Astro rebuild rather than incremental cleanup because the existing stack is unsalvageable and a clean slate is faster than untangling Bootstrap 3.

User decisions already made:
- Press kit: single integrated `/press` page (no studio-vs-game two-tier split).
- Devblog: yes — Astro content collection for `/news`.
- Newsletter signup: keep, but render as a styled native HTML form posting to the existing SendInBlue endpoint (no iframe).
- Hosting: GitHub Pages from this repo (`toyboxsecurity.github.io`), custom domain `www.toyboxsecurity.com` (CNAME confirmed).

Visual reference targets: Cult of the Lamb, Untitled Goose Game, Hello Neighbor — warm/dark suburban-comedy energy, chunky display type, clear conversion CTA.

---

## Recommended approach

Pure-static Astro v5 site, zero client framework. Tailwind CSS v4 via the Vite plugin. Astro content collection for `/news`. Deployed to GitHub Pages via the official `withastro/action`. Every interactive element (sticky CTA, mobile menu, YouTube lite-embed, video lazy-load) is sub-2KB vanilla `<script>` — no React/Vue/Svelte. The site is 6 page templates total; a framework would only hurt LCP, which is the metric wishlist conversion correlates with.

### Project structure

```
toyboxsecurity.github.io/
├── .github/workflows/deploy.yml
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── CNAME                     # MUST contain "www.toyboxsecurity.com"
│   ├── favicon.ico, favicon.svg, apple-touch-icon.png
│   ├── robots.txt
│   ├── press/                    # downloadable zips
│   ├── og/default-og.jpg         # 1200x630 social card
│   └── videos/                   # re-encoded feature loops (MP4 + WebM)
├── scripts/encode-gifs.sh        # ffmpeg one-shot, kept for reproducibility
├── src/
│   ├── assets/                   # images that go through Astro's image pipeline
│   │   ├── logos/, screenshots/, backgrounds/, press/
│   ├── components/
│   │   ├── layout/   (Header, Footer, Nav, StickyWishlistBar)
│   │   ├── home/     (Hero, TrailerSection, FeatureGrid, FeatureCard,
│   │   │              ScreenshotShowcase, SteamWidget, NewsletterSignup,
│   │   │              LatestNewsTeaser, WishlistCalloutBand)
│   │   ├── press/    (Factsheet, DownloadCard, ScreenshotGallery)
│   │   ├── ui/       (Button, WishlistButton, SocialLinks,
│   │   │              VideoLoop, YouTubeEmbed, Section)
│   │   └── seo/BaseHead.astro    # all meta, OG, Twitter, GA4, JSON-LD
│   ├── content/
│   │   ├── config.ts             # news collection schema (zod)
│   │   └── news/*.md
│   ├── data/features.ts          # typed const array, not a collection
│   ├── data/screenshots.ts
│   ├── layouts/    (BaseLayout, PageLayout, PostLayout)
│   ├── pages/      (index.astro, press.astro, news/index.astro,
│   │                news/[...slug].astro, 404.astro, rss.xml.js)
│   ├── styles/     (global.css with @theme block, fonts.css)
│   └── consts.ts   # SITE_URL, STEAM_APP_ID, STEAM_WISHLIST_URL,
│                   # social URLs, GA_ID, SENDINBLUE_ACTION_URL
```

**Content collection:** exactly one — `news`. Schema (`src/content/config.ts`):
```
title: z.string()
pubDate: z.coerce.date()
description: z.string().max(160)
heroImage: image().optional()   // use the image() helper, not z.string()
draft: z.boolean().default(false)
tags: z.array(z.string()).optional()
```
Filter `draft === true` in production builds. **Do not** make collections for screenshots/features — they're static and live as typed `const` arrays in `src/data/`.

### Pages at launch

| Path | Purpose |
| --- | --- |
| `/` | Homepage — hero, trailer, features, screenshots, Steam widget, newsletter, latest news |
| `/press` | Single anchor-linked press kit (factsheet, description, history, videos, screenshots, logos, downloads, about, contact) |
| `/news` | Devblog index, reverse-chrono |
| `/news/[slug]` | Individual post pages |
| `/404` | Branded 404 with a wishlist CTA — don't waste the page |
| `/rss.xml` | RSS feed for `/news` via `@astrojs/rss` |

Explicitly **not** at launch: separate About / Team / Contact / Blog-tag pages. Contact lives on `/press`. Tags deferred until 20+ posts.

### Homepage section design (top to bottom)

**Above the fold (100vh hero):**
- Full-bleed darkened background built from `ToyboxTrailerPromoBackground.png` with a top-transparent → bottom-60%-black gradient overlay (guarantees text contrast).
- `ToyBoxSecurityLogo.png` as H1 (image, with alt text — preserve the wordmark, do not retype it).
- One-sentence tagline. Suggested seed: *"A multiplayer trap-em-up where kids defend the house and burglars try to steal everything that isn't nailed down."*
- **Primary CTA:** large Steam-green "Wishlist on Steam" button (icon + text), ~320px wide desktop, full-width mobile, with hover lift and subtle pulse. Steam green is reserved for THIS button only — never recolor it; players recognize it.
- **Secondary CTA:** ghost "Watch Trailer" button that smooth-scrolls to the trailer section and triggers muted autoplay.
- Tiny "Coming soon to Steam" subtext below buttons.
- Animated chevron-down suggesting scroll.

**Sticky CTA strategy** — yes, but smart, not duplicative:
- An `IntersectionObserver` sentinel `<div>` at the bottom of the hero toggles a sticky bar.
- Desktop (≥768px): slim 56px **top bar** slides in containing small logo + "Wishlist on Steam" button.
- Mobile (<768px): sticky **bottom bar** instead — thumb-reachable, doesn't fight OS chrome.
- Never visible simultaneously with the in-hero button.

**Below the fold, in order:**
1. **Trailer section** — lite YouTube facade (self-hosted poster + play button; iframe swapped in on click) for video ID `krRiriRHjYE`. Saves 500KB+ of YouTube player JS from initial load.
2. **"What is ToyBox Security?"** — one polished paragraph, sets genre/mood.
3. **Feature grid** — 6-8 cards (2-col mobile / 3-col desktop). Each: looping `<video>` (re-encoded from existing GIFs), feature title, 1-2 sentence blurb. Seed copy from `_posts/2014-09-21-services-*.markdown` but rewrite hard; the original is 12 years old.
4. **Screenshot showcase** — masonry/grid of all 11 screenshots with click-to-lightbox; on mobile a `scroll-snap-type: x mandatory` swipe carousel (no library).
5. **Wishlist callout band** — full-width colored band with huge text + huge wishlist button. Second visual peak of the page.
6. **Steam widget** — desktop only. The official iframe is 646×190 native and doesn't scale; on mobile (<768px) hide it and show a styled wishlist card instead.
7. **Newsletter signup** — native form, see SendInBlue notes below.
8. **Latest news teaser** — 3 most recent `news` posts pulled at build time, with link to `/news`.
9. **Footer + social** — Twitter, TikTok, YouTube, link to `/press`.

### Styling: Tailwind v4

Tailwind CSS v4 via `@tailwindcss/vite` (the integration package is being deprecated; use the Vite plugin path). Config-as-CSS through an `@theme` block in `global.css`. Compose with Astro's scoped `<style>` for the rare bespoke gradient/animation. This earns its keep over vanilla CSS modules (spacing/color/type scale come pre-tuned) and over UnoCSS (better IDE story for solo-dev velocity).

**Type pairing — self-hosted via `@fontsource/*`, no Google Fonts CDN:**
- Display: **Bagel Fat One** (Google Fonts, SIL OFL). Chunky, rounded, playful but readable. Fallbacks if unavailable: Lilita One or Titan One.
- UI/body: **Inter** (variable). Boring on purpose — let the display font + game art carry personality.
- Subset to Latin-only; preload display 400 + Inter 400 above the fold; lazy-load Inter 700.

**Color palette (5 colors, finalize after seeing trailer's grade):**
- Background dark `#1A1410` (warm near-black — "house at night")
- Background light `#F4E8D8` (cream — "toy room")
- **Steam green `#5DA84B` — reserved for the Wishlist CTA only**
- Brand accent `#FF5C39` (alarm-orange/construction-cone — danger/heist) for hover states, links, accent strokes
- Secondary accent `#FFC93C` (school-bus yellow — toy) for badges/highlights

### Performance + SEO

- **Images:** anything under `src/assets/` rendered through Astro's `<Image>` (or `<Picture>`) → auto AVIF + WebP + responsive srcset + content hashing. Explicit `width`+`height` to prevent CLS. `loading="eager"` + `fetchpriority="high"` on the hero logo only; everything else lazy.
- **Trailer:** lite-YouTube facade with self-hosted poster (download `https://i.ytimg.com/vi/krRiriRHjYE/maxresdefault.jpg` into `src/assets/` so Astro processes it).
- **GIFs → video:** re-encode every GIF in `img/services/` to MP4 (H.264 baseline, yuv420p) + WebM (VP9). Expected payload reduction 15-30MB → under 2MB. Render as `<video autoplay muted loop playsinline preload="metadata">` with both `<source>` tags. iOS Safari needs all three of `muted`/`autoplay`/`playsinline` or it silently refuses. Lazy-load via `IntersectionObserver` setting `src` on `<source>` when entering viewport (Astro doesn't lazy-load `<video>` natively).
- **Meta:** single `BaseHead.astro` with OG (`og:title/description/image/type/url`), Twitter Card (`summary_large_image`, `twitter:site=@ToyBoxSecurity`), with per-page prop overrides. 1200×630 social card at `public/og/default-og.jpg`.
- **JSON-LD:** `VideoGame` schema on homepage with `Trailer` `VideoObject` nested. Helps Google's Game knowledge panel.
- **Sitemap:** `@astrojs/sitemap` integration, one line of config.
- **robots.txt:** `public/robots.txt`, allow-all, reference sitemap URL.
- **Analytics:** GA4 `G-4W57JFFTPL`, gated by `import.meta.env.PROD` so dev doesn't pollute.
- **Lighthouse target:** 95+ on all four scores.

### Deployment — GitHub Pages via Actions

This repo is the **user/org pages repo** (`toyboxsecurity.github.io`), so the site deploys to the apex and base is `/`, **not** `/repo-name/`.

`astro.config.mjs` essentials:
- `site: 'https://www.toyboxsecurity.com'` (must match the CNAME exactly; sitemap + canonical URLs depend on it)
- `base: '/'` (explicit)
- `trailingSlash: 'ignore'`
- `output: 'static'`
- Integrations: `@astrojs/sitemap`, `@astrojs/mdx` (so news posts can embed components), Tailwind via `@tailwindcss/vite`

`.github/workflows/deploy.yml` shape:
- Triggers: `push` to `main`, `workflow_dispatch`
- Permissions: `pages: write`, `id-token: write`, `contents: read`
- Concurrency group `pages` to prevent stacked deploys
- Job 1: checkout → setup Node 20 → `npm ci` → `npm run build` → `withastro/action@v3`
- Job 2: `actions/deploy-pages@v4`
- Environment: `github-pages`

Repo Settings → Pages → Source: **GitHub Actions** (not branch-deploy). This is the #1 footgun.

### Asset migration

**Move to `src/assets/` (gets image pipeline):**
- `img/ToyBoxSecurityLogo.png` → `src/assets/logos/logo.png`
- `img/ToyboxTrailerPromoBackground.png` → `src/assets/backgrounds/trailer-promo-bg.png`
- `img/ToyboxTrailerPromo.png` → `src/assets/backgrounds/trailer-promo.png`
- `product/images/screenshot-01..11.png` → `src/assets/screenshots/`
- `product/images/logo-0toyboxsecurity.png`, `logo-1toyboxsecurity-alt.png`, `logo-icon.png` → `src/assets/logos/`
- `product/images/header.png` → `src/assets/press/header.png`

**Move to `public/` (served as-is):**
- `CNAME` → `public/CNAME` (verbatim `www.toyboxsecurity.com`, no extra whitespace)
- `product/images/favicon.ico` → `public/favicon.ico` (and generate `favicon.svg` + 180×180 `apple-touch-icon.png`)
- `product/images/images.zip` → `public/press/toyboxsecurity-screenshots.zip`
- `product/images/logo.zip` → `public/press/toyboxsecurity-logos.zip`
- Re-encoded videos → `public/videos/`

**Re-encode (non-negotiable) — write `scripts/encode-gifs.sh`:**
- Sources: `img/services/blowtorch.gif`, `robberGameplay.gif`, `shoes.gif`, `slingShot.gif`, `slipOnCars.gif`, `vase.gif`, `multiplayer.gif`
- For each: produce `.mp4` (H.264 baseline, yuv420p, faststart) and `.webm` (VP9)
- Example: `ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4`

**Extract copy before deleting `_posts/`:** pull feature blurbs from the three `services-*.markdown` files into `src/data/features.ts` and rewrite. Pull description/history/features list from `product/index.html` into `src/data/press.ts`.

**Delete entirely:** `_layouts/`, `_includes/`, `_posts/`, `_config.yml`, `Gemfile`, `Gemfile.lock`, `.jekyll-cache/`, `presskit.html`, `presskit/`, `product/`, `css/`, `font-awesome-4.1.0/`, `fonts/`, `js/`, `.thumb.jpg` files, `img/services/dog.png`+`ipad.png`+`phones.png`, `img/banner-bg.jpg`+`intro-bg.jpg`+`screenshot.png`, `product/images/burger-*.jpg`+`header.jpg`+`pizza-*`.

### Pitfalls

- **CNAME preservation** — biggest single risk. `public/CNAME` MUST exist verbatim as `www.toyboxsecurity.com`. If missing from the build artifact, the next deploy strips the custom domain and HTTPS cert re-provisioning takes up to an hour.
- **GitHub Pages source setting** — must be "GitHub Actions" not "Deploy from a branch". Easy to overlook.
- **SendInBlue/Brevo native form** — three real issues:
  1. CORS: Brevo's `sibforms.com/serve/...` returns a 302 redirect on success. Either accept it as a real `<form action="..." method="POST">` (page navigates to Brevo thank-you — uglier but bulletproof), or `fetch(..., { mode: 'no-cors', credentials: 'omit' })` and assume success on resolution. **Recommendation:** build the real-form path first (zero-JS, works always), then progressively enhance with no-cors fetch for inline success message.
  2. Hidden fields: the existing iframe posts hidden inputs (locale, list-ID, honeypot `email_address_check`). Open the iframe's source in devtools and copy ALL hidden inputs verbatim — missing fields silently drop submissions.
  3. Honeypot: keep `email_address_check` (or whatever its name is) styled `display:none` — Brevo expects it empty.
- **Steam widget iframe** — 646×190 native, does not scale, overflows on mobile. Hide on `<768px` and replace with a styled wishlist card.
- **Astro `<Image>` with remote sources** — needs `image.domains`/`image.remotePatterns` config. Self-host the YouTube poster to dodge this.
- **iOS Safari video autoplay** — all three required: `muted`, `autoplay`, `playsinline`. Plus `preload="metadata"` not `auto`.
- **GA4 placement** — inject in `<head>` via dedicated component, gated by `import.meta.env.PROD`.
- **Tailwind v4 + Astro** — use `@tailwindcss/vite`, not the older `@astrojs/tailwind` integration.
- **Content collection schema** — `image()` helper not `z.string()` for `heroImage`. `z.coerce.date()` for `pubDate`. Don't put dates in filenames (Jekyll-style); use frontmatter.
- **Trailing slashes + sitemap** — `astro.config.mjs` `site` must match canonical URL exactly. Mismatch causes Google to index duplicates.
- **Steam wishlist URL** — canonical is `https://store.steampowered.com/app/2121550/`. Don't use shorteners (Steam attribution breaks). UTM params OK (`?utm_source=site&utm_medium=hero_cta`) but Steam strips most query strings on landing.

### Critical files to be created

- `astro.config.mjs` — site URL, integrations, Vite plugin config
- `.github/workflows/deploy.yml` — Pages-via-Actions pipeline
- `public/CNAME` — verbatim `www.toyboxsecurity.com` (preserves custom domain across deploys)
- `src/pages/index.astro` — the homepage; carries 80% of the value
- `src/components/ui/WishlistButton.astro` — canonical CTA, reused on every page and in the sticky bar
- `src/components/layout/StickyWishlistBar.astro` — IntersectionObserver-driven sticky bar (top on desktop, bottom on mobile)
- `src/components/seo/BaseHead.astro` — all meta/OG/Twitter/GA4/JSON-LD in one place
- `src/content/config.ts` — `news` collection schema
- `src/consts.ts` — single source of truth for Steam app ID, social URLs, GA4 ID, SendInBlue action URL
- `scripts/encode-gifs.sh` — ffmpeg reproducible re-encode

For pages/components that follow the same pattern (each news post page, each feature card, each screenshot tile), build the template once — they don't need individual planning.

---

## Order of execution

Each step is a shippable increment.

1. **Scaffold** — `npm create astro@latest` minimal template, add Tailwind v4 + sitemap + MDX, configure `astro.config.mjs`, fill `src/consts.ts`. Verify `dev` + `build`.
2. **Deploy pipeline** — write `deploy.yml`, switch Pages source to "GitHub Actions", drop `public/CNAME`, push a "Hello World" `index.astro`, verify the deploy lands at `www.toyboxsecurity.com`. **Do this before building anything visual** — debugging deploy on a blank site is 10× easier than after components exist.
3. **Layout primitives** — `BaseLayout`, `PageLayout`, `Header`, `Footer`, `BaseHead`, `Button`, `WishlistButton`, `Section`, `SocialLinks`. Self-host fonts. Define palette + type scale in `@theme`. Wireframe quality is fine here.
4. **Asset migration** — run `scripts/encode-gifs.sh`, move screenshots/logos into `src/assets/`, move zips/CNAME/favicon into `public/`, delete Jekyll detritus. One big commit so git history is clean.
5. **Homepage hero + sticky CTA** — pixel-perfect. Verify sticky toggle on real mobile.
6. **Trailer + feature grid** — lite-YT-embed component, `VideoLoop` component, 6-8 feature cards.
7. **Screenshot showcase + Steam widget + newsletter** — lightbox, marquee, widget responsive wrapper, native SendInBlue form. Test newsletter form against the real Brevo endpoint with a throwaway email.
8. **Press page** — single anchor-linked page, mostly text + downloads + reuses screenshot gallery.
9. **News collection + index + post template + RSS** — define schema, write one placeholder post, build `/news` + `/news/[...slug]`.
10. **404, OG image, JSON-LD, robots, sitemap verification** — polish.
11. **Lighthouse + manual QA** — real iOS Safari, real Android Chrome, desktop Chrome/Firefox/Safari. Verify wishlist click fires in GA4. Submit sitemap to Search Console.
12. **DNS cutover + go-live** — confirm www and apex both resolve, HTTPS valid, redirects work.

---

## Verification

End-to-end check before declaring done:

- **Local:** `npm run build && npm run preview` — site renders, no console errors, all images optimized to AVIF/WebP, all videos play (test in Chrome DevTools mobile sim).
- **Deploy:** GitHub Actions run is green, artifact uploaded, `actions/deploy-pages` succeeded. Visit `https://www.toyboxsecurity.com` — site loads, custom domain valid, HTTPS green.
- **Lighthouse:** run on the deployed homepage. Target ≥95 on Performance / Accessibility / Best Practices / SEO. LCP <2.5s, CLS <0.1.
- **Wishlist CTA:** click in hero → opens `store.steampowered.com/app/2121550/` in new tab. Scroll past hero → sticky bar appears (top on desktop, bottom on mobile) → click works. GA4 real-time view shows the click event.
- **Newsletter form:** submit a throwaway email → confirmation arrives in inbox → entry appears in Brevo dashboard.
- **Trailer:** click play → real YouTube iframe loads → video plays.
- **Feature videos:** scroll into view → all 6-8 loops play silently on desktop and iOS Safari.
- **Screenshot lightbox:** click any thumbnail → opens at full size → ESC closes.
- **Press page:** every anchor link in the nav scrolls to the right section; zip downloads work; logo previews render.
- **News:** create a draft post, verify it does NOT appear in production build; flip `draft: false`, verify it appears at `/news` index AND `/news/[slug]`. `/rss.xml` validates.
- **404:** visit `/does-not-exist` → branded 404 page with a wishlist CTA renders.
- **Meta:** paste the homepage URL into Twitter/Discord — preview card shows the OG image, title, description correctly.
- **Cross-browser:** real iOS Safari (autoplay video, sticky bottom bar), Android Chrome (autoplay video, sticky bottom bar), desktop Chrome/Firefox/Safari.
