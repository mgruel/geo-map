import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import RootPage from './+page.svelte';

describe('RootPage', () => {
    it('mounts without errors', () => {
        const { container } = render(RootPage);
        expect(container.querySelector('.map')).toBeInTheDocument();
    });

    it('sets the document title', async () => {
        render(RootPage);
        expect(document.title).toBe('Gruel Maps');
    });

    it('renders the Leaflet control containers in the map', () => {
        const { container } = render(RootPage);
        expect(container.querySelector('.leaflet-control-attribution')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-scale')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-zoom')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-mouse-coords')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-jump-to')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-geo-search')).toBeInTheDocument();
    });
});
