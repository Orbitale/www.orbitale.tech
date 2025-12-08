<script>
    import Error from "$lib/UI/components/Error.svelte";

    import { page } from '$app/state';
</script>

<Error status={page.status} message={page.error.message} />
