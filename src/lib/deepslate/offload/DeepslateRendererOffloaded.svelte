<script lang="ts" module>
	export const SupportedPreviewTypes = ['DensityFunction', 'Noise'];
</script>

<script lang="ts">
	import type { MouseEventHandler } from 'svelte/elements';
	import DeepslateRenderWorker from './deepslate_render_worker?worker';
	import type { Action } from 'svelte/action';
	import {
		DeepslateRenderWorkerMessageSchema,
		type DeepslateRenderWorkerMessage,
		type Point
	} from './proto';
	import { parse } from 'valibot';
	import { debounce } from 'es-toolkit';
	import { useEditorContext } from '../../editor/MMSEditor.svelte';
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

	const editor = useEditorContext();

	const ds: Action<HTMLCanvasElement> = (canvas) => {
		const offscreen = canvas.transferControlToOffscreen();
		const worker = new DeepslateRenderWorker({ name: 'Deepslate' });
		const send = (m: DeepslateRenderWorkerMessage, opts?: Parameters<Worker['postMessage']>[1]) =>
			worker.postMessage(parse(DeepslateRenderWorkerMessageSchema, m), opts);

		offscreen.height = canvas.clientHeight;
		offscreen.width = canvas.clientWidth;
		send(
			{
				kind: 'init',
				canvas: offscreen
			},
			{ transfer: [offscreen] }
		);

		const resizeObserver = new ResizeObserver(
			debounce(() => {
				console.log('Resize detected');
				send({
					kind: 'update::canvas_dimensions',
					x: canvas.clientWidth,
					y: canvas.clientHeight
				});
			}, 250)
		);
		resizeObserver.observe(canvas);

		$effect(() => {
			if (editor.previewSymbol) {
				send({
					kind: 'update::preview',
					value: JSON.stringify(editor.previewSymbol.value),
					type: editor.previewSymbol.type
				});
			}
		});

		$effect(() => {
			for (const symbol of Object.values(editor.project.symbols ?? {})) {
				if (symbol.type === 'Noise') {
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

		const fetchValue = debounce(() => {
			send({
				kind: 'request::value_at_point',
				point: mousePos!
			});
		}, 25);
		$effect(() => {
			if (mousePos) fetchValue();
		});

		worker.addEventListener('message', (e) => {
			const message = parse(DeepslateRenderWorkerMessageSchema, e.data);
			switch (message.kind) {
				case 'response::value_at_point':
					mousePosLabel = {
						label: message.label,
						value: message.value.toFixed(2)
					};
			}
		});

		return {
			destroy() {
				resizeObserver.unobserve(canvas);
			}
		};
	};

	let scale = $state(8);
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
</script>

{#if editor.previewSymbol}
	<div class="relative h-full w-full">
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
				onclick={(e) => (e.shiftKey ? (scale += 6) : (scale += 2))}
			>
				<Icon src={Plus} class="w-6" />
			</button>
			<button
				class="bg-slate-600/50 text-slate-50 hover:bg-slate-600"
				onclick={(e) => {
					if (e.shiftKey) {
						if (scale > 12) scale -= 6;
						else if (scale > 6) scale = 6;
						else scale = 2;
					} else {
						if (scale > 2) scale -= 2;
					}
				}}
			>
				<Icon src={Minus} class="w-6" />
			</button>
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
			class="h-full w-full"
			use:ds
			onmousemove={updateMousePos}
			ondblclick={toggleMouseLock}
		></canvas>
	</div>
{/if}
