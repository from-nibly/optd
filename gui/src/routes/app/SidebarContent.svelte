<script lang="ts">
	export let resources: any;
	console.log('resources', resources);
	const resourceItems: string[] = resources
		.filter((resource: any) => !resource.spec.is_meta)
		.map((resource: any) => resource.metadata.name);
	const metaItems: string[] = resources
		.filter((resource: any) => resource.spec.is_meta)
		.map((resource: any) => resource.metadata.name);
</script>

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
		><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg
	></label
>
<li class="mb-2 font-semibold text-2xl">OptD</li>
<li class="mb-2 font-semibold text-xl">Meta</li>
{#each metaItems as metaItem}
	<li class="ml-2 mb-2 font-semibold text-lg">
		<a href="/resources/{metaItem.toLowerCase()}">{metaItem}</a>
	</li>
{/each}
<li class="mb-2 font-semibold text-xl">Resources</li>
{#each resourceItems as resourceItem}
	<li class="ml-2 mb-2 font-semibold text-lg">
		<a href="/resources/{resourceItem.toLowerCase()}">{resourceItem}</a>
	</li>
{/each}
