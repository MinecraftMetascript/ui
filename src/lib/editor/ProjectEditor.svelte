<script lang="ts">
	import Mirror from '$lib/editor/Mirror.svelte';
	import PreviewPicker from '$lib/editor/PreviewPicker.svelte';
	import { debounce } from 'es-toolkit';
	import { createEditorContext } from './MMSEditor.svelte';
	import Preview from './Preview.svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ChevronLeft, Dots, X } from '@steeze-ui/tabler-icons';
	import type { Action } from 'svelte/action';
	import type { Snippet } from 'svelte';
	import DeepslateRendererOffloaded from '../deepslate/offload/DeepslateRendererOffloaded.svelte';
	const editor = createEditorContext();

	const dragColumns: Action<HTMLElement, {}> = (node) => {
		let handles = node.querySelectorAll<HTMLButtonElement>('button[data-handle]');
		for (const handle of handles) {
			const targetEl = handle.previousElementSibling as HTMLElement | null;
			if (!targetEl) {
				if (handle) handle.disabled = true;
				continue;
			}
			if (!handle) {
				continue;
			}
			let offset = $state(0);
			let initialPosition = $state<{ x: number }>();
			let initialWidth = $state(0);
			handle.addEventListener('mousedown', (e: MouseEvent) => {
				initialPosition = { x: e.clientX };
				initialWidth = targetEl.getBoundingClientRect().width;

				window.addEventListener('mousemove', onMove);
			});
			const stop = () => {
				window.removeEventListener('mousemove', onMove);
			};
			window.addEventListener('mouseup', stop);

			const onMove = debounce((e: MouseEvent) => {
				if (!initialPosition) return;

				offset = initialPosition.x - e.clientX;
				targetEl.style.width = `${initialWidth - offset}px`;
			}, 5);

			handle.addEventListener('collapse', () => {
				targetEl.style.width = `0`;
			});
			handle.addEventListener('open', () => {
				targetEl.style.width = `${initialWidth - offset}px`;
			});
		}
		return {
			destroy() {
				stop();
			}
		};
	};
</script>

{#snippet handle()}
	<button
		class="disabled:cursor-default group flex h-full w-min flex-col items-center justify-center gap-4 disabled:text-slate-500 cursor-col-resize"
		data-handle
	>
		<hr class="flex-1 border-l border-dashed border-transparent group-hover:border-slate-700" />
		<Icon src={Dots} class="h-4 w-4 rotate-90" />
		<hr class="flex-1 border-l border-dashed border-transparent group-hover:border-slate-700" />
	</button>
{/snippet}
{#await editor.init()}
	Initializing your MMS Project...
{:then _}
	<div
		class="grid h-full min-h-0 w-full max-w-full"
		use:dragColumns={{ handle }}
		style:grid-template-columns="min-content min-content min-content min-content auto"
	>
		<aside
			class="flex h-full min-h-0 w-full flex-col gap-4 overflow-x-hidden bg-slate-100 px-2 py-1 font-mono text-sm text-ellipsis"
			data-col-name="sidebar"
		>
			<PreviewPicker />
		</aside>
		{@render handle()}
		<div class="min-h-0 w-full overflow-x-hidden">
			<Mirror />
		</div>
		{@render handle()}
		<div class="flex min-h-0 w-full flex-col overflow-x-hidden">
			<!-- <DeepslateRendererOffloaded /> -->
			<Preview />
		</div>
		<!-- TODO: Implement text preview panel here -->
	</div>
{/await}
