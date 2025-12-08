<script lang="ts">
	const { post } = $props();

	const {yamlConfig, postContent, date} = $derived(post);
</script>

<article>

	{#if yamlConfig?.title}
		<h1>{yamlConfig?.title}</h1>
	{/if}

	{#if date}
		<small>{date}</small>
	{/if}

	<p>
		{@html postContent}
	</p>

</article>
