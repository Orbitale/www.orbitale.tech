<script>
	import { _, locale } from 'svelte-i18n';

	import { otherLocaleLinkStore } from '$lib/stores';

	let link = $derived($otherLocaleLinkStore);
</script>

<header>
	<div class="d-flex flex-column flex-md-row align-items-center pb-3 mb-4 border-bottom">

		<a href={'/'+$locale} class="d-flex align-items-center link-body-emphasis text-decoration-none">
			{$_('nav.home')}
		</a>

		<nav class="d-inline-flex mt-2 mt-md-0 ms-md-auto">

			{#if link}
				<a class="me-3 py-2 btn btn-link link-body-emphasis text-decoration-none" href={link.url}>
					{link.anchor}
				</a>
			{/if}

			<!--	<a class="me-3 py-2 link-body-emphasis text-decoration-none" href="#">-->
			<!--		Link 2-->
			<!--	</a>-->

		</nav>

	</div>
</header>
