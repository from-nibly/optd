import { browser } from '$app/environment';
import { type LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ url, fetch, params }: LoadEvent) => {
	if (browser) {
		console.log(document.cookie);
	} else {
		console.dir(params);
		console.log('checking params', params.__MY_COOKIE__);
	}

	console.log('testing');
	const resp = await fetch('http://optd.localhost:3000/api/meta/kinds', { credentials: 'include' });
	console.log('testing resp', resp);
	const body = await resp.json();
	console.log(body);
	return {
		resources: body
	};
};
