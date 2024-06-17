<script>
	import '../app.css';
</script>

<div class="app">
	<div class="navbar bg-base-100 mb-32 shadow-xl rounded-box">
		<div class="flex-1">
			<a class="btn btn-ghost text-xl text-white" href="/">OptD</a>
		</div>
		<div class="flex-none gap-2">
			<div class="form-control">
				<input type="text" placeholder="Search" class="input input-bordered w-24 md:w-auto" />
			</div>
			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<img
							alt="Tailwind CSS Navbar component"
							src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
						/>
					</div>
				</div>
				<ul
					class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a class="justify-between" href="/">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/">Settings</a></li>
					<li><a href="/">Logout</a></li>
				</ul>
			</div>
		</div>
	</div>
	<main>
		<slot />
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
