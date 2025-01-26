import { render } from '@testing-library/svelte';
import { describe, it } from 'vitest';
import RootPage from './+page.svelte';

describe('RootPage', () => {
	it('should render without properties', async () => {
		render(RootPage);
	});
});
