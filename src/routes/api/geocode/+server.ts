import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const UPSTREAM_TIMEOUT_MS = 5_000;
const MIN_QUERY_LENGTH = 2;
const MAX_LIMIT = 10;
const DEFAULT_LIMIT = 5;

export const GET: RequestHandler = async ({ url, fetch }) => {
    const photonBase = env.PHOTON_URL?.replace(/\/+$/, '');
    if (!photonBase) {
        error(500, 'PHOTON_URL is not configured');
    }

    const q = url.searchParams.get('q')?.trim() ?? '';
    if (q.length < MIN_QUERY_LENGTH) {
        error(400, `query parameter "q" must be at least ${MIN_QUERY_LENGTH} characters`);
    }

    const limitParam = url.searchParams.get('limit');
    const limit = limitParam === null ? DEFAULT_LIMIT : Number.parseInt(limitParam, 10);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        error(400, `"limit" must be an integer between 1 and ${MAX_LIMIT}`);
    }

    const upstream = new URL(`${photonBase}/api`);
    upstream.searchParams.set('q', q);
    upstream.searchParams.set('limit', String(limit));

    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');
    if (lat !== null && lon !== null) {
        const latNum = Number.parseFloat(lat);
        const lonNum = Number.parseFloat(lon);
        const validLat = Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
        const validLon = Number.isFinite(lonNum) && lonNum >= -180 && lonNum <= 180;
        if (!validLat || !validLon) {
            error(400, '"lat" and "lon" must be finite numbers within valid bounds');
        }
        upstream.searchParams.set('lat', String(latNum));
        upstream.searchParams.set('lon', String(lonNum));
    }

    let upstreamResponse: Response;
    try {
        upstreamResponse = await fetch(upstream, {
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            headers: { Accept: 'application/json' },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        error(502, `geocoder upstream unreachable: ${message}`);
    }

    if (!upstreamResponse.ok) {
        error(502, `geocoder upstream returned ${upstreamResponse.status}`);
    }

    const data = await upstreamResponse.json();
    return json(data, {
        headers: { 'Cache-Control': 'public, max-age=60' },
    });
};
