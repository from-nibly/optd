export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const paylod = {
			username: form.get('username'),
			password: form.get('password')
		};

		const resp = await fetch('http://localhost:3000/api/auth/login', {
			body: JSON.stringify(paylod),
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});
		console.log('got stuff', resp);
		const { access_token } = await resp.json();
		const payload = access_token.split('.')[1];
		const data = JSON.parse(atob(payload));
		console.log('data', data);
		const expires = new Date(data.exp * 1000);
		console.log('expires', expires);

		cookies.set('access_token', access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false,
			domain: 'optd.localhost',
			expires
		});

		return {
			status: 307,
			body: {
				message: 'Hello, world!'
			}
		};
	}
};
