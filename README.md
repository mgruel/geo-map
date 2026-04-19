# Geo Map with [Leaflet](https://leafletjs.com) and [Svelte](https://svelte.dev)

A SvelteKit application that renders an interactive Leaflet map with custom
controls (mouse coordinates, scale, zoom, attribution, and jump-to).

## Architecture

- **[SvelteKit](https://kit.svelte.dev) 2** with the [Node adapter](https://kit.svelte.dev/docs/adapter-node), using Svelte 5 runes.
- **[Leaflet](https://leafletjs.com) 1.9** for the map, wrapped in a small set of Svelte components under `src/components/`:
  - `Map.svelte` — owns the Leaflet `L.Map` instance and exposes it via Svelte context.
  - `TileLayer.svelte` — registers the tile providers (OpenStreetMap + CyclOSM).
  - `AttributionControl`, `ScaleControl`, `ZoomControl` — thin wrappers around built-in Leaflet controls.
  - `MouseCoords`, `Coordinates`, `ZoomInfo`, `JumpTo` — custom Leaflet controls implemented with `L.Control.extend`. Type augmentations live in `src/leaflet.d.ts`.
- Server-side rendering is disabled for the map route (`src/routes/+page.ts` sets `ssr = false`) because Leaflet requires a browser environment.

## Developing

```bash
npm install  # install dependencies
npm run dev  # start the dev server at http://localhost:5173
```

Useful scripts:

- `npm run check` — run `svelte-check` for Svelte/TypeScript type errors.
- `npm run lint` — run ESLint (flat config in `eslint.config.js`).
- `npm test` — run Vitest with coverage.
- `npm run all` — build + test + lint in one pass.

## Building

```bash
npm run build    # produce the production bundle in build/
npm run preview  # serve the production build locally
```

The `@sveltejs/adapter-node` output in `build/` is a self-contained Node.js
server entry point.

## Deployment

A multi-stage `Dockerfile` is provided:

```bash
docker build -t geo-map .
docker run -p 3000:3000 geo-map
```

The build stage runs lint and tests; the production stage installs only
runtime dependencies and starts the adapter-node server. A `HEALTHCHECK` on
port 3000 is included.

## CI

GitHub Actions (`.github/workflows/node.js.yml`) runs `npm ci`, `npm run lint`,
`npm test`, and `npm run build` on every push and pull request against a
matrix of Node.js 20.x, 22.x, and 24.x.
