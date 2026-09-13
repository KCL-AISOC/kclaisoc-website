# Hero ticker marquee (saved from old homepage, commit 59ce162)

The scrolling strip under "Join the Society" that reads
Private Equity · Hedge Funds · Infrastructure · Real Assets · Private Credit · Venture Capital · King's College London · Founded 2026.

## What still exists on the latest main

- css/styles.css already has the `.hero-ticker*` rules (section "10b. Hero ticker marquee").
- js/main.js already has `initTicker()`, the scroll fade, and the call inside the
  `prefers-reduced-motion: no-preference` matchMedia block.
- Only the HTML markup was removed from index.html when the new "opening" hero replaced `.hero`.

So porting = paste the HTML in, then fix two small things (see "Porting notes").

## 1. HTML

Paste this as the LAST child inside the hero section, just before its closing `</section>`.
On the old site that was `<section class="hero">`; on the new site it is `<section class="opening">`.

```html
      <!-- Marquee ticker -->
      <div class="hero-ticker" aria-hidden="true">
        <div class="hero-ticker-track">
          <span class="hero-ticker-item">Private Equity</span>
          <span class="hero-ticker-item">Hedge Funds</span>
          <span class="hero-ticker-item">Infrastructure</span>
          <span class="hero-ticker-item">Real Assets</span>
          <span class="hero-ticker-item">Private Credit</span>
          <span class="hero-ticker-item">Venture Capital</span>
          <span class="hero-ticker-item">King's College London</span>
          <span class="hero-ticker-item">Founded 2026</span>
          <!-- duplicate for seamless loop -->
          <span class="hero-ticker-item">Private Equity</span>
          <span class="hero-ticker-item">Hedge Funds</span>
          <span class="hero-ticker-item">Infrastructure</span>
          <span class="hero-ticker-item">Real Assets</span>
          <span class="hero-ticker-item">Private Credit</span>
          <span class="hero-ticker-item">Venture Capital</span>
          <span class="hero-ticker-item">King's College London</span>
          <span class="hero-ticker-item">Founded 2026</span>
        </div>
      </div>
```

## 2. CSS (css/styles.css, already present on main)

```css
/* --------------------------------------------------------------------------
   10b. Hero ticker marquee (bottom of hero, before stats)
   -------------------------------------------------------------------------- */
.hero-ticker {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  overflow: hidden;
  border-top: 1px solid rgba(201, 169, 97, 0.12);
  z-index: 2;
  display: flex;
  align-items: center;
}

.hero-ticker-track {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  will-change: transform;
}

.hero-ticker-item {
  display: inline-flex;
  align-items: center;
  gap: 2.5rem;
  padding-inline: 2.5rem;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(201, 169, 97, 0.5);
}

.hero-ticker-item::before {
  content: '◆';
  font-size: 0.35rem;
  color: rgba(201, 169, 97, 0.3);
}
```

## 3. JS (js/main.js, already present on main)

Loop animation (GSAP, so it is not frozen by reduced-motion CSS or sticky touch states):

```js
  function initTicker() {
    var track = document.querySelector('.hero-ticker-track');
    if (!track) return;
    gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 32,
      repeat: -1,
    });
  }
```

Fade out as the hero scrolls away (inside initParallax):

```js
    /* Ticker fades out as hero leaves view */
    var ticker = document.querySelector('.hero-ticker');
    if (ticker) {
      gsap.to(ticker, {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: 0.5 },
      });
    }
```

Reduced-motion / stall safety net (inside init()):

```js
      var tk = document.querySelector('.hero-ticker');
      if (tk) gsap.set(tk, { clearProps: 'opacity' });
```

Call site (inside the `(prefers-reduced-motion: no-preference)` matchMedia block):

```js
      initTicker();
```

## Porting notes for the new "opening" hero

1. `.hero-ticker` is `position: absolute; bottom: 0`, so its parent needs
   `position: relative`. In css/editorial.css the `.opening` rule has `overflow: hidden`
   but no `position`. Add `position: relative;` to `.opening`, and give it enough
   bottom padding (about 36px, the ticker height) so the strip does not overlap the
   "Join the Society" button on mobile. The mobile override at the bottom of
   editorial.css sets `.opening { padding-bottom: 48px; }`, which is already enough there.

2. The scroll fade in main.js triggers on `.hero`, which no longer exists on the new
   homepage. Either change that selector to `.opening` or leave it: with no `.hero` element
   the fade simply never runs and the ticker stays visible until it scrolls out of view.
