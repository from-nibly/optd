<script>
	import '../app.css';
	import Navbar from './Navbar.svelte';
</script>

<div class="app">
	<div class="drawer lg:drawer-open">
		<input id="my-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<Navbar />
			<main>
				<slot />
			</main>
			<!-- Page content here -->
		</div>
		<div class="drawer-side">
			<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"> </label>
			<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
				<!-- Sidebar content here -->
				<label
					for="my-drawer"
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
					></label
				>

				<li class="mb-2 font-semibold text-xl">OptD</li>
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
