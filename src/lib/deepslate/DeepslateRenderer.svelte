<script lang="ts" module>
	export const SupportedPreviewKinds = ['Noise', 'DensityFunction'];
</script>

<script lang="ts">
	import type { MmsSymbol } from '@minecraftmetascript/mms-wasm';

	import { MMSProject } from '../MMSProject.svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { Icon } from '@steeze-ui/svelte-icon';
	import {
		ArrowDown,
		ArrowLeft,
		ArrowRight,
		ArrowUp,
		Lock,
		Minus,
		Plus
	} from '@steeze-ui/tabler-icons';
	import { deepslateCanvas } from './deepslate.svelte';
	import type { ValueLookupFn } from './types';

	let { symbol }: { symbol: MmsSymbol; project: MMSProject } = $props();
	let seed = [
		BigInt(Math.floor(performance.now())),
		BigInt(Math.floor(performance.timeOrigin))
	] as [bigint, bigint];

	let scale = $state(20);
	let originX = $state(0);
	let originY = $state(0);
	let origin = $derived({ x: originX, y: originY });
	let worldHeight = $state(256);

	let mousePos = $state<{ x: number; y: number } | null>(null);
	let valueLookupFn = $state<ValueLookupFn | null>(null);
	let lookupLabel = $derived.by(() => (mousePos && valueLookupFn ? valueLookupFn(mousePos) : null));

	let mouseLocked = $state(false);
	const updateMousePos: MouseEventHandler<HTMLCanvasElement> = (e) => {
		if (mouseLocked) return;
		const box = e.currentTarget.getBoundingClientRect();
		mousePos = {
			x: Math.floor((e.pageX - box.left) / scale),
			y: Math.floor((box.height - (e.pageY - box.top)) / scale)
		};
	};
	const clearMousePos = () => {
		if (mouseLocked) return;
		mousePos = null;
	};

	const toggleMouseLock = () => {
		mouseLocked = !mouseLocked;
	};
</script>

<div class="relative h-full w-full">
	{#if mousePos || lookupLabel}
		<div
			class="absolute top-2 right-2 flex items-center gap-2 bg-slate-700 px-2 py-1 font-mono text-sm text-slate-50"
		>
			{#if mouseLocked}
				<Icon src={Lock} class="w-4" />
			{/if}
			{#if mousePos}
				<span>X: {mousePos?.x + origin.x}</span>
				<span>Y: {mousePos?.y + origin.y}</span>
			{/if}
			{#if lookupLabel}
				<span>{lookupLabel?.label}: {lookupLabel?.value}</span>
			{/if}
		</div>
	{/if}
	<div class="absolute top-2 left-2 flex flex-col items-center gap-2">
		<button class="bg-slate-600/50 text-slate-50 hover:bg-slate-600" onclick={() => scale++}>
			<Icon src={Plus} class="w-6" />
		</button>
		<button class="bg-slate-600/50 text-slate-50 hover:bg-slate-600" onclick={() => scale--}>
			<Icon src={Minus} class="w-6" />
		</button>
	</div>

	<div class="absolute bottom-2 left-2 grid grid-cols-3 grid-rows-3">
		<button
			class="col-start-2 row-start-1 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
			onclick={() => (originY += scale * 5)}
		>
			<Icon src={ArrowUp} class="w-6" />
		</button>
		<button
			class="col-start-1 row-start-2 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
			onclick={() => (originX -= scale * 5)}
		>
			<Icon src={ArrowLeft} class="w-6" />
		</button>
		<button
			class="col-start-3 row-start-2 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
			onclick={() => (originX += scale * 5)}
		>
			<Icon src={ArrowRight} class="w-6" />
		</button>
		<button
			class="col-start-2 row-start-3 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
			onclick={() => (originY -= scale * 5)}
		>
			<Icon src={ArrowDown} class="w-6" />
		</button>
	</div>
	<canvas
		class="h-full w-full cursor-pointer"
		{@attach deepslateCanvas({
			symbol,
			seed,
			scale,
			origin,
			setLookup(fn) {
				valueLookupFn = fn;
			}
		})}
		onmousemove={updateMousePos}
		onmouseout={clearMousePos}
		onblur={clearMousePos}
		onclick={toggleMouseLock}
		onmousedown={() => {
			originX++;
		}}
	></canvas>
</div>
