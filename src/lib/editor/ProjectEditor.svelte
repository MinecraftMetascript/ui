<script lang="ts">
	import Mirror from '$lib/editor/Mirror.svelte';
	import PreviewPicker from '$lib/editor/PreviewPicker.svelte';
	import { onMount } from 'svelte';
	import { useEditorContext } from './MMSEditor.svelte';
	import { Pane, Splitpanes } from 'svelte-splitpanes';
	import * as v from 'valibot';
	import DeepslateRendererOffloaded, {
		SupportedPreviewTypes
	} from '../deepslate/DeepslateRendererOffloaded.svelte';
	import Preview from './Preview.svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { Download } from '@steeze-ui/tabler-icons';

	const editor = useEditorContext();
	const sizingSchema = v.object({
		picker: v.number(),
		center: v.number(),
		preview: v.number(),
		mirror: v.number(),
		textPreview: v.number()
	});
	let sizes = $state<v.InferOutput<typeof sizingSchema>>({
		picker: 15,
		center: 60,
		preview: 25,
		mirror: 80,
		textPreview: 20
	});
	onMount(() => {
		const s = localStorage.getItem('MMS:EditorPaneSizes');
		if (s) {
			try {
				sizes = v.parse(sizingSchema, JSON.parse(s));
			} catch {}
		}
	});

	$effect(() => {
		localStorage.setItem('MMS:EditorPaneSizes', JSON.stringify(sizes));
	});

	let showDeepslate = $derived(
		editor.previewSymbol && SupportedPreviewTypes.includes(editor.previewSymbol.kind)
	);
</script>

{#await editor.init()}
	Initializing your MMS Project...
{:then _}
	<Splitpanes
		dblClickSplitter={false}
		on:resized={(e) => {
			if (showDeepslate) {
				// The preview panel is popped out -- we can update the size
				sizes.center = e.detail[1].size;
				sizes.preview = e.detail[2].size;
			}
			sizes.picker = e.detail[0].size; // we can always update the picker
		}}
	>
		<Pane size={sizes.picker}>
			<aside
				class="flex h-full min-h-0 w-full flex-col gap-4 overflow-x-hidden bg-slate-100 px-2 py-1 font-mono text-sm text-ellipsis"
			>
				<button class="flex items-center gap-2" onclick={() => editor.project.download()}
					><Icon src={Download} class="w-4" /> Export</button
				>
				<PreviewPicker />
			</aside>
		</Pane>
		<Pane size={showDeepslate ? sizes.center : sizes.preview + sizes.center}>
			<Splitpanes
				horizontal
				on:resized={(e) => {
					sizes = { ...sizes, mirror: e.detail[0].size, textPreview: e.detail[1].size };
				}}
			>
				<Pane size={sizes.mirror}>
					<div class="max-h-full min-h-0 w-full overflow-x-hidden">
						<Mirror />
					</div>
				</Pane>
				<Pane size={sizes.textPreview}>
					<Preview />
				</Pane>
			</Splitpanes>
		</Pane>
		<Pane class="h-full" size={showDeepslate ? sizes.preview : 0}>
			<div class="flex h-full w-full flex-col overflow-x-hidden">
				<DeepslateRendererOffloaded />
				<!-- <Preview /> -->
			</div>
		</Pane>
		<!-- TODO: Implement text preview panel here -->
	</Splitpanes>
{/await}
