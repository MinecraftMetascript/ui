<script lang="ts" module>
	export const SupportedPreviewKinds = ['Noise'];
</script>

<script lang="ts">
	import type { MmsSymbol } from '@minecraftmetascript/mms-wasm';

	import * as deepslate from 'deepslate';
	import { debounce } from 'es-toolkit';
	import type { Action } from 'svelte/action';

	let { symbol }: { symbol: MmsSymbol } = $props();

	const deepslatePreview: Action<HTMLCanvasElement, MmsSymbol> = (
		canvas: HTMLCanvasElement,
		s: MmsSymbol
	) => {
		let symbol = s;

		const update = debounce(() => {
			const random = new deepslate.XoroshiroRandom([
				BigInt(Math.floor(performance.now())),
				BigInt(Math.floor(performance.timeOrigin))
			]);

			if (!canvas) {
				console.warn('No Canvas');
				return;
			}
			if (!symbol || !symbol.value) {
				console.warn('No Symbol or Value');
				return;
			}
			const ctx = canvas.getContext('2d');
			if (!ctx) {
				console.warn('No Canvas 2d Context');
				return;
			}
			// TypeScript
			const dpr = window.devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();

			// Set intrinsic size to match CSS size * DPR
			canvas.width = Math.floor(rect.width * dpr);
			canvas.height = Math.floor(rect.height * dpr);

			// Scale the context so 1 unit = 1 CSS pixel
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.scale(3, 3);

			switch (symbol.type) {
				case 'Noise': {
					requestAnimationFrame(() => {
						try {
							console.log(symbol.value);
							const normalNoise = new deepslate.NormalNoise(random, symbol.value as any);
							for (let pixelX = 0; pixelX < rect.width; pixelX += 1) {
								for (let pixelY = 0; pixelY < rect.height; pixelY += 1) {
									const val = normalNoise.sample(pixelX, pixelY, 0);
									const color = `hsl(0, ${val * 50 + 50}%, ${val * 20 + 40}%)`;
									ctx.fillStyle = color;
									ctx.fillRect(pixelX, pixelY, 1, 1);
								}
							}
						} catch (e) {
							console.warn(e);
						}
					});
				}
			}
		}, 250);

		update();

		window.addEventListener('resize', update);

		return {
			update(next: MmsSymbol) {
				symbol = next;
				update();
			},
			destroy() {
				window.removeEventListener('resize', update);
			}
		};
	};
</script>

<canvas class="h-full w-full" use:deepslatePreview={symbol}></canvas>
