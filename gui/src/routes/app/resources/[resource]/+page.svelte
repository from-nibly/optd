<script lang="ts">
	export let data;
	console.log('data', data);
</script>

<table class="table">
	<thead>
		<tr>
			<th>namespace</th>
			<th>name</th>
			<th>labels</th>
		</tr>
	</thead>
	{#each data.resources as resource}
		<tr>
			<td>
				{resource.metadata.namespace}
			</td>
			<th>
				<a href="/app/resources/{data.currentKind}/{resource.metadata.name}">
					{resource.metadata.name}
				</a>
			</th>
			<td>
				{#each Object.keys(resource.metadata.labels) as label}
					<div class="badge badge-primary mr-2">
						{label}: {resource.metadata.labels[label]}
					</div>
				{/each}
			</td>
		</tr>
	{/each}
</table>
