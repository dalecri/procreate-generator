# Iso Pattern Forge

A cozy, seeded generator of geometric line art made for colouring in Procreate (ColorDrop) or on paper.
Black lines on white, every region closed, same seed gives the same drawing every time.

**Live:** https://dalecri.github.io/procreate-generator/

## What it does

- **27 modes** across landforms, iso structures, top-down maps (incl. Laurentides topo), retro posters, ornament and tilings.
- **Seeded and shareable.** Everything lives in the URL (`?seed=…&mode=…`). Daily seed button. No `Math.random` in generation.
- **Detail:** Full, Simple or Kids. Simple and Kids drop decorative lines and tiny isolated shapes (never opening a region) and thicken lines.
- **Colour-by-number:** numbers in every coloured region plus a key on the plate, matched to the selected palette.
- **Exports:** PNG at 3x, transparent lines-only PNG (Procreate reference layer), SVG, Procreate `.swatches`.
- **Gallery and favourites**, favourites export/import as a `.json` file.
- **Books:** colouring-book PDF (Letter / A4, optional cover and numbers) and a zip of every favourite.
- **Pack kit:** themed 20 / 25 / 30 page packs, two listing mockups (flat-lay and grid) and draft Etsy listing text.

## iPad

- Open the live link in Safari, then Share → Add to Home Screen. It installs as an app and works offline after the first visit.
- On touch screens the secondary controls fold into a **Controls** drawer.
- Exports open the share sheet, so you can send a PNG straight to Procreate, Files or Photos.

## Develop

It is one self-contained `index.html` (vanilla JS, Space Mono from Google Fonts is the only external).

```sh
python3 -m http.server 8000   # then open http://localhost:8000
node tests/run.js             # geometry, closure and determinism regression
```

When you change the app, bump `VERSION` in `sw.js` so installed copies pick up the update.

## Deploy

Pushes to `main` run the tests and deploy to GitHub Pages through `.github/workflows/pages.yml`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
