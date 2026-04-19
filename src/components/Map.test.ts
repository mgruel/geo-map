import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import Map from './Map.svelte';

describe('Map', () => {
    it('renders a map container div', () => {
        const { container } = render(Map);
        const mapDiv = container.querySelector('.map');
        expect(mapDiv).toBeInTheDocument();
    });

    it('initializes a Leaflet map on mount', async () => {
        const mapSpy = vi.spyOn(L, 'map');
        render(Map);
        expect(mapSpy).toHaveBeenCalledOnce();
        const [, options] = mapSpy.mock.calls[0];
        expect(options).toMatchObject({
            center: [48.594662, 8.867683],
            zoom: 11,
            minZoom: 7,
            zoomControl: false,
            attributionControl: false
        });
        mapSpy.mockRestore();
    });

    it('tears down the Leaflet map on unmount', () => {
        const removeSpy = vi.spyOn(L.Map.prototype, 'remove');
        const { unmount } = render(Map);
        unmount();
        expect(removeSpy).toHaveBeenCalled();
        removeSpy.mockRestore();
    });
});
