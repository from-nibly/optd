<script lang="ts">
	export let data;

	console.log('data individual', data);
	const multiline = JSON.stringify(data.resource, null, 4);
	const lines = multiline.split('\n');
</script>

<div class="mockup-code">
	<pre>
	{#each lines as line, i}
			<pre data-prefix={i + 1}>{line}</pre>
		{/each}
  </pre>
</div>
