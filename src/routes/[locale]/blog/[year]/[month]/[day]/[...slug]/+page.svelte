<script lang="ts">
	import type { PageProps } from '../../../../../../../../.svelte-kit/types/src/routes';
	import Post from '$lib/UI/components/Post.svelte';
	import { otherLocaleLinkStore } from '$lib/stores';

	let { data }: PageProps = $props();

	let post = $derived(data);

	$effect(() => {
		otherLocaleLinkStore.set(post?.otherLanguagePostUrl || null);
	});
</script>

<svelte:head>
	<title>{post.yamlConfig?.title||'Blog'}</title>
	<meta name="title" content={post.yamlConfig?.title || 'Blog'} />
</svelte:head>

<Post post={post} />
