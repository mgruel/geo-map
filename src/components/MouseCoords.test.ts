import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import L from 'leaflet';
import MouseCoordsFixture from './MouseCoords.fixture.svelte';

describe('MouseCoords', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders an output container inside the map', () => {
        const { container } = render(MouseCoordsFixture);
        const root = container.querySelector('.leaflet-control-mouse-coords');
        const output = container.querySelector('.leaflet-control-mouse-coords__output');
        expect(root).toBeInTheDocument();
        expect(output).toBeInTheDocument();
        expect(root?.getAttribute('role')).toBe('status');
        expect(root?.getAttribute('aria-label')).toBe('Mouse coordinates');
    });

    it('initializes with the map center coordinates', () => {
        const { container } = render(MouseCoordsFixture);
        const output = container.querySelector<HTMLDivElement>('.leaflet-control-mouse-coords__output');
        expect(output?.textContent).toMatch(/^Mouse: 48\.594662, 8\.867683/);
    });

    it('updates the output when the mouse moves over the map', () => {
        const fireSpy = vi.spyOn(L.Map.prototype, 'fire');
        const { container } = render(MouseCoordsFixture);
        const mapInstance = fireSpy.mock.instances[0] as L.Map | undefined;
        expect(mapInstance).toBeDefined();

        mapInstance!.fire('mousemove', { latlng: L.latLng(12.345678, -45.678912) });

        const output = container.querySelector<HTMLDivElement>('.leaflet-control-mouse-coords__output');
        expect(output?.textContent).toContain('Mouse: 12.345678, -45.678912');
    });

    it('includes zoom when displayZoom is enabled (default in fixture)', () => {
        const { container } = render(MouseCoordsFixture);
        const output = container.querySelector<HTMLDivElement>('.leaflet-control-mouse-coords__output');
        expect(output?.textContent).toMatch(/- Zoom: \d+$/);
    });
});
