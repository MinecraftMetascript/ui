<script lang="ts" module>
	export const SupportedPreviewTypes = ['DensityFunction', 'Noise', 'NoiseSettings'];
</script>

<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import DeepslateRenderWorker from './worker/deepslate_render_worker?worker';
	import type { Action } from 'svelte/action';
	import {
		DeepslateRenderWorkerMessageSchema,
		type DeepslateRenderWorkerMessage,
		type Point
	} from './proto';
	import { parse } from 'valibot';
	import { debounce, throttle } from 'es-toolkit';
	import { useEditorContext } from '../editor/MMSEditor.svelte';
	import { Icon } from '@steeze-ui/svelte-icon';
	import {
		ArrowDown,
		ArrowLeft,
		ArrowRight,
		ArrowUp,
		Home,
		Lock,
		Minus,
		Plus
	} from '@steeze-ui/tabler-icons';
	import { pixelToCoordinate } from './lib';
	import { assets } from '$app/paths';

	const editor = useEditorContext();

	const ds: Action<HTMLCanvasElement> = (canvas: HTMLCanvasElement) => {
		const offscreen = canvas.transferControlToOffscreen();
		const worker = new DeepslateRenderWorker({ name: 'Deepslate' });
		const send = (m: DeepslateRenderWorkerMessage, opts?: Parameters<Worker['postMessage']>[1]) =>
			worker.postMessage(parse(DeepslateRenderWorkerMessageSchema, m), opts);
		let parent: HTMLElement = canvas;
		while (parent !== document.body && !('previewRoot' in parent.dataset)) {
			parent = parent.parentElement!;
		}

		offscreen.height = canvas.clientHeight;
		offscreen.width = canvas.clientWidth;
		send(
			{
				kind: 'init',
				canvas: offscreen,
				assetPath: assets
			},
			{ transfer: [offscreen] }
		);

		const resizeObserver = new ResizeObserver(
			debounce(() => {
				const box = parent.getBoundingClientRect();

				send({
					kind: 'update::canvas_dimensions',
					x: Math.floor(box.width),
					y: Math.floor(box.height)
				});
			}, 200)
		);
		resizeObserver.observe(parent, { box: 'device-pixel-content-box' });

		$effect(() => {
			if (editor.previewSymbol) {
				send({
					kind: 'update::preview',
					value: JSON.stringify(editor.previewSymbol.value),
					type: editor.previewSymbol.kind
				});
			}
		});

		$effect(() => {
			for (const nsSymbols of Object.values(editor.project.symbols ?? {})) {
				for (const symbol of Object.values(nsSymbols)) {
					if (symbol.kind === 'Noise') {
						const ref = symbol.ref.split(':');
						send({
							kind: 'injest::noise',
							ref: {
								namespace: ref[0],
								name: ref[1]
							},
							value: JSON.stringify(symbol.value)
						});
					}
				}
			}
		});

		$effect(() => {
			send({
				kind: 'update::view',
				origin: {
					x: originX,
					y: originY
				},
				scale,
				worldHeight,
				minY
			});
		});

		$effect(() => {
			send({
				kind: 'update::marker_pos',
				pos: mouseLocked ? mousePos : null
			});
		});

		const fetchValue = () => {
			send({
				kind: 'request::value_at_point',
				point: mousePos!
			});
		};
		$effect(() => {
			// We keep the editor.previewSymbol dependency
			// so that the value will refresh when the symbol is modified,
			//  without needing to unlock the mouse
			if (mousePos && editor.previewSymbol) fetchValue();
		});

		worker.addEventListener('message', (e) => {
			const message = parse(DeepslateRenderWorkerMessageSchema, e.data);
			switch (message.kind) {
				case 'response::value_at_point':
					mousePosLabel = {
						label: message.label,
						value: typeof message.value === 'number' ? message.value.toFixed(2) : message.value
					};
			}
		});

		return {
			destroy() {
				resizeObserver.unobserve(parent);
			}
		};
	};

	let scale = $state(8);

	const updateScale = throttle((delta: number) => {
		let next = scale;
		next += delta;
		next -= next % 2;
		if (next < 2) next = 1;
		scale = next;
	}, 50);
	let originX = $state(0);
	let originY = $state(0);
	let worldHeight = $state(256);
	let minY = $state(-64);
	let mousePos = $state<Point | null>(null);
	let mousePosLabel = $state<{ label: string; value: string } | null>(null);
	let mouseLocked = $state(false);

	const toggleMouseLock = () => {
		mouseLocked = !mouseLocked;
	};

	const updateMousePos: MouseEventHandler<HTMLCanvasElement> = (e) => {
		if (mouseLocked) return;
		const box = e.currentTarget.getBoundingClientRect();

		mousePos = pixelToCoordinate(
			{
				x: e.offsetX,
				y: e.offsetY
			},
			{
				x: originX,
				y: originY
			},
			{
				w: box.width,
				h: box.height
			},
			scale
		);
	};

	let prevMouse = $state<{ x: number; y: number } | null>(null);
	const drag = throttle((e: MouseEvent | PointerEvent) => {
		if (prevMouse) {
			const xDiff = (prevMouse?.x ?? 0) - e.pageX;
			const yDiff = e.pageY - (prevMouse?.y ?? 0);
			originX += Math.round(xDiff / scale);
			originY += Math.round(yDiff / scale);
		}
		prevMouse = { x: e.pageX, y: e.pageY };
	}, 20);

	const dragStart = () => {
		prevMouse = null;
		window.addEventListener('mousemove', drag);
		window.addEventListener('mouseup', dragEnd);
	};
	const dragEnd = () => {
		window.removeEventListener('mousemove', drag);
		window.removeEventListener('mouseup', dragEnd);
		prevMouse = null;
	};
</script>

{#if editor.previewSymbol}
	<div class="relative h-full max-h-full w-full overflow-y-hidden" data-preview-root>
		{#if mousePos}
			<div
				class="absolute top-2 right-2 flex items-center gap-2 bg-slate-600/50 px-2 py-1 font-mono text-xs font-bold text-slate-50"
			>
				{#if mouseLocked}
					<button onclick={() => toggleMouseLock()}>
						<Icon src={Lock} class="w-4" />
					</button>
				{/if}
				{#if mousePos}
					<span>X: {mousePos.x}</span>
					<span>Y: {mousePos.y}</span>
				{/if}
				{#if mousePosLabel}
					<span>{mousePosLabel.label}: {mousePosLabel.value}</span>
				{/if}
			</div>
		{/if}
		<div class="absolute top-2 left-2 flex items-center gap-2">
			<span class="bg-slate-600/50 px-1 py-0.5 text-sm font-bold text-slate-50">
				Scale {scale}:1
			</span>
			<button
				class="bg-slate-600/50 text-slate-50 hover:bg-slate-600"
				onclick={(e) => updateScale(e.shiftKey ? 6 : 2)}
			>
				<Icon src={Plus} class="w-6" />
			</button>
			<button
				class="bg-slate-600/50 text-slate-50 hover:bg-slate-600"
				onclick={(e) => updateScale(e.shiftKey ? -6 : -2)}
			>
				<Icon src={Minus} class="w-6" />
			</button>
		</div>
		<div class="absolute right-2 bottom-2 bg-slate-600/50 px-1 py-0.5 text-[0.5rem] text-slate-50">
			Preview powered by <a href="https://github.com/misode/deepslate" target="_blank">Deepslate</a>
		</div>

		<div class="absolute bottom-2 left-2 flex flex-col items-start gap-2">
			<span class="bg-slate-600/50 px-1 py-0.5 text-sm font-bold text-slate-50">
				Center: ({originX},{originY})
			</span>
			<div class="grid w-fit grid-cols-3 grid-rows-3 gap-1">
				<button
					class="col-start-1 row-start-2 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
					onclick={(e) => (originX -= e.shiftKey ? 10 : 1)}
				>
					<Icon src={ArrowLeft} class="w-6" />
				</button>
				<button
					class="col-start-3 row-start-2 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
					onclick={(e) => (originX += e.shiftKey ? 10 : 1)}
				>
					<Icon src={ArrowRight} class="w-6" />
				</button>
				<button
					class="col-start-2 row-start-1 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
					onclick={(e) => (originY += e.shiftKey ? 10 : 1)}
				>
					<Icon src={ArrowUp} class="w-6" />
				</button>
				<button
					class="col-start-2 row-start-3 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
					onclick={(e) => (originY -= e.shiftKey ? 10 : 1)}
				>
					<Icon src={ArrowDown} class="w-6" />
				</button>

				<button
					class="col-start-2 row-start-2 bg-slate-600/50 text-slate-50 hover:bg-slate-600"
					onclick={() => {
						originY = 0;
						originX = 0;
					}}
				>
					<Icon src={Home} class="w-6" />
				</button>
			</div>
		</div>

		<canvas
			use:ds
			onmousewheel={(e: WheelEvent) => {
				e.preventDefault();

				if (e.deltaY > 0) updateScale(-2);
				else updateScale(2);
			}}
			onmousemove={updateMousePos}
			ondblclick={toggleMouseLock}
			onmousedown={dragStart}
			class="cursor-grab"
			class:cursor-grabbing={prevMouse}
		>
		</canvas>
	</div>
{/if}
