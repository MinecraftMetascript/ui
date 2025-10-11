<script lang="ts">
	import type { Snippet } from 'svelte';
	import { treeViewLevel } from './internal';
	import { slide } from 'svelte/transition';

	let {
		label,
		children,
		name,
		root
	}: {
		label: string | Snippet;
		children: Snippet<[string[]]>;
		name?: string;
		root?: string[];
	} = $props();

	const { level, path } = treeViewLevel(name, root);

	let visible = $state(true);
</script>

<button
	data-path={path.join('.')}
	class="flex w-full items-center gap-2 overflow-x-hidden pr-2 text-left text-ellipsis hover:bg-black/25"
	style:padding-left="{4 + level * 8}px"
	onclick={() => (visible = !visible)}
>
	<span class="text-xs font-light">{visible ? '-' : '+'}</span>
	{#if typeof label === 'string'}
		{label}
	{:else}
		{@render label()}
	{/if}
</button>

{#if visible}
	<div transition:slide>
		{@render children(path)}
	</div>
{/if}
