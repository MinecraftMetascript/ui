<script lang="ts">
	import { groupBy } from 'es-toolkit';
	import { TreeView } from '$lib/treeview';
	import type { MMSProject } from '../MMSProject.svelte';
	import type { FileTreeLike } from '@minecraftmetascript/mms-wasm';
	import { useEditorContext } from './MMSEditor.svelte';

	const editor = useEditorContext();
	const project = editor.project;
</script>

<section class="w-full">
	<h2 class="font-bold uppercase">Project Files</h2>
	{#if project.fs?.isDir}
		{@render dir(project.fs, [])}
	{/if}
</section>
<section class="w-full">
	{#if project.symbols}
		<TreeView.Group>
			{#snippet label()}
				<h2 class="font-bold uppercase">Project Symbols</h2>
			{/snippet}
			{#each Object.entries(groupBy(Object.entries(project.symbols), ([name]) => name.split(':')[0])) as [namespace, nsSymbols]}
				<TreeView.Group label={namespace}>
					{#each Object.entries(groupBy(nsSymbols, ([k, v]) => v.type)) as [type, symbols]}
						<TreeView.Group label={type}>
							{#each symbols as [name, symbol]}
								<TreeView.Item
									onclick={() =>
										(editor.selectedPreview = { source: 'symbol', path: [name], symbol })}
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
		label={fs.name}
		onclick={() => (editor.selectedPreview = { path, source: 'file' })}
	/>
{/snippet}

<!-- TODO: This will be it's own component -->
{#snippet dir(fs: FileTreeLike & { isDir: true }, path: string[])}
	<TreeView.Group label={fs.name}>
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
