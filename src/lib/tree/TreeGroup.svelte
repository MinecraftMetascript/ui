<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { GroupNode, LeafNode, TreeNode } from './types';
	import type { Snippet } from 'svelte';

	type Props = {
		node: GroupNode;
		path: string[];
		nodes: Snippet<[nodes: TreeNode[], path: string[]]>;
	};

	let { node, path, nodes }: Props = $props();

	let collapsed = $state(node.collapsed ?? false);
</script>

<div class="group flex w-full flex-col justify-start px-2 py-0.5 text-sm">
	<button
		class="flex w-full items-center justify-start group-hover:bg-slate-200 hover:bg-slate-300"
		onclick={() => {
			collapsed = !collapsed;
		}}
	>
		<span>{node.name}/</span>
	</button>
	{#if !collapsed}
		<ul class="w-full pl-4 group-hover:bg-slate-200" transition:slide>
			{@render nodes(Object.values(node?.children ?? {}), path)}
		</ul>
	{/if}
</div>
