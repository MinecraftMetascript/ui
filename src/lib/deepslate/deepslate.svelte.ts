import type { MmsSymbol } from '@minecraftmetascript/mms-wasm';

import * as deepslate from 'deepslate';
import { debounce } from 'es-toolkit';
import type { Attachment } from 'svelte/attachments';
import type { ValueLookupFn } from './types';
import { densityFunctionPreview, noisePreview } from './previews.svelte';

export const deepslateCanvas: (params: {
	symbol: MmsSymbol;
	seed: [bigint, bigint];
	scale: number;
	setLookup: (fn: ValueLookupFn | null) => void;
	origin: { x: number; y: number };
}) => Attachment<HTMLCanvasElement> = (params) => {
	let dpr = window.devicePixelRatio || 1;

	return (canvas) => {
		let { symbol, seed, scale, setLookup, origin } = params;
		let rect = canvas.getBoundingClientRect();
		if (scale <= 0.5) scale = 0.5;
		// canvas.width = Math.round(rect.width * dpr);
		// canvas.height = Math.round(rect.height * dpr);
		const update = debounce(() => {
			updating = true;
			try {
				const random = new deepslate.XoroshiroRandom(seed);
				switch (symbol.type) {
					case 'DensityFunction':
						setLookup(
							densityFunctionPreview(canvas, symbol.value, random, {
								height: rect.height / scale,
								width: rect.width / scale,
								scale: scale,
								dpr: dpr,
								origin: origin
							})
						);
						break;
					case 'Noise':
						setLookup(
							noisePreview(canvas, symbol.value, random, {
								height: rect.height / scale,
								width: rect.width / scale,
								scale: scale,
								dpr: dpr,
								origin: origin
							})
						);
						break;
				}
			} finally {
				updating = false;
			}
		}, 200);
		update();

		let updating = false;
		const resizeObeserver = new ResizeObserver((els) => {
			if (updating) return;
			for (const el of els) {
				if (el.contentRect.width !== rect.width || el.contentRect.height !== rect.height) {
					resizeObeserver.unobserve(canvas);
					// console.log('Stop');
					// let rect = canvas.getBoundingClientRect();
					// rect = el.contentRect;
					// console.log('Start');

					update();
					setTimeout(() => resizeObeserver.observe(canvas), 500);
				}
			}
		});
		resizeObeserver.observe(canvas);
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('resize', update);
			resizeObeserver.disconnect();
		};
	};
};
