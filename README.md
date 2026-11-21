# Beef Roasters

Website for Beef Roasters, a small-batch coffee roaster in Olinda. *We roast coffee, not beef.*

Plain HTML/CSS/JS with no build step, served by GitHub Pages straight from the repo root.

## Pages
- `index.html` – home: menu, roast guide, gallery, visit/hours, about, FAQ, contact form
- `reviews.html` – customer reviews
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
| Reviews (Jeff, Rosemary, Tim Beef) | `reviews.html` and the quote on `index.html` |
| "Why Beef Roasters?" story | `index.html`, About section |

## Contact form
The form opens the visitor's email app with a pre-filled message to `SITE.email`. Nothing is sent from the site itself.

## Deploying
Settings → Pages → Build and deployment → Source: **Deploy from a branch** → branch `main`, folder `/ (root)`.
