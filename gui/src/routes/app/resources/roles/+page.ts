export const ssr = false;

export const load = async ({ fetch, params }: any) => {
	const url = 'http://optd.localhost:3000/api/meta/roles';

	const resp = await fetch(url, {
		credentials: 'include'
	});
	const body = await resp.json();
	return {
		resources: body,
		currentKind: 'roles'
	};
};
