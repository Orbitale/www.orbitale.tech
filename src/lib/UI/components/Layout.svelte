<script lang="ts">
    import '../../../styles/app.scss';

    import bootstrapJsSrc from 'bootstrap/dist/js/bootstrap.bundle.js?url';
    import popperJsSrc from '@popperjs/core/dist/umd/popper.js?url';

    import Header from '$lib/UI/components/Header.svelte';
    import Footer from '$lib/UI/components/Footer.svelte';
    import { init } from '$lib/i18n';
    import {page} from "$app/state";

    let { children } = $props();

    let locale = $derived(page.params?.locale || 'en');

    init(locale);
    $effect(() => {
        locale.set(locale)
        init(locale);
    });
</script>

<svelte:head>
    <script src={popperJsSrc}></script>
    <script src={bootstrapJsSrc}></script>
</svelte:head>

<div class="wrapper py-3">

    <Header />

    <main>
        {@render children()}
    </main>

    <Footer />

</div>
