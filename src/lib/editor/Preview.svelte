<script lang="ts">
	import DeepslateRenderer, { SupportedPreviewKinds } from '../deepslate/DeepslateRenderer.svelte';
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

<div class="flex h-full min-h-0 w-full flex-col overflow-y-auto">
	<header class="flex items-end justify-between gap-4 px-2 py-1">
		<h2 class="text-xl leading-none font-bold">Preview</h2>
		{#if selectedPreview?.source === 'symbol'}
			<span class="font-mono text-sm leading-none italic">{previewSymbol?.type ?? ""}({previewTitle})</span
			>
		{:else if selectedPreview?.source === 'file'}
			<span class="font-mono text-xs leading-none italic">./{previewPath}{previewTitle}</span>
		{/if}
	</header>
	{#if selectedPreview && previewContent}
		<div class="relative flex h-full w-full items-start">
			<div
				{@attach preview(previewContent)}
				class="absolute w-full overflow-y-auto bg-white/90 text-xs"
				class:bottom-0={previewSymbol}
			></div>

			{#if previewSymbol && SupportedPreviewKinds.includes(previewSymbol.type)}
				<DeepslateRenderer symbol={previewSymbol} />
			{/if}
		</div>
	{/if}
</div>
