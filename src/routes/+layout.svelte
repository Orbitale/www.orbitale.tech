<script lang="ts">
    import Layout from "$lib/UI/components/Layout.svelte";

    let { children } = $props();
</script>

<Layout>
    {@render children()}
</Layout>
