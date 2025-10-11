<script lang="ts">
	import { groupBy } from 'es-toolkit';
	import { TreeView } from '$lib/treeview';
	import type { FileTreeLike } from '@minecraftmetascript/mms-wasm';
	import { useEditorContext } from './MMSEditor.svelte';

	const editor = useEditorContext();
	const project = editor.project;

	let selectedPath = $derived.by(() => {
		if (!editor.selectedPreview) return undefined;
		const out = [];
		out.push(editor.selectedPreview.source);
		out.push(...editor.selectedPreview.path);
		return out;
	});
</script>

<section class="w-full" data-selected-path={selectedPath?.join('.')}>
	<TreeView.Group name="file">
		{#snippet label()}
			<h2 class="font-bold uppercase">Files</h2>
		{/snippet}
		{#if project.fs?.isDir}
			{@render dir(project.fs, [project.fs?.name])}
		{/if}
	</TreeView.Group>
</section>
<section class="w-full" data-selected-path={selectedPath?.join('.')}>
	{#if project.symbols}
		<TreeView.Group name="symbol">
			{#snippet label()}
				<h2 class="font-bold uppercase">Symbols</h2>
			{/snippet}
			{#each Object.entries(project.symbols) as [namespace, nsSymbols]}
				<TreeView.Group>
					{#snippet label()}
						<span class="text-sm font-bold">{namespace}</span>
					{/snippet}

					{#each Object.entries(groupBy(Object.entries(nsSymbols), ([name, v]) => v.kind)) as [type, symbols]}
						<TreeView.Group label={type}>
							{#each symbols as [name, symbol]}
								<TreeView.Item
									{selectedPath}
									onclick={() => {
										editor.selectedPreview = { source: 'symbol', path: [symbol.ref] };
									}}
									label={symbol.ref}
								/>
							{/each}
						</TreeView.Group>
					{/each}
				</TreeView.Group>
			{/each}
		</TreeView.Group>
	{/if}
</section>
{#snippet f(fs: FileTreeLike & { isDir: false }, path: string[])}
	<TreeView.Item
		{selectedPath}
		label={fs.name}
		onclick={() => {
			console.log({ path });
			editor.selectedPreview = { path, source: 'file' };
		}}
	/>
{/snippet}

<!-- TODO: This will be it's own component -->
{#snippet dir(fs: FileTreeLike & { isDir: true }, path: string[])}
	<TreeView.Group label={fs.name} name={fs.name}>
		{#each Object.entries(fs?.children ?? {}) as [name, child]}
			<div>
				{#if child?.isDir}
					{@render dir(child, [...path, name])}
				{:else}
					{@render f(child, [...path, name])}
				{/if}
			</div>
		{/each}
	</TreeView.Group>
{/snippet}
