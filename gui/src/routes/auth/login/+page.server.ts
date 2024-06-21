import { fail, redirect, type Actions } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const payload = {
			username: form.get('username'),
			password: form.get('password')
		};

		const resp = await fetch('http://localhost:3000/api/auth/login', {
			body: JSON.stringify(payload),
			headers: {
				'Content-Type': 'application/json'
			},
			method: 'POST'
		});

		if (!resp.ok) {
			return fail(401, { error: 'Invalid username or password' });
		}

		const { access_token } = await resp.json();
		const contents = access_token.split('.')[1];
		const data = JSON.parse(atob(contents));
		const expires = new Date(data.exp * 1000);

		cookies.set('access_token', access_token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: false,
			domain: 'optd.localhost',
			expires
		});

		redirect(303, '/app');
	}
} satisfies Actions;
