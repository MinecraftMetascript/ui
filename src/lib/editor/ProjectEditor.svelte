<script lang="ts">
	import Mirror from '$lib/editor/Mirror.svelte';
	import PreviewPicker from '$lib/editor/PreviewPicker.svelte';
	import { createEditorContext } from './MMSEditor.svelte';
	import Preview from './Preview.svelte';
	const editor = createEditorContext();
</script>

{#await editor.init()}
	Initializing your MMS Project...
{:then _}
	<div class="grid min-h-0 flex-1 grid-cols-12 grid-rows-1 gap-4">
		<aside
			class="col-span-3 flex h-full w-full flex-col gap-4 overflow-x-hidden bg-slate-100 px-2 py-1 font-mono text-sm text-ellipsis"
		>
			<PreviewPicker />
		</aside>
		<div class="col-span-6 min-h-0">
			<Mirror />
		</div>
		<div class="col-span-3 min-h-0">
			<Preview />
		</div>
		<!-- TODO: Implement text preview panel here -->
	</div>
{/await}
