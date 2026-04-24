import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import CoordinatesFixture from './Coordinates.fixture.svelte';

describe('Coordinates', () => {
    it('renders an output container inside the map', () => {
        const { container } = render(CoordinatesFixture);
        const root = container.querySelector('.leaflet-control-coords');
        expect(root).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-coords__output')).toBeInTheDocument();
        expect(root?.getAttribute('role')).toBe('status');
        expect(root?.getAttribute('aria-label')).toBe('Map center coordinates');
    });

    it('initializes with the map center coordinates', () => {
        const { container } = render(CoordinatesFixture);
        const output = container.querySelector<HTMLDivElement>('.leaflet-control-coords__output');
        expect(output?.textContent).toMatch(/^Center: 48\.594662, 8\.867683$/);
    });
});
