import { type Writable, writable } from 'svelte/store';

export const otherLocaleLinkStore: Writable<null | { url: string, anchor: string }> = writable(null);
