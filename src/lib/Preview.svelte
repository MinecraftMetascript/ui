<script lang="ts">
	import DeepslateRenderer, { SupportedPreviewKinds } from './deepslate/DeepslateRenderer.svelte';
	import type { FileTreeItem } from './MMSInterop.svelte';
	import TreeView from './tree/TreeView.svelte';
	import type { GroupNode, LeafNode, TreeNode } from './tree/types';

	type Props = {
		files: FileTreeItem | null;
		symbols: any;
	};

	let { files, symbols }: Props = $props();

	let selectedPath = $state<string[] | null>(null);

	const translateFile = (node: FileTreeItem): TreeNode => {
		if (node.isDir) {
			return {
				name: node.name,
				children: Object.fromEntries(
					Object.entries(node.children ?? {}).map(([key, value]) => [key, translateFile(value)])
				) as GroupNode['children']
			};
		} else {
			return {
				name: node.name,
				content: node.content,
				data: node.data
			};
		}
	};
	let fileTree = $derived.by<GroupNode | null>(() => {
		if (!files) return null;
		if ('content' in files) {
			return {
				name: '-',
				children: {
					[files.name]: translateFile(files)
				}
			};
		} else {
			return translateFile(files) as GroupNode;
		}
	});

	let previewContent = $derived.by((): LeafNode | null => {
		if (!selectedPath) return null;

		let current = selectedPath[0] === 'file' ? fileTree : symbols;
		for (let name of selectedPath.slice(2)) {
			if (!current) return null;
			if (current.children) {
				current = current.children[name];
			} else {
				return current;
			}
		}
		if (!current?.isDir) {
			return current;
		}
		return null;
	});

	let viewMode = $state<'content' | 'preview'>('content');
	let previewSupported = $derived(SupportedPreviewKinds.includes(previewContent?.data?.kind ?? ''));
	$effect(() => {
		if (!previewSupported && viewMode === 'preview') viewMode = 'content';
	});
</script>

<section class="flex justify-between gap-2">
	<aside class="w-fit pl-4">
		<h2 class="py-0.5 text-base font-bold uppercase">Project Files</h2>

		<TreeView
			nodes={fileTree ? [fileTree] : []}
			selectedPath={selectedPath?.slice(1) ?? null}
			selectPath={(path: string[]) => (selectedPath = ['file', ...path])}
		/>
	</aside>
	<div class="flex h-full w-full flex-col items-center justify-center">
		{#if previewContent}
			<h2 class="px-2 py-0.5 text-sm font-bold uppercase">{previewContent.name}</h2>
			<div class="flex gap-4">
				<button
					class="border border-slate-700 px-1 py-0.5 text-slate-700"
					class:bg-slate-300={viewMode === 'content'}
					onclick={() => (viewMode = 'content')}>File Content</button
				>
				<button
					disabled={!previewSupported}
					class="border border-slate-700 px-1 py-0.5 text-slate-700 disabled:border-slate-300 disabled:text-slate-300"
					class:bg-slate-300={viewMode === 'preview'}
					onclick={() => (viewMode = 'preview')}>Preview</button
				>
			</div>
			{#if viewMode === 'content'}
				<pre class="h-full w-full">{previewContent.content}</pre>
			{:else if viewMode === 'preview'}
				<div class="h-full w-full p-4">
					<DeepslateRenderer node={previewContent} />
				</div>
			{/if}
		{:else}
			<p>No file selected</p>
		{/if}
	</div>
</section>
