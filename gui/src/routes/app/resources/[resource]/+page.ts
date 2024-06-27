export const ssr = false;

export const load = async ({ fetch, params }: any) => {
	const kind = params.resource;
	console.log('got page', params.resource);

	const resp = await fetch('http://optd.localhost:3000/api/namespaces/foo/' + kind, {
		credentials: 'include'
	});
	const body = await resp.json();
	return {
		resources: body,
		currentKind: kind
	};
};
