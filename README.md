# Beef Roasters

Website for Beef Roasters, a small-batch coffee roaster in Olinda. *We roast coffee, not beef.*

Plain HTML/CSS/JS with no build step, served by GitHub Pages straight from the repo root.

## Pages
- `index.html` – home: menu, roast guide, gallery, visit/hours, about, FAQ, contact form
- `reviews.html` – customer reviews
- `merch.html` – merch preorders (cart saved in the browser, order sent as a pre-filled email)
- `404.html` – not-found page (paths assume the site lives at `/beefroasters/`)

## Placeholders to replace
| What | Where |
|---|---|
| Street address | `index.html`, Visit section |
| Opening hours | `SITE.hours` at the top of `script.js` (drives the hours table and the "Open now" badge) |
| Email address (contact form) | `SITE.email` in `script.js` |
| Phone, Instagram | `index.html`, Contact section |
| Map pin / directions link | `index.html`, Visit section (map iframe `marker=` and the Google Maps link) |
| Prices | `index.html`, Menu section |
| Merch prices, preorder dates, postage | `merch.html` (prices in each card's `data-price`), `POSTAGE` in `merch.js` |
| Reviews (Jeff, Rosemary, Tim Beef) | `reviews.html` and the quote on `index.html` |
| "Why Beef Roasters?" story | `index.html`, About section |

## "Who are we?" video
`media/who-we-are.mp4` (16:9, shown on larger screens) and `media/who-we-are-portrait.mp4` (4:5, shown on phones) are rendered from `media/src/who-we-are.html`, an HTML animation driven by a timeline. To change the wording or timing, edit that file and re-render:

```
node media/src/render.js            # both versions
node media/src/render.js portrait   # just the phone version
```

This needs Node with Playwright (Chromium) and ffmpeg. To preview in real time, serve the repo locally and open `media/src/who-we-are.html?play` (add `&portrait` for the phone layout).

## Merch images
`images/merch/*.jpg` are mockups: the Beef Roasters designs printed onto free stock photos of blank products from Unsplash (Unsplash License: free for commercial use, editing allowed, no attribution required). The sticker shot uses the café's own table photo. Base photos, by Unsplash photo ID:

| Image | Unsplash photo ID |
|---|---|
| tee | 1521572163474-6864f9cf17ab |
| mug | 1514228742587-6b1558fcca3d |
| tote | 1544816155-12df9643f363 |
| cap | 1588850561407-ed78c282e89b |
| beanie | 1510598969022-c4c6c5d05769 |
| cup sleeve | 1577937927133-66ef06acdf18 (original sleeve logo removed) |
| gift box | 1513885535751-8b9238bd345a |

Replace them with photos of the real samples when they arrive (same file names, square crops).

## Contact form
The form opens the visitor's email app with a pre-filled message to `SITE.email`. Nothing is sent from the site itself.

## Deploying
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → branch `main`, folder `/ (root)`.
