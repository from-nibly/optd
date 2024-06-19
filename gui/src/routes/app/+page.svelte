<script lang="ts">
	import { onMount } from 'svelte';
	let Thing: any = undefined;
	onMount(async () => {
		Thing = (await import('./Thing.svelte')).default;
	});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" />
</svelte:head>

<section>
	<button class="btn btn-primary">Hello daisyUI</button>
	<svelte:component this={Thing} />
</section>
