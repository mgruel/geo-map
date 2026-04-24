import { render } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import GeoSearchFixture from './GeoSearch.fixture.svelte';

interface MockFeature {
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: Record<string, string | number>;
}

function mockFeature(name: string, lat: number, lon: number, extra: Record<string, string> = {}): MockFeature {
    return {
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: { name, ...extra },
    };
}

function jsonResponse(features: MockFeature[]): Response {
    return new Response(JSON.stringify({ features }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}

function getInput(container: HTMLElement): HTMLInputElement {
    const input = container.querySelector<HTMLInputElement>('.leaflet-control-geo-search__input');
    if (!input) throw new Error('GeoSearch input not found');
    return input;
}

function getListbox(container: HTMLElement): HTMLUListElement {
    const listbox = container.querySelector<HTMLUListElement>('.leaflet-control-geo-search__listbox');
    if (!listbox) throw new Error('GeoSearch listbox not found');
    return listbox;
}

function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

function pressKey(input: HTMLInputElement, key: string) {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('GeoSearch', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.useFakeTimers();
        fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('renders an input and a hidden listbox with correct a11y attributes', () => {
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        const listbox = getListbox(container);
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(input.getAttribute('aria-controls')).toBe(listbox.id);
        expect(input.getAttribute('aria-autocomplete')).toBe('list');
        expect(listbox.getAttribute('role')).toBe('listbox');
        expect(listbox.hidden).toBe(true);
    });

    it('does not fetch when the query is below the minimum length', async () => {
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'a');
        await vi.advanceTimersByTimeAsync(500);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('fetches with debounced input and forwards map center as bias', async () => {
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        expect(fetchMock).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(300);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [calledUrl] = fetchMock.mock.calls[0];
        expect(calledUrl).toMatch(/^\/api\/geocode\?/);
        const params = new URL(calledUrl, 'http://localhost').searchParams;
        expect(params.get('q')).toBe('Ber');
        expect(params.get('limit')).toBe('5');
        expect(params.get('lat')).toBe('48.594662');
        expect(params.get('lon')).toBe('8.867683');
    });

    it('debounces rapid keystrokes into a single request', async () => {
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Be');
        await vi.advanceTimersByTimeAsync(100);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(100);
        type(input, 'Berl');
        await vi.advanceTimersByTimeAsync(300);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const params = new URL(fetchMock.mock.calls[0][0], 'http://localhost').searchParams;
        expect(params.get('q')).toBe('Berl');
    });

    it('renders results as listbox options', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse([
                mockFeature('Berlin', 52.52, 13.405, { country: 'Germany' }),
                mockFeature('Bern', 46.948, 7.4474, { country: 'Switzerland' }),
            ]),
        );
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(false);
        });
        const options = container.querySelectorAll('.leaflet-control-geo-search__option');
        expect(options).toHaveLength(2);
        expect(options[0].textContent).toBe('Berlin, Germany');
        expect(options[1].textContent).toBe('Bern, Switzerland');
        expect(input.getAttribute('aria-expanded')).toBe('true');
    });

    it('hides the listbox when a search returns no results', async () => {
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Zzz');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(true);
        });
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('flies to the clicked result', async () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        fetchMock.mockResolvedValue(
            jsonResponse([mockFeature('Berlin', 52.52, 13.405, { country: 'Germany' })]),
        );
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(false);
        });
        const option = container.querySelector<HTMLLIElement>('.leaflet-control-geo-search__option');
        option?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(flySpy).toHaveBeenCalledTimes(1);
        expect(flySpy.mock.calls[0][0]).toEqual([52.52, 13.405]);
    });

    it('selects the first result on Enter when no option is active', async () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        fetchMock.mockResolvedValue(
            jsonResponse([
                mockFeature('Berlin', 52.52, 13.405),
                mockFeature('Bern', 46.948, 7.4474),
            ]),
        );
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(false);
        });
        pressKey(input, 'Enter');
        expect(flySpy).toHaveBeenCalledWith([52.52, 13.405], expect.any(Number), expect.any(Object));
    });

    it('navigates options with ArrowDown/ArrowUp and selects the active one on Enter', async () => {
        const flySpy = vi.spyOn(L.Map.prototype, 'flyTo').mockReturnThis();
        fetchMock.mockResolvedValue(
            jsonResponse([
                mockFeature('Berlin', 52.52, 13.405),
                mockFeature('Bern', 46.948, 7.4474),
            ]),
        );
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(false);
        });
        pressKey(input, 'ArrowDown');
        pressKey(input, 'ArrowDown');
        const options = container.querySelectorAll('.leaflet-control-geo-search__option');
        expect(options[1].getAttribute('aria-selected')).toBe('true');
        pressKey(input, 'Enter');
        expect(flySpy.mock.calls[0][0]).toEqual([46.948, 7.4474]);
    });

    it('closes the listbox on Escape', async () => {
        fetchMock.mockResolvedValue(
            jsonResponse([mockFeature('Berlin', 52.52, 13.405)]),
        );
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(getListbox(container).hidden).toBe(false);
        });
        pressKey(input, 'Escape');
        expect(getListbox(container).hidden).toBe(true);
        expect(input.getAttribute('aria-expanded')).toBe('false');
    });

    it('falls back silently when the upstream returns an error status', async () => {
        fetchMock.mockResolvedValue(new Response('boom', { status: 502 }));
        const { container } = render(GeoSearchFixture);
        const input = getInput(container);
        type(input, 'Ber');
        await vi.advanceTimersByTimeAsync(300);
        await vi.waitFor(() => {
            expect(fetchMock).toHaveBeenCalled();
        });
        expect(getListbox(container).hidden).toBe(true);
    });
});
