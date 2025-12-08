<script>
    import { _ } from 'svelte-i18n';

    const { status,  message } = $props();

    const emojis = {
        404: '😟',
        418: '🍵',
        420: '🫠',
        500: '💥',
        503: '🦄',
    };
</script>

<h1>{status}</h1>
<p><strong>
    {message}
    {emojis[status] ?? emojis[500]}
</strong></p>

{#if page.status === 404}
    <p>{$_('error.404.txt1')}</p>
    <p>{$_('error.404.txt2')}</p>
{/if}

<p>🌑 🌒 🌓 🌔 🌕 🌖 🌗 🌘 🌑</p>
