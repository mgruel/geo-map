import { render } from '@testing-library/svelte';
import { describe, it } from 'vitest';
import Map from './Map.svelte';

describe('Map', () => {
	it('should render without properties', async () => {
		render(Map);
	});
});
