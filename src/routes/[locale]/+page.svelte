<script lang="ts">
	import { locale } from 'svelte-i18n';

	import {otherLocaleLinkStore} from "$lib/stores";
	import {page} from "$app/state";

	let { data } = $props();

	let { posts } = $derived(data);

	let nextLocale = $derived($locale === 'en' ? 'fr' : 'en');

	$effect(() => {
		otherLocaleLinkStore.set({
			url: page.url.pathname.replace(/^\/(fr|en)?(.*)$/i, `/${nextLocale}$2`),
			anchor: (nextLocale === 'en' ? '🇬🇧' : '🇫🇷')+" "+nextLocale.toUpperCase(),
		});
	});
</script>

{#each posts as post}
	<div class="mt-3">
		<small class="text-muted">{post.date}</small><br>
		<a href={post.url}>
			{post.yamlConfig.title}
		</a>
	</div>
{/each}
