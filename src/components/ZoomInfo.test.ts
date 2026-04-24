import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ZoomInfoFixture from './ZoomInfo.fixture.svelte';

describe('ZoomInfo', () => {
    it('renders an output container inside the map', () => {
        const { container } = render(ZoomInfoFixture);
        expect(container.querySelector('.leaflet-control-zoom-info')).toBeInTheDocument();
        expect(container.querySelector('.leaflet-control-zoom-info__output')).toBeInTheDocument();
    });

    it('initializes with the starting zoom level', () => {
        const { container } = render(ZoomInfoFixture);
        const output = container.querySelector<HTMLDivElement>('.leaflet-control-zoom-info__output');
        expect(output?.textContent).toBe('Zoom: 11');
    });
});
