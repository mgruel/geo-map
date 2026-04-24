// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isHttpError } from '@sveltejs/kit';

const envMock = vi.hoisted(() => ({ env: { PHOTON_URL: '' } }));
vi.mock('$env/dynamic/private', () => envMock);

import { GET } from './+server';

type RequestEvent = Parameters<typeof GET>[0];

async function invoke(
    params: Record<string, string>,
    fetchImpl: typeof fetch = vi.fn() as unknown as typeof fetch,
): Promise<Response> {
    const url = new URL('http://localhost/api/geocode');
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
    }
    const event = { url, fetch: fetchImpl } as unknown as RequestEvent;
    try {
        return (await GET(event)) as Response;
    } catch (err) {
        if (isHttpError(err)) {
            return new Response(JSON.stringify(err.body), { status: err.status });
        }
        throw err;
    }
}

describe('GET /api/geocode', () => {
    beforeEach(() => {
        envMock.env.PHOTON_URL = 'https://photon.example.com';
    });

    it('returns 500 when PHOTON_URL is missing', async () => {
        envMock.env.PHOTON_URL = '';
        const res = await invoke({ q: 'Berlin' });
        expect(res.status).toBe(500);
    });

    it('returns 400 when q is missing', async () => {
        const res = await invoke({});
        expect(res.status).toBe(400);
    });

    it('returns 400 when q is too short', async () => {
        const res = await invoke({ q: 'a' });
        expect(res.status).toBe(400);
    });

    it('returns 400 for invalid limit', async () => {
        expect((await invoke({ q: 'Berlin', limit: '0' })).status).toBe(400);
        expect((await invoke({ q: 'Berlin', limit: '11' })).status).toBe(400);
        expect((await invoke({ q: 'Berlin', limit: 'abc' })).status).toBe(400);
    });

    it('returns 400 for out-of-range lat/lon', async () => {
        expect((await invoke({ q: 'Berlin', lat: '91', lon: '0' })).status).toBe(400);
        expect((await invoke({ q: 'Berlin', lat: '0', lon: '181' })).status).toBe(400);
    });

    it('returns 502 when upstream responds with error status', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(new Response('nope', { status: 503 }));
        const res = await invoke({ q: 'Berlin' }, fetchImpl as unknown as typeof fetch);
        expect(res.status).toBe(502);
    });

    it('returns 502 when upstream fetch throws', async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error('ECONNREFUSED'));
        const res = await invoke({ q: 'Berlin' }, fetchImpl as unknown as typeof fetch);
        expect(res.status).toBe(502);
    });

    it('forwards the query and returns upstream JSON with cache header', async () => {
        const payload = { type: 'FeatureCollection', features: [] };
        const fetchImpl = vi.fn().mockResolvedValue(
            new Response(JSON.stringify(payload), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
        const res = await invoke(
            { q: 'Berlin', limit: '3' },
            fetchImpl as unknown as typeof fetch,
        );
        expect(res.status).toBe(200);
        expect(res.headers.get('Cache-Control')).toMatch(/max-age=60/);
        await expect(res.json()).resolves.toEqual(payload);

        const calledWith = fetchImpl.mock.calls[0][0] as URL;
        expect(calledWith.origin).toBe('https://photon.example.com');
        expect(calledWith.pathname).toBe('/api');
        expect(calledWith.searchParams.get('q')).toBe('Berlin');
        expect(calledWith.searchParams.get('limit')).toBe('3');
    });

    it('forwards lat/lon biasing when provided', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(
            new Response('{}', {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
        await invoke(
            { q: 'Berlin', lat: '52.5', lon: '13.4' },
            fetchImpl as unknown as typeof fetch,
        );
        const calledWith = fetchImpl.mock.calls[0][0] as URL;
        expect(calledWith.searchParams.get('lat')).toBe('52.5');
        expect(calledWith.searchParams.get('lon')).toBe('13.4');
    });

    it('strips trailing slashes from PHOTON_URL', async () => {
        envMock.env.PHOTON_URL = 'https://photon.example.com///';
        const fetchImpl = vi.fn().mockResolvedValue(
            new Response('{}', {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }),
        );
        await invoke({ q: 'Berlin' }, fetchImpl as unknown as typeof fetch);
        const calledWith = fetchImpl.mock.calls[0][0] as URL;
        expect(calledWith.href).toBe('https://photon.example.com/api?q=Berlin&limit=5');
    });
});
