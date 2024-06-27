export const ssr = false;

export const load = async ({ fetch, params }: any) => {
	const kindName = params.resource;

	const kindResp = await fetch('http://optd.localhost:3000/api/meta/kind/' + kindName, {
		credentials: 'include'
	});
	const kind = await kindResp.json();

	console.log('kind', kind);

	let url = 'http://optd.localhost:3000/api/resources/' + kindName;

	const is_meta = kind.spec.is_meta;
	if (is_meta) {
		url = 'http://optd.localhost:3000/api/meta/' + kindName;
	}

	const resp = await fetch(url, {
		credentials: 'include'
	});
	const body = await resp.json();
	return {
		resources: body,
		currentKind: kindName
	};
};
