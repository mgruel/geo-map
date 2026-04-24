# Geo Map with [Leaflet](https://leafletjs.com) and [Svelte](https://svelte.dev)

A SvelteKit application that renders an interactive Leaflet map with custom
controls (mouse coordinates, scale, zoom, attribution, jump-to, and place
search backed by a self-hosted [Photon](https://photon.komoot.io/) geocoder).

## Architecture

- **[SvelteKit](https://kit.svelte.dev) 2** with the [Node adapter](https://kit.svelte.dev/docs/adapter-node), using Svelte 5 runes.
- **[Leaflet](https://leafletjs.com) 1.9** for the map, wrapped in a small set of Svelte components under `src/components/`:
  - `Map.svelte` — owns the Leaflet `L.Map` instance and exposes it via Svelte context.
  - `TileLayer.svelte` — registers the tile providers (OpenStreetMap + CyclOSM).
  - `AttributionControl`, `ScaleControl`, `ZoomControl` — thin wrappers around built-in Leaflet controls.
  - `MouseCoords`, `Coordinates`, `ZoomInfo`, `JumpTo`, `GeoSearch` — custom Leaflet controls implemented with `L.Control.extend`. Type augmentations live in `src/leaflet.d.ts`.
- `src/routes/api/geocode/+server.ts` proxies search requests to the configured Photon instance so the upstream URL stays server-side and no CORS configuration is required on Photon itself.
- Server-side rendering is disabled for the map route (`src/routes/+page.ts` sets `ssr = false`) because Leaflet requires a browser environment. The `/api/geocode` endpoint still runs server-side.

## Configuration

The place-search control requires a [Photon](https://github.com/komoot/photon)
geocoder. Point the server at it via an environment variable read at runtime
(`$env/dynamic/private`):

| Variable     | Required | Description                                                             |
| ------------ | -------- | ----------------------------------------------------------------------- |
| `PHOTON_URL` | yes      | Base URL of the Photon instance, e.g. `https://photon.apps.example.com` |

If `PHOTON_URL` is unset, `/api/geocode` responds with HTTP 500 and the
search field simply shows no results — the rest of the map continues to work.

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
docker run -p 3000:3000 -e PHOTON_URL=https://photon.apps.example.com geo-map
```

The build stage runs lint and tests; the production stage installs only
runtime dependencies and starts the adapter-node server. A `HEALTHCHECK` on
port 3000 is included. `PHOTON_URL` is read at runtime, so the same image
can be pointed at different Photon instances without rebuilding.

## CI

GitHub Actions (`.github/workflows/node.js.yml`) runs `npm ci`, `npm run check`,
`npm run lint`, `npm test`, and `npm run build` on every push and pull
request against a matrix of Node.js 22.x and 24.x (both LTS). The
production Docker image is based on `node:24-alpine`.
