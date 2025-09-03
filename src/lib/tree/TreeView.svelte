<script lang="ts">
	import { slide } from 'svelte/transition';
	import type { TreeNode } from './types';
	import TreeGroup from './TreeGroup.svelte';
	import TreeItem from './TreeItem.svelte';

	type Props = {
		nodes: TreeNode[];
		selectedPath: string[] | null;
		selectPath: (path: string[]) => unknown;
	};
	let { nodes, selectedPath, selectPath }: Props = $props();
</script>

{#snippet RenderNodes(nodes: TreeNode[], path: string[])}
	{#each nodes as child ([...path, child.name].join('.'))}
		{@const childPath = [...path, child.name]}
		{#if 'children' in child}
			<TreeGroup node={child} nodes={RenderNodes} path={childPath} />
		{:else}
			<TreeItem
				node={child}
				onclick={() => {
					console.log({childPath})
					selectPath(childPath);
				}}
				active={childPath.join('.') === selectedPath?.join('.')}
			/>
		{/if}
	{/each}
{/snippet}

{@render RenderNodes(nodes, [])}
