<script lang="ts">
	import type { Snippet } from 'svelte';
	import { treeViewLevel } from './internal';
	import { slide } from 'svelte/transition';

	let {
		label,
		children
	}: {
		label: string | Snippet;
		children: Snippet;
	} = $props();

	const level = treeViewLevel();

	let visible = $state(true);
</script>

<button
	class="w-full overflow-x-hidden pr-2 text-left text-ellipsis hover:bg-black/25 flex gap-2 items-center"
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
		{@render children()}
	</div>
{/if}
