<script lang="ts">
	import { onMount } from 'svelte';
	import { MMSProject } from './MMSProject.svelte';
	import Mirror from './Mirror.svelte';
	import { type FileTreeLike } from '@mms/wasm';
	import { preview } from './preview.svelte';

	let project = $state<MMSProject>(new MMSProject());
	onMount(async () => {
		await project.init();
	});

	const getFile = (path: string[]) => {
		return path.reduce<FileTreeLike | null>((fs: FileTreeLike | null, name: string) => {
			if (fs?.isDir) {
				return fs.children?.[name] ?? null;
			} else {
				return fs;
			}
		}, project.fs);
	};

	let selectedPreview = $state<{ path: string[]; source: 'file' | 'symbol' } | null>(null);
	let previewContent = $derived.by(() => {
		if (!selectedPreview) return null;
		if (selectedPreview.source === 'symbol') {
			const symbol = project.symbols?.[selectedPreview.path[0]];
			if (!symbol) {
				console.log(symbol);
				return null;
			}

			const sourceFile = project.source[symbol.contentLocation.Filename] ?? '';
			return (
				JSON.stringify(
					{
						compiled: symbol.value,
						source: sourceFile.substring(
							symbol.contentLocation.StartIdx,
							symbol.contentLocation.StopIdx + 1
						)
					},
					null,
					2
				) ?? null
			);
		}
		const targetFile = getFile(selectedPreview.path);
		if (!targetFile || targetFile.isDir) return null;
		return targetFile.content;
	});
</script>

<div class="flex h-svh min-h-svh w-svw flex-col gap-8 px-8 pb-8">
	<header class="px-2 py-1">
		<h1 class="text-xl font-bold">Minecraft Metascript Demo Editor</h1>
		<p class="max-w-[100ch] text-xs">
			Minecraft Metascript (MMS) is a language for authoring Minecraft datapacks. It intends to
			provide a more concise and readable syntax compared to the default JSON format.
			<br />
			This page runs an instance of the MMS parser and serializer in your browser using WebAssembly.
			<br />
			This tool is <strong>NOT</strong> production ready.
		</p>
	</header>

	{#await project.init()}
		Initializing your MMS Project...
	{:then _}
		<div class="grid flex-1 grid-cols-5 gap-4">
			<aside class="col-span-1 flex h-full w-full flex-col gap-4 bg-slate-100 px-2 py-1">
				<section>
					<h2 class="font-bold uppercase">Project Files</h2>
					{#if project.fs?.isDir}
						{@render dir(project.fs, [])}
					{/if}
				</section>
				<section>
					<h2 class="font-bold uppercase">Project Files</h2>
					{#if project.symbols}
						{#each Object.entries(project.symbols) as [name, symbol]}
							<button
								class="block w-full px-2 text-left hover:bg-black/25"
								onclick={() => (selectedPreview = { source: 'symbol', path: [name] })}
							>
								{symbol.ref}
							</button>
						{/each}
					{/if}
				</section>
			</aside>
			<div class="col-span-4 flex flex-1 flex-col gap-4">
				<Mirror {project} />
				{#if previewContent}
					<h2 class="text-lg">
						Preview:
						<span class="text-sm text-slate-400"
							>{selectedPreview?.path.slice(0, -1).join('/')}{(selectedPreview?.path.length ?? 0) >
							1
								? '/'
								: ''}</span
						><span class="font-bold">{selectedPreview?.path.at(-1)}</span>
					</h2>
					<div {@attach preview(previewContent)} class="w-full text-sm"></div>
				{/if}
			</div>
			<!-- TODO: Implement text preview panel here -->
		</div>
	{/await}
</div>

{#snippet f(fs: FileTreeLike & { isDir: false }, path: string[])}
	<button
		class="block w-full pr-2 text-left hover:bg-black/25"
		style:padding-left="{path.length * 8 + 4}px"
		onclick={() => (selectedPreview = { path, source: 'file' })}
	>
		{fs.name}
	</button>
{/snippet}

<!-- TODO: This will be it's own component -->
{#snippet dir(fs: FileTreeLike & { isDir: true }, path: string[])}
	<button
		class="block w-full pr-2 text-left hover:bg-black/25"
		style:padding-left="{path.length * 8 + 4}px"
	>
		{fs.name}
	</button>
	{#each Object.entries(fs?.children ?? {}) as [name, child]}
		<div>
			{#if child?.isDir}
				{@render dir(child, [...path, name])}
			{:else}
				{@render f(child, [...path, name])}
			{/if}
		</div>
	{/each}
{/snippet}
