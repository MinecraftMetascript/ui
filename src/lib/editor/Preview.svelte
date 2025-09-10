<script lang="ts">
	import { preview } from '../preview.svelte';
	import { useEditorContext } from './MMSEditor.svelte';

	const editor = useEditorContext();

	let selectedPreview = $derived(editor.selectedPreview);
	let previewContent = $derived(editor.previewContent);
	let previewSymbol = $derived(editor.previewSymbol);

	let previewPath = $derived(
		`${selectedPreview?.path.slice(0, -1).join('/') ?? ''}${
			(selectedPreview?.path.length ?? 0) > 1 ? '/' : ''
		}`
	);
	let previewTitle = $derived(selectedPreview?.path.at(-1) ?? 'No preview selected');
</script>

<!-- Preview column -->
<div class="flex max-h-full min-h-0 w-full flex-1 flex-col overflow-y-auto">
	<header class="flex items-center justify-between gap-4 bg-slate-300 px-8 py-1">
		<h2 class="text-xl font-bold">Preview</h2>
		<p class="inline-flex items-center font-mono text-xs leading-none italic">
			{#if selectedPreview?.source === 'symbol'}
				{previewSymbol?.type ?? ''}
				<span class="ml-2 font-bold">{previewTitle}</span>
			{:else if selectedPreview?.source === 'file'}
				./{previewPath}
				<span class="text-sm leading-none font-bold">{previewTitle}</span>
			{/if}
		</p>
	</header>
	
	{#if selectedPreview && previewContent}
		<div class="relative flex h-full w-full flex-1">
			<div
				{@attach preview(previewContent)}
				class="w-full overflow-y-auto text-xs"
				class:bottom-0={previewSymbol}
			></div>
		</div>
	{/if}
</div>
