<script lang="ts">
	import { Circle, CircleCheck } from '@steeze-ui/tabler-icons';
	import { treeViewLevel } from './internal';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { TransitionConfig } from 'svelte/transition';
	import { linear, sineIn } from 'svelte/easing';

	let {
		label,
		onclick,
		name,
		selectedPath
	}: { label: string; selectedPath?: string[]; name?: string; onclick: () => void } = $props();
	const { level, path } = treeViewLevel(name ?? label);

	let active = $derived(selectedPath?.join('..') === path.join('..'));

	const spinIn = (_: HTMLElement): TransitionConfig => ({
		duration: 300,
		css: (t) => {
			const hold = 'width: fit-content; height: fit-content;';
			const spin = `transform: rotate(${sineIn(t)}turn); `;
			const fade = `opacity: ${linear(t)}`;
			return `${hold} ${spin} ${fade}`;
		}
	});
</script>

<button
	class="
		grid
		w-full
		grid-cols-[min-content_1fr]
		overflow-x-hidden
		pr-1
		text-left
		text-ellipsis
		{active ? 'bg-slate-500/40' : 'hover:bg-black/25'}
		items-center"
	{onclick}
>
	<div class="grid grid-cols-1 grid-rows-1">
		{#key active}
			<div transition:spinIn class="col-start-1 row-start-1">
				<Icon src={active ? CircleCheck : Circle} class="w-4" />
			</div>
		{/key}
	</div>

	<span style:padding-left="{4 + level * 8}px">
		{label}
	</span>
</button>
