<script lang="ts">
	import '../../app.css';
	import Navbar from './Navbar.svelte';
	import SidebarContent from './SidebarContent.svelte';
	import { page } from '$app/stores';
</script>

<div class="app">
	<div class="drawer lg:drawer-open">
		<input id="my-drawer" type="checkbox" class="drawer-toggle" />
		<div class="drawer-content">
			<Navbar />
			<main class="p-10">
				<!-- Page content here -->
				<slot />
			</main>
		</div>
		<div class="drawer-side">
			<label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"> </label>
			<ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
				<SidebarContent resources={$page.data.resources} />
			</ul>
		</div>
	</div>
</div>
