<script lang="ts">
	const submit = async (event: { currentTarget: EventTarget & HTMLFormElement }) => {
		const resp = await fetch(event.currentTarget.action, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
		});
		const { access_token } = await resp.json();
		const payload = access_token.split('.')[1];
		console.log('testing', atob(payload));
		const data = JSON.parse(atob(payload));
		console.log('data', data);
		const expires = new Date(data.exp * 1000).toUTCString();
		document.cookie = `access_token=${access_token}; HttpOnly; SameSite=Strict; path=/; Domain=optd.localhost; Expires=${expires};`;
		const resp2 = await fetch('http://optd.localhost:3000/api/meta/kinds', {
			credentials: 'include'
		});
		// fetch('http://optd.localhost:3000/api/meta/kinds', { credentials: 'include' }).then(
		// 	console.log
		// );
		console.log('resp', resp2);
	};
</script>

<div class="card bg-base-200 shadow-xl">
	<form class="card-body" method="POST" action="./login">
		<h2 class="card-title">Login</h2>

		<label class="input input-bordered flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-4 h-4 opacity-70"
				><path
					d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
				/></svg
			>
			<input name="username" type="text" class="grow bg-base-100" placeholder="Username" />
		</label>
		<label class="input input-bordered flex items-center gap-2">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="w-4 h-4 opacity-70"
				><path
					fill-rule="evenodd"
					d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
					clip-rule="evenodd"
				/></svg
			>
			<input name="password" type="password" class="grow bg-base-100" Placeholder="Password" />
		</label>
		<button class="btn btn-primary">Login</button>
	</form>
</div>
