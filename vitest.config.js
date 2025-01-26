import { sveltekit } from '@sveltejs/kit/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit(), svelteTesting()],
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['./vitest-setup.ts'],
		include: ['src/**/*.{test,spec}.{js,ts}', 'tests/**/*.{test,spec}.{js,ts}'],
		coverage: {
			reportsDirectory: './coverage',
			provider: 'v8', // 'v8' or 'istanbul'
			reporter: ['text', 'clover', 'json'],
			include: ['src/**']
		},
		outputFile: {
			json: './coverage/coverage.json',
			junit: './coverage/junit.xml',
			clover: './coverage/clover.xml'
		}
	}
});
