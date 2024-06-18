<script>
	import '../app.css';
</script>

<div class="app">
	<div class="drawer lg:drawer-open">
		<input id="my-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<div class="navbar bg-base-100 mb-32 shadow-xl text-neutral-content bg-primary">
				<label for="my-drawer" class="btn btn-primary drawer-button lg:hidden"
					><svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
						class="h-5 inline-block w-5"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
						></path></svg
					></label
				>
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
			<!-- Page content here -->
		</div>
		<div class="drawer-side">
			<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
			<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
				<!-- Sidebar content here -->

				<button
					class="btn btn-ghost bg-base-300 btn-circle z-50 top-0 right-0 mt-4 mr-2 absolute lg:hidden"
					><svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						aria-hidden="true"
						class="h-5 inline-block w-5"
						><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"
						></path></svg
					></button
				>
				<li class="mb-2 font-semibold text-xl">foobar</li>
			</ul>
		</div>
	</div>
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
</style>
