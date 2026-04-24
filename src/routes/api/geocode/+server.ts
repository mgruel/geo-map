import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const UPSTREAM_TIMEOUT_MS = 5_000;
const MIN_QUERY_LENGTH = 2;
const MAX_LIMIT = 10;
const DEFAULT_LIMIT = 5;
const MAX_LOGGED_Q_LENGTH = 200;

function emit(status: number, ctx: Record<string, unknown>): void {
    const line = JSON.stringify({ ...ctx, status });
    if (status >= 500) console.error(line);
    else if (status >= 400) console.warn(line);
    else console.log(line);
}

export const GET: RequestHandler = async (event) => {
    const { url, fetch } = event;
    const start = performance.now();
    const ctx: Record<string, unknown> = { evt: 'geocode' };
    try {
        ctx.ip = event.getClientAddress?.() ?? null;
    } catch {
        ctx.ip = null;
    }
    const finish = (status: number, extra: Record<string, unknown> = {}): void => {
        emit(status, {
            ...ctx,
            ...extra,
            duration_ms: Math.round(performance.now() - start),
        });
    };

    const photonBase = env.PHOTON_URL?.replace(/\/+$/, '');
    if (!photonBase) {
        finish(500, { reason: 'config_missing' });
        error(500, 'PHOTON_URL is not configured');
    }

    const q = url.searchParams.get('q')?.trim() ?? '';
    ctx.q = q.length > MAX_LOGGED_Q_LENGTH ? `${q.slice(0, MAX_LOGGED_Q_LENGTH)}…` : q;
    if (q.length < MIN_QUERY_LENGTH) {
        finish(400, { reason: 'validation', field: 'q' });
        error(400, `query parameter "q" must be at least ${MIN_QUERY_LENGTH} characters`);
    }

    const limitParam = url.searchParams.get('limit');
    const limit = limitParam === null ? DEFAULT_LIMIT : Number.parseInt(limitParam, 10);
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        finish(400, { reason: 'validation', field: 'limit', limit_raw: limitParam });
        error(400, `"limit" must be an integer between 1 and ${MAX_LIMIT}`);
    }
    ctx.limit = limit;

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
            finish(400, { reason: 'validation', field: 'latlon', lat_raw: lat, lon_raw: lon });
            error(400, '"lat" and "lon" must be finite numbers within valid bounds');
        }
        upstream.searchParams.set('lat', String(latNum));
        upstream.searchParams.set('lon', String(lonNum));
        ctx.lat = latNum;
        ctx.lon = lonNum;
    }

    let upstreamResponse: Response;
    try {
        upstreamResponse = await fetch(upstream, {
            signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
            headers: { Accept: 'application/json' },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'unknown error';
        finish(502, { reason: 'upstream_unreachable', error: message });
        error(502, `geocoder upstream unreachable: ${message}`);
    }

    if (!upstreamResponse.ok) {
        finish(502, { reason: 'upstream_error', upstream_status: upstreamResponse.status });
        error(502, `geocoder upstream returned ${upstreamResponse.status}`);
    }

    const data = await upstreamResponse.json();
    const features = (data as { features?: unknown[] })?.features;
    finish(200, {
        upstream_status: upstreamResponse.status,
        results: Array.isArray(features) ? features.length : null,
    });
    return json(data, {
        headers: { 'Cache-Control': 'public, max-age=60' },
    });
};
