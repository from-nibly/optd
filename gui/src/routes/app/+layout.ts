import { browser } from '$app/environment';
import { type LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ url, fetch, params }: LoadEvent) => {
	if (!browser) {
		throw new Error('This route is client-side only');
	} else {
		console.dir(params);
	}

	const resp = await fetch('http://optd.localhost:3000/api/meta/kind', { credentials: 'include' });
	const body = await resp.json();
	return {
		kinds: body
	};
};
