# Songify

Vue 3 + Vite frontend, deployed to GitHub Pages.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages.

One-time setup in the repo: **Settings → Pages → Build and deployment →
Source: GitHub Actions**.

The Vite `base` is set from the repo name at build time (`BASE_PATH`), so the
site works at `https://<owner>.github.io/<repo>/`. Locally `base` defaults to
`/Songify/` — change the fallback in `vite.config.js` if the repo is renamed.

> GitHub Pages on a **private** repository requires a paid plan (Pro, Team, or
> Enterprise). On a free account the repo must be public for Pages to publish.
