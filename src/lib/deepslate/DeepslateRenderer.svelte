<script lang="ts" module>
	export const SupportedPreviewKinds = ['WorldGen__Noise'];
</script>

<script lang="ts">
	import type { LeafNode } from '../tree/types';
	import * as deepslate from 'deepslate';

	let { node }: { node: LeafNode } = $props();

	const random = new deepslate.XoroshiroRandom([
		BigInt(Math.floor(performance.now())),
		BigInt(Math.floor(performance.timeOrigin))
	]);

	$effect(() => {
		if (!canvas) {
			console.warn('No Canvas');
			return;
		}
		if (!node || !node.data) {
			console.warn('No Node or Data');
			return;
		}
		const ctx = canvas.getContext('2d');
		if (!ctx) {
			console.warn('No Canvas 2d Context');
			return;
		}
		const box = canvas.getBoundingClientRect();
		switch (node.data?.kind) {
			case 'WorldGen__Noise': {
				try {
					const normalNoise = new deepslate.NormalNoise(random, node.data.value);
					for (let pixelX = 0; pixelX < box.width; pixelX++) {
						for (let pixelY = 0; pixelY < box.height; pixelY++) {
							ctx.fillStyle = `hsl(${normalNoise.sample(pixelX, pixelY, 0) * 360}, 50%, 50%)`;
							ctx.fillRect(pixelX, pixelY, 1, 1);
						}
					}
				} catch (e) {
					console.warn(e);
				}
			}
		}
	});

	let canvas = $state<HTMLCanvasElement | null>();
</script>

<canvas class="aspect-square h-full max-h-full w-full max-w-full" bind:this={canvas}></canvas>
