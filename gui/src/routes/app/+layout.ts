import { redirect, type LoadEvent } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }: LoadEvent) => {
	//if not logged in
};
